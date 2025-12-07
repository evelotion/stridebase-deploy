// File: client/src/pages/StoreDetailPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  getStoreDetails,
  getUserAddresses,
  addUserAddress,
} from "../services/apiService";

// Import CSS Baru
import "./StoreDetailElevate.css";

// Helper Icon untuk Tipe Sepatu (Tabs)
const getShoeIcon = (type) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("leather") || t.includes("pantofel") || t.includes("kulit"))
    return "fa-briefcase";
  if (t.includes("boot")) return "fa-hiking";
  if (t.includes("heel") || t.includes("woman") || t.includes("wanita"))
    return "fa-shoe-prints";
  if (t.includes("sneaker") || t.includes("sport")) return "fa-running";
  if (t.includes("canvas") || t.includes("kanvas")) return "fa-socks";
  return "fa-layer-group";
};

// [NEW] Helper Icon untuk Service (Card)
const getServiceIcon = (name) => {
  const n = name?.toLowerCase() || "";
  if (n.includes("fast") || n.includes("express")) return "fa-bolt";
  if (n.includes("deep") || n.includes("clean") || n.includes("cuci"))
    return "fa-soap";
  if (n.includes("white") || n.includes("unyellowing")) return "fa-sun";
  if (n.includes("paint") || n.includes("color") || n.includes("cat"))
    return "fa-palette";
  if (n.includes("repair") || n.includes("glue") || n.includes("sol"))
    return "fa-tools";
  if (n.includes("protector") || n.includes("coat")) return "fa-shield-alt";
  return "fa-star"; // Default
};

