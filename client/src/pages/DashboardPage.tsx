// File: client/src/pages/DashboardPage.tsx (Dengan Lacak & Lanjutkan Pembayaran)

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
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

// Interface dan definisi tipe lainnya
interface DashboardPageProps {
  showMessage: (message: string, title?: string) => void;
}
interface User {
  id: string;
  name: string;
  email: string;
}
interface Store {
  id: string;
  name: string;
  images: string[];
  location: string;
}
// TAMBAHKAN paymentStatus pada interface Booking
interface Booking {
  id: string;
  service: string;
  storeName: string;
  scheduleDate: string;
  status: string;
  paymentStatus: string;
  storeId: string;
  userId: string;
  store: Store;
}
interface Address {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}
interface PointTransaction {
  id: string;
  points: number;
  description: string;
  createdAt: string;
}
interface LoyaltyData {
  points: number;
  transactions: PointTransaction[];
}
interface ProfileData {
  name: string;
}
interface RedeemedPromo {
  id: string;
  code: string;
  description: string;
  value: number;
  discountType: "fixed" | "percentage";
}

// Props untuk komponen kecil
interface AddressCardProps {
  address: Address;
  onDelete: (id: string) => void;
}
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  buttonText?: string;
  buttonLink?: string;
}
interface VisitedStoreCardProps {
  store: Store;
}

const socketUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_PRODUCTION_URL
  : "/";
let socket;

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  buttonText,
  buttonLink,
}) => (
  <div className="text-center p-5 card my-4">
    <div className="fs-1 mb-3">
      <i className={`fas ${icon} text-muted`}></i>
    </div>
    <h5 className="fw-bold">{title}</h5>
    <p className="text-muted">{message}</p>
    {buttonText && buttonLink && (
      <div className="mt-3">
        <Link to={buttonLink} className="btn btn-primary">
          {buttonText}
        </Link>
      </div>
    )}
  </div>
);

const AddressCard: React.FC<AddressCardProps> = ({ address, onDelete }) => (
  <div className="address-card mb-3">
    <div className="address-card-body">
      <div className="address-card-header">
        <h6 className="address-card-label mb-0">{address.label}</h6>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(address.id)}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
      <p className="address-card-detail mb-1 fw-semibold">
        {address.recipientName}
      </p>
      <p className="address-card-detail mb-1">
        {address.fullAddress}, {address.city}, {address.postalCode}
      </p>
      <p className="address-card-phone mb-0">{address.phoneNumber}</p>
    </div>
  </div>
);

