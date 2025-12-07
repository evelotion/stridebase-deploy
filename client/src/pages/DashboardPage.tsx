// File: client/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Fade } from "react-awesome-reveal";
import {
  getUserBookings,
  getUserAddresses,
  getLoyaltyData,
  getRedeemedPromos,
  redeemLoyaltyPoints,
  addUserAddress,
  deleteUserAddress,
  updateUserProfile,
  createReview,
  uploadImage,
} from "../services/apiService";
import API_BASE_URL from "../apiConfig";
import "./HomePageElevate.css";

// --- HELPER: SAFE RENDER ---
const safeRender = (data, fallback = "-") => {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") {
    if (data.count !== undefined) return data.count;
    if (data.name !== undefined) return data.name;
    return fallback;
  }
  return data;
};

// --- HELPER AVATAR ---
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
};

const DashboardPage = ({ showMessage }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    transactions: [],
  });
  const [redeemedPromos, setRedeemedPromos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State UI & Form
  const [activeTab, setActiveTab] = useState("history");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);

  // Form States
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phoneNumber: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });
  const [profileData, setProfileData] = useState({ name: "" });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImageUrl, setReviewImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsData, addressesData, loyalty, promos, statsRes] =
        await Promise.all([
          getUserBookings().catch(() => []),
          getUserAddresses().catch(() => []),
          getLoyaltyData().catch(() => ({ points: 0, transactions: [] })),
          getRedeemedPromos().catch(() => []),
          fetch(`${API_BASE_URL}/api/users/stats`, { headers })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null),
        ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
      setLoyaltyData(loyalty || { points: 0, transactions: [] });
      setRedeemedPromos(Array.isArray(promos) ? promos : []);
      setStats(statsRes);
    } catch (error) {
      if (error.message?.includes("401")) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setProfileData({ name: userData.name });
    setNewAddress((prev) => ({ ...prev, recipientName: userData.name }));
    fetchDashboardData();

    const socket = io(
      import.meta.env.PROD ? import.meta.env.VITE_API_PRODUCTION_URL : "/",
      { query: { userId: userData.id } }
    );
    socket.on("bookingUpdated", (updated) =>
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updated.id ? { ...b, status: updated.status } : b
        )
      )
    );
    return () => socket.disconnect();
  }, [navigate]);

  // --- HANDLERS ---
  const handleContinuePayment = (id) => navigate(`/payment-simulation/${id}`);
  const handleRedeemPoints = async () => {
    if (!confirm("Tukarkan 100 poin?")) return;
    try {
      const data = await redeemLoyaltyPoints(100);
      showMessage(data.message);
      fetchDashboardData();
    } catch (e) {
      showMessage(e.message, "Error");
    }
  };
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await addUserAddress(newAddress);
      setAddresses([data, ...addresses]);
      setShowAddressModal(false);
      showMessage("Alamat tersimpan!");
    } catch (e) {
      showMessage(e.message, "Error");
    }
  };
  const handleDeleteAddress = async (id) => {
    if (!confirm("Hapus?")) return;
    try {
      await deleteUserAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      showMessage("Dihapus.");
    } catch (e) {
      showMessage(e.message, "Error");
    }
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        bookingId: reviewingBooking.id,
        storeId: reviewingBooking.storeId,
        rating,
        comment,
        imageUrl: reviewImageUrl,
      });
      showMessage("Ulasan terkirim!");
      setShowReviewModal(false);
      fetchDashboardData();
    } catch (e) {
      showMessage(e.message, "Error");
    }
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadImage(fd);
      setReviewImageUrl(res.imageUrl);
    } catch (e) {
      showMessage(e.message, "Error");
    } finally {
      setIsUploading(false);
    }
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await updateUserProfile(profileData);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      showMessage("Profil diperbarui!");
    } catch (e) {
      showMessage(e.message, "Error");
    }
  };

  // Filter & Pagination Logic
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    if (bookingFilter === "processing")
      return ["confirmed", "in_progress"].includes(b.status);
    if (bookingFilter === "completed")
      return ["completed", "reviewed"].includes(b.status);
    if (bookingFilter === "pending") return b.status === "pending";
    return true;
  });
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* --- RENDER DESKTOP (LEGACY SIDEBAR) --- */
  const renderDesktop = () => (
    <div className="he-dashboard-wrapper d-none d-lg-block">
      <div className="container">
        <div className="row g-5">
          {/* LEFT SIDEBAR (NAVIGATION) */}
          <div className="col-lg-3">
            <Fade direction="left" triggerOnce>
              <div className="he-dash-sidebar">
                <div className="he-dash-user-profile">
                  <div className="he-dash-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <h5 className="fw-bold mb-1 text-white">{user?.name}</h5>
                  <p className="text-white-50 small mb-0">{user?.email}</p>
                </div>

                <button
                  className={`he-dash-nav-item ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <i className="fas fa-history"></i> My Bookings
                </button>
                <button
                  className={`he-dash-nav-item ${
                    activeTab === "loyalty" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("loyalty")}
                >
                  <i className="fas fa-gem"></i> Loyalty Points
                </button>
                <button
                  className={`he-dash-nav-item ${
                    activeTab === "addresses" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("addresses")}
                >
                  <i className="fas fa-map-marker-alt"></i> Addresses
                </button>
                <button
                  className={`he-dash-nav-item ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="fas fa-user-cog"></i> Settings
                </button>

                <div className="mt-5 pt-4 border-top border-secondary">
                  <Link
                    to="/store"
                    className="he-btn-primary-glow w-100 justify-content-center"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <i className="fas fa-plus me-2"></i> New Order
                  </Link>
                </div>
              </div>
            </Fade>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-lg-9">
            <Fade direction="up" triggerOnce>
              {/* HEADER STATS */}
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="he-stat-card">
                    <div className="he-stat-icon he-icon-blue">
                      <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div>
                      <div className="text-white-50 small text-uppercase">
                        Total Orders
                      </div>
                      <h3 className="mb-0 fw-bold text-white">
                        {safeRender(stats?.totalOrders, bookings.length)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="he-stat-card">
                    <div className="he-stat-icon he-icon-green">
                      <i className="fas fa-wallet"></i>
                    </div>
                    <div>
                      <div className="text-white-50 small text-uppercase">
                        Spent
                      </div>
                      <h3 className="mb-0 fw-bold text-white">
                        Rp{" "}
                        {safeRender(stats?.totalSpent, 0).toLocaleString(
                          "id-ID"
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="he-stat-card">
                    <div className="he-stat-icon he-icon-gold">
                      <i className="fas fa-crown"></i>
                    </div>
                    <div>
                      <div className="text-white-50 small text-uppercase">
                        Points
                      </div>
                      <h3 className="mb-0 fw-bold text-warning">
                        {safeRender(loyaltyData?.points, 0)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTENT PANELS (DESKTOP) */}
              <div className="he-dash-content-panel">
                {activeTab === "history" && (
                  <>
                    <div className="he-dash-header">
                      <h4 className="fw-bold mb-0 text-white">Order History</h4>
                      <div className="he-filter-btn-group">
                        {["all", "pending", "processing", "completed"].map(
                          (f) => (
                            <button
                              key={f}
                              className={`he-filter-btn-sm ${
                                bookingFilter === f ? "active" : ""
                              }`}
                              onClick={() => setBookingFilter(f)}
                            >
                              {f}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="he-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentBookings.length > 0 ? (
                            currentBookings.map((b) => (
                              <tr key={b.id}>
                                <td className="text-white-50">
                                  #{b.id.slice(-4)}
                                </td>
                                <td>
                                  <div className="fw-bold">
                                    {safeRender(b.service)}
                                  </div>
                                  <small className="text-white-50">
                                    {safeRender(b.storeName)}
                                  </small>
                                </td>
                                <td>
                                  {new Date(b.scheduleDate).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`he-badge ${
                                      b.status === "completed"
                                        ? "he-badge-success"
                                        : b.status === "pending"
                                        ? "he-badge-warning"
                                        : "he-badge-info"
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </td>
                                <td className="text-end">
                                  {b.status === "pending" ? (
                                    <button
                                      className="btn btn-sm btn-danger rounded-pill"
                                      onClick={() =>
                                        handleContinuePayment(b.id)
                                      }
                                    >
                                      Pay
                                    </button>
                                  ) : b.status === "completed" ? (
                                    <button
                                      className="btn btn-sm btn-outline-light rounded-pill"
                                      onClick={() => {
                                        setReviewingBooking(b);
                                        setShowReviewModal(true);
                                      }}
                                    >
                                      Review
                                    </button>
                                  ) : (
                                    <Link
                                      to={`/track/${b.id}`}
                                      className="btn btn-sm btn-outline-primary rounded-pill"
                                    >
                                      Track
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="text-center py-5 text-white-50"
                              >
                                No orders found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {/* ... (Other tabs logic same as before but rendered for desktop) ... */}
                {activeTab === "addresses" && (
                  <>
                    <div className="he-dash-header">
                      <h4 className="fw-bold mb-0 text-white">
                        Saved Addresses
                      </h4>
                      <button
                        className="he-btn-glass btn-sm"
                        onClick={() => setShowAddressModal(true)}
                      >
                        + Add New
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {addresses.map((a) => (
                        <div key={a.id} className="he-stat-card p-3">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="he-badge he-badge-info">
                                {a.label}
                              </span>
                              <span className="fw-bold text-white">
                                {a.recipientName}
                              </span>
                            </div>
                            <p className="mb-0 text-white-50 small">
                              {a.fullAddress}, {a.city}
                            </p>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => handleDeleteAddress(a.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === "profile" && (
                  <div className="mx-auto" style={{ maxWidth: "500px" }}>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="mb-4">
                        <label className="he-form-label">Full Name</label>
                        <input
                          className="he-form-control"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <label className="he-form-label">Email</label>
                        <input
                          className="he-form-control text-muted"
                          value={user?.email}
                          disabled
                        />
                      </div>
                      <button className="he-btn-primary-glow w-100 justify-content-center">
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );

  /* --- RENDER MOBILE (NATIVE APP FEEL) --- */
  const renderMobile = () => (
    <div className="he-mobile-dash-wrapper d-lg-none">
      {/* 1. HEADER PROFILE (COMPACT) */}
      <div className="he-mobile-dash-header">
        <div className="d-flex align-items-center gap-3">
          <div className="he-mobile-avatar">{getInitials(user?.name)}</div>
          <div>
            <div className="he-mobile-welcome">Hello,</div>
            <h4 className="he-mobile-username">{user?.name}</h4>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="he-mobile-logout-btn"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>

      {/* 2. QUICK STATS (HORIZONTAL SCROLL) */}
      <div className="he-mobile-stats-scroll">
        <div className="he-mobile-stat-card blue">
          <div className="icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="val">
            {safeRender(stats?.totalOrders, bookings.length)}
          </div>
          <div className="lbl">Orders</div>
        </div>
        <div className="he-mobile-stat-card gold">
          <div className="icon">
            <i className="fas fa-gem"></i>
          </div>
          <div className="val">{safeRender(loyaltyData?.points, 0)}</div>
          <div className="lbl">Points</div>
        </div>
        <div className="he-mobile-stat-card green">
          <div className="icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="val">
            Rp {Math.floor(safeRender(stats?.totalSpent, 0) / 1000)}k
          </div>
          <div className="lbl">Spent</div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION (PILLS) */}
      <div className="he-mobile-tabs-container">
        {["history", "loyalty", "addresses", "profile"].map((tab) => (
          <button
            key={tab}
            className={`he-mobile-pill-tab ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 4. CONTENT AREA */}
      <div className="he-mobile-dash-content pb-5 mb-5">
        {/* HISTORY: CARD STACK */}
        {activeTab === "history" && (
          <div className="d-flex flex-column gap-3">
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <div key={b.id} className="he-mobile-order-card">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="order-id">#{b.id.slice(-4)}</div>
                      <div className="order-service">
                        {safeRender(b.service)}
                      </div>
                    </div>
                    <span
                      className={`he-badge ${
                        b.status === "completed"
                          ? "he-badge-success"
                          : b.status === "pending"
                          ? "he-badge-warning"
                          : "he-badge-info"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-end mt-2">
                    <div className="order-meta">
                      <i className="far fa-calendar me-1"></i>{" "}
                      {new Date(b.scheduleDate).toLocaleDateString("id-ID")}{" "}
                      <br />
                      <i className="fas fa-store me-1"></i>{" "}
                      {safeRender(b.storeName)}
                    </div>
                    <div>
                      {b.status === "pending" ? (
                        <button
                          className="btn btn-sm btn-danger rounded-pill px-3"
                          onClick={() => handleContinuePayment(b.id)}
                        >
                          Pay
                        </button>
                      ) : (
                        <Link
                          to={`/track/${b.id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          Track
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                No bookings yet.
              </div>
            )}
          </div>
        )}

        {/* ADDRESSES: CARD LIST */}
        {activeTab === "addresses" && (
          <div>
            <button
              className="btn btn-primary w-100 rounded-pill mb-3"
              onClick={() => setShowAddressModal(true)}
            >
              + Add New Address
            </button>
            <div className="d-flex flex-column gap-3">
              {addresses.map((a) => (
                <div key={a.id} className="he-mobile-order-card">
                  <div className="d-flex justify-content-between">
                    <div>
                      <span className="he-badge he-badge-info mb-1">
                        {a.label}
                      </span>
                      <div className="fw-bold text-main">{a.recipientName}</div>
                      <div className="text-muted small">{a.fullAddress}</div>
                    </div>
                    <button
                      className="btn text-danger"
                      onClick={() => handleDeleteAddress(a.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOYALTY & PROFILE (Simple Render) */}
        {(activeTab === "loyalty" || activeTab === "profile") && (
          <div className="text-center text-muted py-5">
            <i className="fas fa-laptop mb-2 fs-1"></i>
            <p>Fitur ini lebih nyaman diakses via Desktop untuk saat ini.</p>
          </div>
        )}
      </div>

      {/* MODALS REUSED */}
      {showAddressModal && (
        <div className="pe-modal-backdrop">
          <div className="pe-modal-glass">
            <div className="pe-modal-header">
              <h5>Add Address</h5>
              <button
                className="pe-close-btn"
                onClick={() => setShowAddressModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="pe-modal-body">
              {/* Reuse form logic from desktop */}
              <input
                className="pe-input-glass mb-2"
                placeholder="Label"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
              />
              <input
                className="pe-input-glass mb-2"
                placeholder="Full Address"
                value={newAddress.fullAddress}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, fullAddress: e.target.value })
                }
              />
              <button
                className="pe-action-btn w-100 mt-2"
                onClick={handleAddressSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
};

export default DashboardPage;
