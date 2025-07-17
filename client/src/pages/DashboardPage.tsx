import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";

// --- DEFINISI TIPE DATA ---
interface User {
  id: string;
  name: string;
  email: string;
}

interface Booking {
  id: string;
  service: string;
  storeName: string;
  schedule: string;
  status: string;
  storeId: string;
  userId: string;
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

interface ProfileData {
  name: string;
}

interface AddressCardProps {
  address: Address;
  onDelete: (id: string) => void;
}

const socket = io("http://localhost:5000");

// --- Komponen Kartu Alamat dengan Tipe ---
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

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [activeTab, setActiveTab] = useState("history");
  const [profileData, setProfileData] = useState<ProfileData>({ name: "" });

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
    const userDataString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userDataString) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userDataString) as User;
    setUser(userData);
    setLoading(true);
    try {
      const [bookingsRes, addressesRes] = await Promise.all([
        fetch("/api/user/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/user/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!bookingsRes.ok) throw new Error("Gagal mengambil data booking.");
      if (!addressesRes.ok) throw new Error("Gagal mengambil data alamat.");

      const bookingsData = (await bookingsRes.json()) as Booking[];
      const addressesData = (await addressesRes.json()) as Address[];

      setBookings(bookingsData);
      setAddresses(addressesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name });
      setNewAddress((prev) => ({ ...prev, recipientName: user.name }));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const handleBookingUpdate = (updatedBooking: Booking) => {
        if (updatedBooking.userId === user.id) {
          console.log("🔥 Menerima update booking real-time:", updatedBooking);
          setBookings((currentBookings) =>
            currentBookings.map((booking) =>
              booking.id === updatedBooking.id
                ? { ...booking, status: updatedBooking.status }
                : booking
            )
          );
        }
      };

      socket.on("bookingUpdated", handleBookingUpdate);

      return () => {
        socket.off("bookingUpdated", handleBookingUpdate);
      };
    }
  }, [user]);

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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menyimpan alamat.");

      setAddresses((prev) => [data, ...prev]);
      handleCloseAddressModal();
      alert("Alamat baru berhasil disimpan!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  // ========== FUNGSI YANG DIPERBARUI (OPTIMISTIC UPDATE) ==========
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;

    // 1. Simpan state alamat saat ini untuk jaga-jaga jika gagal
    const originalAddresses = [...addresses];

    // 2. Langsung perbarui UI (Optimistic)
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));

    // 3. Kirim permintaan ke server di belakang layar
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus alamat.");
      }

      // Jika berhasil, tidak perlu melakukan apa-apa, UI sudah diperbarui
      console.log("Alamat berhasil dihapus dari server.");
    } catch (error) {
      // 4. Jika gagal, kembalikan UI ke kondisi semula dan tampilkan error
      alert((error as Error).message);
      setAddresses(originalAddresses);
    }
  };
  // =============================================================

  const handleOpenReviewModal = (e: React.MouseEvent, booking: Booking) => {
    e.preventDefault();
    setReviewingBooking(booking);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingBooking(null);
    setRating(0);
    setComment("");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!rating || !reviewingBooking) {
      alert("Rating bintang wajib diisi.");
      return;
    }
    const reviewData = {
      bookingId: reviewingBooking.id,
      storeId: reviewingBooking.storeId,
      rating: rating,
      comment: comment,
    };
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error("Gagal mengirim ulasan.");
      alert("Terima kasih atas ulasan Anda!");
      handleCloseReviewModal();
      fetchDashboardData();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui profil.");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      alert(data.message);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  if (loading || !user) {
    return <div className="container py-5 text-center">Loading...</div>;
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
              <ul className="nav nav-pills flex-column account-nav">
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    <i className="fas fa-history fa-fw me-2"></i>Riwayat Booking
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "addresses" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("addresses")}
                  >
                    <i className="fas fa-map-marked-alt fa-fw me-2"></i>Alamat
                    Saya
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <i className="fas fa-user-edit fa-fw me-2"></i>Profil Saya
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-9 mt-4 mt-lg-0">
            <div className="card card-account p-4">
              {activeTab === "history" && (
                <div>
                  <h6 className="fw-bold mb-3">Riwayat Booking Anda</h6>
                  {bookings.length > 0 ? (
                    <ul className="list-unstyled history-list">
                      {bookings.map((booking) => (
                        <Link
                          to={`/invoice/${booking.id}`}
                          className="history-item-link text-decoration-none text-dark"
                          key={booking.id}
                        >
                          <li className="history-item">
                            <div className="history-icon">
                              <i
                                className={`fas ${
                                  booking.status === "Completed" ||
                                  booking.status === "Reviewed"
                                    ? "fa-check-circle text-success"
                                    : "fa-spinner text-warning"
                                }`}
                              ></i>
                            </div>
                            <div className="history-details">
                              <div className="info-value">
                                {booking.service} di {booking.storeName}
                              </div>
                              <div className="small text-muted">
                                {booking.schedule}
                              </div>
                            </div>
                            <div className="ms-auto text-end">
                              <span
                                className={`badge bg-light text-dark ms-auto mb-2`}
                              >
                                {booking.status}
                              </span>
                              {booking.status === "Completed" && (
                                <button
                                  className="btn btn-sm btn-outline-primary d-block w-100"
                                  onClick={(e) =>
                                    handleOpenReviewModal(e, booking)
                                  }
                                >
                                  Beri Ulasan
                                </button>
                              )}
                              {booking.status === "Reviewed" && (
                                <span className="small text-success d-block">
                                  Sudah Direview
                                </span>
                              )}
                            </div>
                          </li>
                        </Link>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">
                      Anda belum memiliki riwayat booking.
                    </p>
                  )}
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
                    <p className="text-muted">
                      Anda belum memiliki alamat tersimpan.
                    </p>
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
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseReviewModal}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Kirim Ulasan
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