const VisitedStoreCard: React.FC<VisitedStoreCardProps> = ({ store }) => {
  const imageUrl =
    store.images && store.images.length > 0
      ? store.images[0]
      : "https://via.placeholder.com/300x180.png?text=No+Image";

  return (
    <div className="col-md-4">
      <Link
        to={`/store/${store.id}`}
        className="card text-decoration-none text-dark h-100"
      >
        <img
          src={imageUrl}
          className="card-img-top"
          alt={store.name}
          style={{ height: "120px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h6 className="card-title fw-bold text-truncate">{store.name}</h6>
          <p className="card-text small text-muted text-truncate">
            {store.location}
          </p>
        </div>
      </Link>
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ showMessage }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>({
    points: 0,
    transactions: [],
  });
  const [redeemedPromos, setRedeemedPromos] = useState<RedeemedPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImageUrl, setReviewImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [profileData, setProfileData] = useState<ProfileData>({ name: "" });
  const [bookingFilter, setBookingFilter] = useState("all");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phoneNumber: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsData, addressesData, loyalty, promos] = await Promise.all([
        getUserBookings(),
        getUserAddresses(),
        getLoyaltyData(),
        getRedeemedPromos(),
      ]);
      setBookings(bookingsData);
      setAddresses(addressesData);
      setLoyaltyData(loyalty);
      setRedeemedPromos(promos);
    } catch (error) {
      showMessage((error as Error).message, "Error");
      if ((error as Error).message.includes("Token tidak valid")) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(userDataString);
    setUser(userData);
    setProfileData({ name: userData.name });
    setNewAddress((prev) => ({ ...prev, recipientName: userData.name }));

    fetchDashboardData();

    socket = io(socketUrl, { query: { userId: userData.id } });
    socket.on("bookingUpdated", (updatedBooking: Booking) => {
      if (updatedBooking.userId === userData.id) {
        setBookings((currentBookings) =>
          currentBookings.map((b) =>
            b.id === updatedBooking.id
              ? { ...b, status: updatedBooking.status }
              : b
          )
        );
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [navigate]);

  const handleRedeemPoints = async () => {
    if (!confirm(`Anda akan menukarkan 100 poin. Lanjutkan?`)) return;
    try {
      const data = await redeemLoyaltyPoints(100);
      showMessage(data.message);
      await fetchDashboardData();
    } catch (error) {
      showMessage((error as Error).message, "Error");
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await addUserAddress(newAddress);
      setAddresses((prev) => [data, ...prev]);
      handleCloseAddressModal();
      showMessage("Alamat baru berhasil disimpan!");
    } catch (error) {
      showMessage((error as Error).message, "Error");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;
    try {
      await deleteUserAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      showMessage("Alamat berhasil dihapus.");
    } catch (error) {
      showMessage((error as Error).message, "Error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const result = await uploadImage(formData);
      setReviewImageUrl(result.imageUrl);
    } catch (err) {
      showMessage((err as Error).message, "Error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewingBooking) {
      showMessage("Rating bintang wajib diisi.");
      return;
    }
    try {
      await createReview({
        bookingId: reviewingBooking.id,
        storeId: reviewingBooking.storeId,
        rating,
        comment,
        imageUrl: reviewImageUrl,
      });
      showMessage("Terima kasih atas ulasan Anda!");
      handleCloseReviewModal();
      await fetchDashboardData();
    } catch (error) {
      showMessage((error as Error).message, "Error");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await updateUserProfile(profileData);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      showMessage(data.message);
    } catch (error) {
      showMessage((error as Error).message, "Error");
    }
  };

  const handleOpenAddressModal = () => setShowAddressModal(true);
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    if (user) {
      setNewAddress({
        label: "Rumah",
        recipientName: user.name,
        phoneNumber: "",
        fullAddress: "",
        city: "",
        postalCode: "",
      });
    }
  };
  const handleAddressFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };
  const handleOpenReviewModal = (e: React.MouseEvent, booking: Booking) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewingBooking(booking);
    setShowReviewModal(true);
  };
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingBooking(null);
    setRating(0);
    setComment("");
    setReviewImageFile(null);
    setReviewImageUrl(null);
  };
  const StarRatingInput = ({
    rating,
    setRating,
  }: {
    rating: number;
    setRating: React.Dispatch<React.SetStateAction<number>>;
  }) => (
    <div className="d-flex justify-content-center mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fas fa-star fa-2x mx-1`}
          style={{
            cursor: "pointer",
            color: star <= rating ? "#ffc107" : "#e4e5e9",
          }}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const filteredBookings = bookings.filter((booking) => {
    if (bookingFilter === "all") return true;
    if (bookingFilter === "processing")
      return ["confirmed", "in_progress"].includes(booking.status);
    if (bookingFilter === "completed")
      return ["completed", "reviewed"].includes(booking.status);
    if (bookingFilter === "pending_payment")
      return booking.status === "pending";
    return true;
  });

  const lastVisitedStores = bookings
    .sort(
      (a, b) =>
        new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime()
    )
    .map((booking) => booking.store)
    .filter(
      (store, index, self) =>
        store && self.findIndex((s) => s.id === store.id) === index
    )
    .slice(0, 3);

  const getStatusInfo = (booking: Booking) => {
    if (booking.status === "pending") {
      return {
        badgeClass: "bg-warning text-dark",
        text: "Menunggu Pembayaran",
        action: (
          <Link
            to={`/payment-simulation/${booking.id}`}
            className="btn btn-sm btn-danger d-block w-100"
          >
            Lanjutkan Pembayaran
          </Link>
        ),
      };
    }
    if (booking.status === "confirmed" || booking.status === "in_progress") {
      return {
        badgeClass: "bg-info text-dark",
        text: "Sedang Diproses",
        action: (
          <Link
            to={`/track/${booking.id}`}
            className="btn btn-sm btn-outline-primary d-block w-100"
          >
            Lacak Pesanan
          </Link>
        ),
      };
    }
    if (booking.status === "completed") {
      return {
        badgeClass: "bg-success",
        text: "Selesai",
        action: (
          <button
            className="btn btn-sm btn-outline-primary d-block w-100"
            onClick={(e) => handleOpenReviewModal(e, booking)}
          >
            Beri Ulasan
          </button>
        ),
      };
    }
    if (booking.status === "reviewed") {
      return {
        badgeClass: "bg-success",
        text: "Selesai",
        action: (
          <span className="small text-success d-block">Sudah Direview</span>
        ),
      };
    }
    if (booking.status === "cancelled") {
      return {
        badgeClass: "bg-secondary",
        text: "Dibatalkan",
        action: null,
      };
    }
    return {
      badgeClass: "bg-light text-dark",
      text: booking.status,
      action: null,
    };
  };

  if (loading || !user) {
    return <div className="container py-5 text-center">Memuat dasbor...</div>;
  }

  return (
    <>
      <div className="container page-content-about account-page-container">
        <div className="row">
          <div className="col-lg-3">
            <div className="account-sidebar">
              <div className="profile-header">
                <img
                  src="/user-avatar-placeholder.png"
                  alt="User"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://i.pravatar.cc/90";
                  }}
                />
                <h5 className="mb-0 mt-3">{user.name}</h5>
                <p className="text-muted small">{user.email}</p>
              </div>
              <div className="account-nav">
                <button
                  className={`account-nav-item ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <i className="fas fa-history fa-fw me-2"></i>
                  <span>Riwayat Booking</span>
                </button>
                <button
                  className={`account-nav-item ${
                    activeTab === "loyalty" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("loyalty")}
                >
                  <i className="fas fa-gem fa-fw me-2"></i>
                  <span>Poin Saya</span>
                </button>
                <button
                  className={`account-nav-item ${
                    activeTab === "addresses" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("addresses")}
                >
                  <i className="fas fa-map-marked-alt fa-fw me-2"></i>
                  <span>Alamat Saya</span>
                </button>
                <button
                  className={`account-nav-item ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="fas fa-user-edit fa-fw me-2"></i>
                  <span>Profil Saya</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-9 mt-4 mt-lg-0">
            {activeTab === "history" && lastVisitedStores.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold">Pesan Lagi di Toko Favoritmu</h6>
                <div className="row g-3">
                  {lastVisitedStores.map(
                    (store) =>
                      store && <VisitedStoreCard key={store.id} store={store} />
                  )}
                </div>
              </div>
            )}

            <div className="card card-account p-4">
              {activeTab === "history" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                    <h6 className="fw-bold mb-0">Riwayat Booking Anda</h6>
                    <div className="btn-group btn-group-sm mt-2 mt-md-0">
                      <button
                        type="button"
                        className={`btn ${
                          bookingFilter === "all"
                            ? "btn-dark"
                            : "btn-outline-dark"
                        }`}
                        onClick={() => setBookingFilter("all")}
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          bookingFilter === "pending_payment"
                            ? "btn-dark"
                            : "btn-outline-dark"
                        }`}
                        onClick={() => setBookingFilter("pending_payment")}
                      >
                        Menunggu Bayar
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          bookingFilter === "processing"
                            ? "btn-dark"
                            : "btn-outline-dark"
                        }`}
                        onClick={() => setBookingFilter("processing")}
                      >
                        Diproses
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          bookingFilter === "completed"
                            ? "btn-dark"
                            : "btn-outline-dark"
                        }`}
                        onClick={() => setBookingFilter("completed")}
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                  {filteredBookings.length > 0 ? (
                    <ul className="list-unstyled history-list">
                      {filteredBookings.map((booking) => {
                        const statusInfo = getStatusInfo(booking);
                        return (
                          <li className="history-item" key={booking.id}>
                            <div className="history-icon">
                              <i className={`fas fa-receipt text-muted`}></i>
                            </div>
                            <div className="history-details">
                              <div className="info-value">
                                {booking.service} di {booking.storeName}
                              </div>
                              <div className="small text-muted">
                                {new Date(
                                  booking.scheduleDate
                                ).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                            <div
                              className="ms-auto text-end"
                              style={{ minWidth: "150px" }}
                            >
                              <span
                                className={`badge ${statusInfo.badgeClass} ms-auto mb-2`}
                              >
                                {statusInfo.text}
                              </span>
                              {statusInfo.action}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <EmptyState
                      icon="fa-receipt"
                      title="Tidak Ada Riwayat Pemesanan"
                      message="Sepertinya Anda belum pernah melakukan pemesanan untuk filter ini. Ayo temukan layanan cuci sepatu terbaik!"
                      buttonText="Cari Toko Sekarang"
                      buttonLink="/store"
                    />
                  )}
                </div>
              )}

              {/* ... Kode untuk tab lain tetap sama ... */}
              {activeTab === "loyalty" && (
                <div>
                  <h6 className="fw-bold mb-3">Poin Loyalitas Anda</h6>
                  <div className="row g-3">
                    <div className="col-md-5">
                      <div className="card text-center h-100">
                        <div className="card-body">
                          <p className="text-muted mb-1">Total Poin Anda</p>
                          <h2 className="display-4 fw-bold text-primary">
                            {loyaltyData?.points || 0}
                          </h2>
                          <small className="text-muted d-block mb-3">
                            Tukarkan 100 poin untuk mendapatkan voucher diskon
                            Rp 10.000.
                          </small>
                          <button
                            className="btn btn-primary"
                            onClick={handleRedeemPoints}
                            disabled={(loyaltyData?.points || 0) < 100}
                          >
                            <i className="fas fa-gift me-2"></i>Tukar 100 Poin
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="fw-bold mb-3">Voucher Anda</h6>
                          {redeemedPromos.length > 0 ? (
                            <ul className="list-group list-group-flush">
                              {redeemedPromos.map((promo) => (
                                <li
                                  key={promo.id}
                                  className="list-group-item d-flex justify-content-between align-items-center px-0"
                                >
                                  <div>
                                    <p className="mb-0 fw-bold">{promo.code}</p>
                                    <small className="text-muted">
                                      {promo.description}
                                    </small>
                                  </div>
                                  <span className="badge bg-success">
                                    Aktif
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted small">
                              Anda belum memiliki voucher hasil penukaran poin.
                            </p>
                          )}
                          <hr />
                          <h6 className="fw-bold mb-3">
                            Riwayat Transaksi Poin
                          </h6>
                          {loyaltyData &&
                          loyaltyData.transactions.length > 0 ? (
                            <ul className="list-group list-group-flush">
                              {loyaltyData.transactions
                                .slice(0, 3)
                                .map((tx) => (
                                  <li
                                    key={tx.id}
                                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                                  >
                                    <div>
                                      <p className="mb-0 small">
                                        {tx.description}
                                      </p>
                                      <small className="text-muted">
                                        {new Date(tx.createdAt).toLocaleString(
                                          "id-ID"
                                        )}
                                      </small>
                                    </div>
                                    <span
                                      className={`badge rounded-pill fs-6 ${
                                        tx.points > 0
                                          ? "bg-success"
                                          : "bg-danger"
                                      }`}
                                    >
                                      {tx.points > 0
                                        ? `+${tx.points}`
                                        : tx.points}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-muted small">
                              Anda belum memiliki riwayat transaksi poin.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "addresses" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Alamat Tersimpan</h6>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleOpenAddressModal}
                    >
                      <i className="fas fa-plus me-1"></i> Tambah Alamat
                    </button>
                  </div>
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onDelete={handleDeleteAddress}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon="fa-map-marker-alt"
                      title="Tidak Ada Alamat Tersimpan"
                      message="Simpan alamat Anda sekali untuk mempermudah proses pemesanan di kemudian hari."
                    />
                  )}
                </div>
              )}
              {activeTab === "profile" && (
                <div>
                  <h6 className="fw-bold mb-3">Ubah Profil Saya</h6>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="mb-3">
                      <label htmlFor="userName" className="form-label">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="userName"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="userEmail" className="form-label">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="userEmail"
                        value={user.email}
                        disabled
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Simpan Perubahan
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tambah Alamat Baru</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseAddressModal}
                  ></button>
                </div>
                <form onSubmit={handleAddressSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="label" className="form-label">
                        Label Alamat
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="label"
                        name="label"
                        value={newAddress.label}
                        onChange={handleAddressFormChange}
                        placeholder="Contoh: Rumah, Kantor"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="recipientName" className="form-label">
                        Nama Penerima
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="recipientName"
                        name="recipientName"
                        value={newAddress.recipientName}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={newAddress.phoneNumber}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fullAddress" className="form-label">
                        Alamat Lengkap
                      </label>
                      <textarea
                        className="form-control"
                        id="fullAddress"
                        name="fullAddress"
                        value={newAddress.fullAddress}
                        onChange={handleAddressFormChange}
                        rows={3}
                        required
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">
                          Kota/Kabupaten
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="postalCode" className="form-label">
                          Kode Pos
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="postalCode"
                          name="postalCode"
                          value={newAddress.postalCode}
                          onChange={handleAddressFormChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseAddressModal}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Simpan Alamat
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {showReviewModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Beri Ulasan untuk {reviewingBooking?.storeName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseReviewModal}
                  ></button>
                </div>
                <form onSubmit={handleReviewSubmit}>
                  <div className="modal-body text-center">
                    <p>
                      Bagaimana pengalaman Anda dengan layanan "
                      {reviewingBooking?.service}"?
                    </p>
                    <StarRatingInput rating={rating} setRating={setRating} />
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Tulis komentar Anda (opsional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <div className="mt-3">
                      {reviewImageUrl ? (
                        <div className="d-inline-block position-relative">
                          <img
                            src={reviewImageUrl}
                            alt="Pratinjau Ulasan"
                            className="img-thumbnail"
                            width="150"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle position-absolute top-0 start-100 translate-middle"
                            onClick={() => {
                              setReviewImageFile(null);
                              setReviewImageUrl(null);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor="reviewImageUpload"
                            className="btn btn-outline-secondary"
                          >
                            <i className="fas fa-camera me-2"></i>Tambah Foto
                          </label>
                          <input
                            type="file"
                            id="reviewImageUpload"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageUpload}
                          />
                        </>
                      )}
                      {isUploading && (
                        <div className="text-muted small mt-2">
                          Mengunggah...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseReviewModal}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isUploading}
                    >
                      {isUploading ? "Tunggu..." : "Kirim Ulasan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
