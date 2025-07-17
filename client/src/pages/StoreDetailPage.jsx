import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Komponen baru untuk menampilkan satu kartu ulasan
const ReviewCard = ({ review }) => {
  return (
    <div className="review-card mb-3">
      <div className="d-flex align-items-center mb-2">
        <div className="review-avatar">{review.userName.charAt(0)}</div>
        <div>
          <h6 className="mb-0">{review.userName}</h6>
          <p className="mb-0 text-muted small">
            {new Date(review.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="ms-auto">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`fas fa-star ${
                i < review.rating ? "text-warning" : "text-light"
              }`}
            ></i>
          ))}
        </div>
      </div>
      <p className="review-comment">
        {review.comment || "Tidak ada komentar."}
      </p>
    </div>
  );
};

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State yang sudah ada
  const [store, setStore] = useState(null);
  const [servicesData, setServicesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedShoeType, setSelectedShoeType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState("self-delivery");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [finalSchedule, setFinalSchedule] = useState(null);

  // State baru untuk alamat
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phoneNumber: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const fetchUserAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0].id);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil alamat:", error);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const [storeRes, servicesRes, reviewsRes] = await Promise.all([
          fetch(`/api/stores/${id}`),
          fetch("/api/services"),
          fetch(`/api/reviews/store/${id}`),
        ]);

        if (!storeRes.ok) throw new Error("Toko tidak ditemukan");

        const storeData = await storeRes.json();
        const allServices = await servicesRes.json();
        const storeReviews = await reviewsRes.json();

        setStore(storeData);
        setServicesData(allServices);
        setReviews(storeReviews);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
    fetchUserAddresses();
  }, [id]);

  useEffect(() => {
    if (deliveryOption === "self-delivery") {
      setFinalSchedule(null);
    }
  }, [deliveryOption]);

  const handleShoeTypeChange = (event) => {
    setSelectedShoeType(event.target.value);
    setSelectedService(null);
  };

  const handleServiceChange = (event) => {
    const serviceId = event.target.value;
    const serviceDetails = servicesData[selectedShoeType].find(
      (s) => s.id === serviceId
    );
    setSelectedService(serviceDetails);
  };

  const handleBooking = () => {
    if (!selectedService) {
      alert("Silakan pilih layanan terlebih dahulu.");
      return;
    }
    if (deliveryOption === "pickup" && !finalSchedule) {
      alert("Silakan pilih jadwal antar jemput.");
      return;
    }
    if (deliveryOption === "pickup" && !selectedAddress) {
      alert("Silakan pilih alamat pengantaran.");
      return;
    }

    const bookingData = {
      storeId: store.id,
      storeName: store.name,
      shoeType: selectedShoeType,
      service: selectedService,
      deliveryOption: deliveryOption,
      schedule: finalSchedule,
      addressId: selectedAddress,
    };
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    navigate("/booking-confirmation");
  };

  const handleAddressFormChange = (e) => {
    setNewAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressSubmit = async (e) => {
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

      setShowAddressModal(false);
      fetchUserAddresses();
      alert("Alamat baru berhasil disimpan!");
    } catch (error) {
      alert(error.message);
    }
  };

  const renderActionButton = () => {
    if (selectedService?.id === "repair") {
      const message = encodeURIComponent(
        `Halo Admin StrideBase, saya ingin berkonsultasi mengenai perbaikan sepatu di toko ${store.name}.`
      );
      return (
        <a
          href={`https://wa.me/6281234567890?text=${message}`} // Ganti dengan nomor WhatsApp Admin Anda
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success w-100"
        >
          <i className="fab fa-whatsapp me-2"></i>Hubungi Admin
        </a>
      );
    }

    return (
      <button
        className="btn btn-gradient w-100"
        type="button"
        disabled={
          !selectedService || (deliveryOption === "pickup" && !finalSchedule)
        }
        onClick={handleBooking}
      >
        Book Now
      </button>
    );
  };

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (!store)
    return (
      <div className="container py-5 text-center">
        <h2>404 - Toko Tidak Ditemukan</h2>
      </div>
    );

  return (
    <main className="page-content container store-detail">
      <div className="mb-4">
        <h1 className="mb-2">{store.name}</h1>
        <p className="text-muted mb-2">
          <i className="fas fa-map-marker-alt me-2"></i> {store.location}
        </p>
        <p className="rating-stars mb-0">
          <i className="fas fa-star"></i> {store.rating} ({reviews.length}{" "}
          ulasan)
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-7">
          <div className="info-box rounded-4 p-4 h-100">
            <img
              src={store.images[0]}
              className="img-fluid rounded-3 mb-4"
              alt={store.name}
            />
            <h5>Deskripsi</h5>
            <p>
              {store.description || "Deskripsi untuk toko ini belum tersedia."}
            </p>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <div className="info-box rounded-4 p-4 h-100 d-flex flex-column">
            <h6 className="fw-semibold mb-3">1. Pilih Jenis Sepatu</h6>
            <div id="shoe-type-options" className="mb-3 d-flex flex-wrap gap-2">
              {servicesData &&
                Object.keys(servicesData).map((type) => (
                  <label className="service-option-chip" key={type}>
                    <input
                      type="radio"
                      name="shoeType"
                      value={type}
                      checked={selectedShoeType === type}
                      onChange={handleShoeTypeChange}
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
            </div>

            <hr className="my-3" />

            <div
              style={{
                opacity: selectedShoeType ? 1 : 0.5,
                pointerEvents: selectedShoeType ? "auto" : "none",
              }}
            >
              <h6 className="fw-semibold mb-3">2. Pilih Layanan</h6>
              <div id="service-options-container">
                {selectedShoeType ? (
                  servicesData[selectedShoeType].map((service) => (
                    <label className="service-option" key={service.id}>
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        onChange={handleServiceChange}
                        checked={selectedService?.id === service.id}
                      />
                      <div className="service-label">
                        <span className="fw-bold d-block">{service.name}</span>
                        <span className="small text-muted">
                          {service.price > 0
                            ? `Rp ${service.price.toLocaleString("id-ID")}`
                            : "Gratis Konsultasi"}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-muted small">
                    Pilih jenis sepatu terlebih dahulu.
                  </p>
                )}
              </div>
            </div>

            {/* =========== PERUBAHAN LOGIKA DI SINI =========== */}
            <div
              className="mt-4"
              style={{
                opacity:
                  !selectedService || selectedService.id === "repair" ? 0.5 : 1,
                pointerEvents:
                  !selectedService || selectedService.id === "repair"
                    ? "none"
                    : "auto",
              }}
            >
              {/* ================================================= */}

              <hr className="my-3" />
              <h6 className="fw-semibold mb-3">3. Atur Pengantaran & Jadwal</h6>
              <div className="delivery-option-group">
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryOption === "pickup"}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  />
                  <div className="delivery-option-label">
                    <i className="fas fa-motorcycle"></i>
                    <div>
                      <strong>Antar Jemput</strong>
                      <small className="d-block text-muted">
                        Kurir akan mengambil sepatumu.
                      </small>
                    </div>
                  </div>
                </label>
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="delivery"
                    value="self-delivery"
                    checked={deliveryOption === "self-delivery"}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  />
                  <div className="delivery-option-label">
                    <i className="fas fa-walking"></i>
                    <div>
                      <strong>Antar Sendiri</strong>
                      <small className="d-block text-muted">
                        Datang langsung ke toko.
                      </small>
                    </div>
                  </div>
                </label>
              </div>

              {deliveryOption === "pickup" && (
                <div className="mt-3">
                  <h6 className="fw-semibold mb-2">Pilih Alamat Jemput</h6>
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <label className="address-option" key={addr.id}>
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                        />
                        <div className="address-option-label">
                          <strong>{addr.label}</strong>
                          <small>
                            {addr.recipientName} -{" "}
                            {addr.fullAddress.substring(0, 30)}...
                          </small>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="small text-muted">
                      Anda belum punya alamat tersimpan.
                    </p>
                  )}
                  <button
                    className="btn btn-sm btn-outline-dark w-100 mt-2"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <i className="fas fa-plus me-1"></i> Tambah Alamat Baru
                  </button>
                </div>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  className="schedule-picker-box w-100"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={deliveryOption === "self-delivery"}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <div
                    id="selectedScheduleText"
                    className="text-start flex-grow-1"
                  >
                    {finalSchedule && deliveryOption === "pickup" ? (
                      <>
                        <strong className="d-block">
                          {finalSchedule.date.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </strong>
                        <small>{finalSchedule.time}</small>
                      </>
                    ) : (
                      <span className="text-muted">
                        {deliveryOption === "self-delivery"
                          ? "Tidak perlu jadwal"
                          : "Pilih tanggal & jam"}
                      </span>
                    )}
                  </div>
                  <i className="fas fa-chevron-right ms-auto text-muted"></i>
                </button>
              </div>
            </div>

            <div className="d-grid mt-auto pt-4">{renderActionButton()}</div>
          </div>
        </div>
      </div>

      <div className="info-box rounded-4 p-4 mt-4">
        <h5 className="mb-3">Ulasan Pelanggan ({reviews.length})</h5>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-muted">Belum ada ulasan untuk toko ini.</p>
        )}
      </div>

      {showScheduleModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Pilih Tanggal & Waktu</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowScheduleModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted">
                    Pilih tanggal yang tersedia (7 hari ke depan):
                  </p>
                  <div className="d-flex justify-content-around text-center mb-4">
                    {[...Array(7)].map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const isSelected =
                        selectedDate?.toDateString() === date.toDateString();
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedDate(date)}
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className={`p-2 rounded ${
                              isSelected ? "bg-dark text-white" : ""
                            }`}
                          >
                            <small>
                              {date.toLocaleDateString("id-ID", {
                                weekday: "short",
                              })}
                            </small>
                            <strong className="d-block fs-5">
                              {date.getDate()}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <>
                      <hr />
                      <p className="text-muted">
                        Pilih slot waktu yang tersedia:
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {[
                          "09:00 - 11:00",
                          "11:00 - 13:00",
                          "13:00 - 15:00",
                          "15:00 - 17:00",
                        ].map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              className={`btn ${
                                isSelected ? "btn-dark" : "btn-outline-dark"
                              }`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => {
                      setFinalSchedule({
                        date: selectedDate,
                        time: selectedTime,
                      });
                      setShowScheduleModal(false);
                    }}
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {showAddressModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tambah Alamat Baru</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddressModal(false)}
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
                      onClick={() => setShowAddressModal(false)}
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
    </main>
  );
};

export default StoreDetailPage;