const StoreDetailPage = ({ showMessage }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Booking State
  const [selectedShoeType, setSelectedShoeType] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState({
    deliveryOption: "drop_off",
    addressId: "",
    notes: "",
  });

  // Form New Address
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phoneNumber: "",
    fullAddress: "",
    city: "Jakarta",
    postalCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeData = await getStoreDetails(id);
        setStore(storeData);
        setServices(storeData.services || []);
        setReviews(storeData.reviews || []);

        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          try {
            const addresses = await getUserAddresses();
            setUserAddresses(Array.isArray(addresses) ? addresses : []);
            setNewAddress((prev) => ({ ...prev, recipientName: user.name }));
          } catch (err) {
            console.error(err);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Grouping Services
  const servicesByShoeType = useMemo(() => {
    const groups = {};
    services.forEach((srv) => {
      const type = srv.shoeType || "All Shoes";
      if (!groups[type]) groups[type] = [];
      groups[type].push(srv);
    });
    return groups;
  }, [services]);

  const shoeTypes = Object.keys(servicesByShoeType);

  useEffect(() => {
    if (shoeTypes.length > 0 && !selectedShoeType) {
      setSelectedShoeType(shoeTypes[0]);
    }
  }, [shoeTypes, selectedShoeType]);

  const handleServiceClick = (service) => {
    if (selectedService?.id === service.id) setSelectedService(null);
    else setSelectedService(service);
  };

  const submitBooking = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return navigate("/login", { state: { from: `/store/${id}` } });

    if (
      bookingData.deliveryOption === "pickup_delivery" &&
      !bookingData.addressId
    ) {
      if (userAddresses.length === 0) setShowAddressModal(true);
      else if (showMessage) showMessage("Pilih alamat penjemputan", "Error");
      return;
    }

    const payload = {
      storeId: store.id,
      storeName: store.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      deliveryOption: bookingData.deliveryOption,
      addressId: bookingData.addressId,
      notes: bookingData.notes,
      schedule: { date: new Date() },
    };
    localStorage.setItem("pendingBooking", JSON.stringify(payload));
    navigate("/booking-confirmation");
  };

  const handleAddressSubmit = async () => {
    try {
      const data = await addUserAddress(newAddress);
      setUserAddresses([data, ...userAddresses]);
      setBookingData({ ...bookingData, addressId: data.id });
      setShowAddressModal(false);
    } catch (e) {
      if (showMessage) showMessage("Gagal simpan alamat", "Error");
    }
  };

  if (loading)
    return (
      <div className="sd-loader">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!store) return null;

  const coverImage =
    store.headerImageUrl ||
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1600";

  return (
    <div className="pe-dashboard-wrapper luxury-blue-theme sd-page-container">
      {/* --- 1. HERO SECTION --- */}
      <section className="sd-hero">
        <div
          className="sd-hero-bg"
          style={{ backgroundImage: `url(${coverImage})` }}
        ></div>
        <div className="sd-hero-overlay"></div>
        <div className="container position-relative z-2 h-100 d-flex flex-column justify-content-end pb-5">
          <Fade direction="up" triggerOnce>
            <div className="sd-hero-content">
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className="sd-badge-pro">PRO PARTNER</span>
                <span className="sd-rating">
                  <i className="fas fa-star text-warning me-1"></i>{" "}
                  {store.rating ? store.rating.toFixed(1) : "New"}
                </span>
              </div>
              <h1 className="sd-title">{store.name}</h1>
              <p className="sd-location">
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                {store.location}
              </p>
            </div>
          </Fade>
        </div>
      </section>

      {/* --- 2. MAIN CONTENT --- */}
      <section className="sd-content">
        <div className="container">
          <div className="row g-5">
            {/* LEFT COLUMN: Services & Info */}
            <div className="col-lg-8">
              {/* About */}
              <div className="sd-section mb-5">
                <h3 className="sd-section-title">The Atelier</h3>
                <p className="sd-desc">
                  {store.description ||
                    "Tempat perawatan sepatu premium dengan standar kualitas tinggi."}
                </p>
              </div>

              {/* Service Selection */}
              <div className="sd-section mb-5">
                <h3 className="sd-section-title">Select Service</h3>

                {/* Tabs (Shoe Types) */}
                <div className="sd-tabs-scroll">
                  {shoeTypes.map((type) => (
                    <button
                      key={type}
                      className={`sd-tab-pill ${
                        selectedShoeType === type ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedShoeType(type);
                        setSelectedService(null);
                      }}
                    >
                      <i className={`fas ${getShoeIcon(type)} me-2`}></i> {type}
                    </button>
                  ))}
                </div>

                {/* Service Cards Grid */}
                <div className="sd-service-grid mt-4">
                  {servicesByShoeType[selectedShoeType]?.map((srv, idx) => (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceClick(srv)}
                      className="sd-card-wrapper"
                    >
                      <Fade direction="up" delay={idx * 50} triggerOnce>
                        <div
                          className={`sd-service-card ${
                            selectedService?.id === srv.id ? "selected" : ""
                          }`}
                        >
                          <div className="d-flex justify-content-between mb-3">
                            {/* [UPDATE] ICON DINAMIS BERDASARKAN NAMA SERVICE */}
                            <span className="sd-service-icon">
                              <i
                                className={`fas ${getServiceIcon(srv.name)}`}
                              ></i>
                            </span>
                            {selectedService?.id === srv.id && (
                              <i className="fas fa-check-circle text-primary fs-5"></i>
                            )}
                          </div>
                          <h4 className="sd-service-name">{srv.name}</h4>
                          <div className="d-flex justify-content-between align-items-end mt-3">
                            <span className="sd-service-dur">
                              <i className="far fa-clock me-1"></i>{" "}
                              {srv.duration}m
                            </span>
                            <span className="sd-service-price">
                              Rp {srv.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="sd-card-glow"></div>
                        </div>
                      </Fade>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="sd-section mb-5">
                <h3 className="sd-section-title">Client Stories</h3>
                {reviews.length > 0 ? (
                  <div className="sd-reviews-list">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="sd-review-item">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-white">
                            {rev.userName}
                          </span>
                          <span className="text-warning small">
                            <i className="fas fa-star"></i> {rev.rating}
                          </span>
                        </div>
                        <p className="sd-text-muted small mb-0">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Perbaikan warna font "Belum ada ulasan"
                  <p className="sd-text-muted fst-italic">Belum ada ulasan.</p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Booking Panel */}
            <div className="col-lg-4">
              <div className="sd-sticky-wrapper">
                <div className="sd-booking-card">
                  <h4 className="sd-booking-title">Booking Summary</h4>

                  {selectedService ? (
                    <>
                      <div className="sd-summary-item">
                        <span>Service</span>
                        <span className="text-white text-end">
                          {selectedService.name}
                        </span>
                      </div>
                      <div className="sd-summary-item">
                        <span>Duration</span>
                        <span className="text-white">
                          ~{selectedService.duration} Mins
                        </span>
                      </div>

                      <div className="my-4">
                        <label className="sd-label mb-2">Delivery Method</label>
                        <div className="sd-toggle-group">
                          <button
                            className={`sd-toggle-btn ${
                              bookingData.deliveryOption === "drop_off"
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              setBookingData({
                                ...bookingData,
                                deliveryOption: "drop_off",
                              })
                            }
                          >
                            Drop Off
                          </button>
                          <button
                            className={`sd-toggle-btn ${
                              bookingData.deliveryOption === "pickup_delivery"
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              setBookingData({
                                ...bookingData,
                                deliveryOption: "pickup_delivery",
                              })
                            }
                          >
                            Pickup
                          </button>
                        </div>
                      </div>

                      {bookingData.deliveryOption === "pickup_delivery" && (
                        <div className="mb-4">
                          <div className="d-flex justify-content-between mb-2">
                            <label className="sd-label">Address</label>
                            <span
                              className="sd-link-btn"
                              onClick={() => setShowAddressModal(true)}
                            >
                              + New
                            </span>
                          </div>
                          <select
                            className="sd-select"
                            value={bookingData.addressId}
                            onChange={(e) =>
                              setBookingData({
                                ...bookingData,
                                addressId: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Address</option>
                            {userAddresses.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.label} - {a.street}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="sd-divider"></div>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* Perbaikan warna font "Total" */}
                        <span className="sd-text-muted">Total</span>
                        <span className="sd-total-price">
                          Rp {selectedService.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <button
                        onClick={submitBooking}
                        className="sd-btn-primary w-100"
                      >
                        Confirm Booking
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-5 sd-text-muted">
                      <i className="fas fa-shopping-basket mb-3 fs-3"></i>
                      <p className="small">
                        Please select a service from the list to proceed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MOBILE BAR (Disesuaikan) --- */}
      {selectedService && (
        <div className="sd-mobile-bar d-lg-none">
          <div className="d-flex flex-column">
            <span className="x-small sd-text-muted">Total</span>
            <span className="fw-bold fs-5 text-white">
              Rp {selectedService.price.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={submitBooking}
            className="sd-btn-primary px-4 py-2"
            style={{ minWidth: "140px" }}
          >
            Book Now
          </button>
        </div>
      )}

      {/* --- ADDRESS MODAL (Warna Input Disesuaikan) --- */}
      {showAddressModal && (
        <div className="pe-modal-backdrop">
          <div className="pe-modal-glass" style={{ maxWidth: "400px" }}>
            <div className="p-3 border-bottom border-white-10 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-white">New Address</h6>
              <button
                onClick={() => setShowAddressModal(false)}
                className="btn-close-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-3">
              <input
                className="sd-input mb-2"
                placeholder="Label (Home/Office)"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
              />
              <input
                className="sd-input mb-2"
                placeholder="Recipient Name"
                value={newAddress.recipientName}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    recipientName: e.target.value,
                  })
                }
              />
              <input
                className="sd-input mb-2"
                placeholder="Phone Number"
                value={newAddress.phoneNumber}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phoneNumber: e.target.value })
                }
              />
              <textarea
                className="sd-input mb-2"
                rows="2"
                placeholder="Full Address"
                value={newAddress.fullAddress}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, fullAddress: e.target.value })
                }
              ></textarea>
              <button
                onClick={handleAddressSubmit}
                className="sd-btn-primary w-100 mt-2"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailPage;
