import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getStoreDetails, getStoreServices, getStoreReviews, getUserAddresses, addUserAddress } from "../services/apiService";

const ReviewCard = ({ review }) => (
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
    <p className="review-comment">{review.comment || "Tidak ada komentar."}</p>
    {review.imageUrl && (
      <div className="mt-2" style={{ paddingLeft: "55px" }}>
        <img
          src={`${review.imageUrl}`}
          alt={`Ulasan dari ${review.userName}`}
          className="img-thumbnail"
          style={{ maxWidth: "150px", cursor: "pointer" }}
          onClick={() => window.open(`${review.imageUrl}`)}
        />
      </div>
    )}
    {review.partnerReply && (
      <div className="mt-3 p-3 bg-light rounded border-start border-4 border-primary">
        <h6 className="fw-bold small text-muted">Balasan dari Toko:</h6>
        <p className="mb-0 fst-italic">"{review.partnerReply}"</p>
      </div>
    )}
  </div>
);

const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase();
  if (name.includes("deep") || name.includes("cuci")) return "fa-soap";
  if (name.includes("repair") || name.includes("consultation"))
    return "fa-tools";
  if (name.includes("unyellowing")) return "fa-sun";
  if (name.includes("leather") || name.includes("kulit")) return "fa-gem";
  if (name.includes("suede")) return "fa-leaf";
  return "fa-shoe-prints";
};

const StoreDetailPage = ({ showMessage }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const [selectedShoeType, setSelectedShoeType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState("self-delivery");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [finalSchedule, setFinalSchedule] = useState(null);
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

  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const fetchUserAddresses = async () => {
    if (!localStorage.getItem("token")) return;
    try {
        const data = await getUserAddresses();
        setAddresses(data);
        if (data.length > 0) {
            setSelectedAddress(data[0].id);
        }
    } catch (error) {
        console.error("Gagal mengambil alamat:", error);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const [storeData, storeServices, storeReviews] = await Promise.all([
            getStoreDetails(id),
            getStoreServices(id),
            getStoreReviews(id),
        ]);

        setStore(storeData);
        setServicesData(storeServices);
        setReviews(storeReviews);

        if (storeServices.length > 0) {
          const firstShoeType = storeServices[0].shoeType;
          setSelectedShoeType(firstShoeType);
        }
      } catch (error) {
        console.error("Gagal mengambil data halaman toko:", error);
        showMessage(error.message || "Gagal memuat data toko.", "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
    fetchUserAddresses();
  }, [id, showMessage]);

  useEffect(() => {
    if (deliveryOption === "self-delivery") {
      setFinalSchedule(null);
    }
  }, [deliveryOption]);

  const headerImage =
    store?.headerImage || (store?.images.length > 0 ? store.images[0] : null);
  const galleryImages =
    store?.images.filter((img) => img !== headerImage) || [];
  const galleryPreviewImages = galleryImages.slice(0, 4);

  const handleShoeTypeChange = (event) => {
    setSelectedShoeType(event.target.value);
    setSelectedService(null);
  };

  const handleServiceChange = (event) => {
    const serviceId = event.target.value;
    const serviceDetails = servicesData.find((s) => s.id === serviceId);
    setSelectedService(serviceDetails);
  };

  const handleBooking = () => {
    if (!localStorage.getItem("token")) {
      showMessage("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      navigate("/login");
      return;
    }
    if (!selectedService) {
      showMessage("Silakan pilih layanan terlebih dahulu.");
      return;
    }
    if (deliveryOption === "pickup" && !finalSchedule) {
      showMessage("Silakan pilih jadwal antar jemput.");
      return;
    }
    if (deliveryOption === "pickup" && !selectedAddress) {
      showMessage("Silakan pilih atau tambah alamat penjemputan.");
      return;
    }

    const bookingData = {
      storeId: store.id,
      storeName: store.name,
      shoeType: selectedShoeType,
      serviceId: selectedService.id, 
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
    try {
        const data = await addUserAddress(newAddress);
        setShowAddressModal(false);
        setAddresses(prev => [data, ...prev]);
        setSelectedAddress(data.id);
        showMessage("Alamat baru berhasil disimpan!");
    } catch (error) {
        showMessage(error.message, "Error");
    }
  };

  const renderActionButton = () => {
    if (selectedService?.id === "repair") {
      const message = encodeURIComponent(
        `Halo, saya ingin konsultasi perbaikan sepatu di ${store.name}.`
      );
      return (
        <a
          href={`https://wa.me/6281234567890?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success btn-lg w-100"
        >
          <i className="fab fa-whatsapp me-2"></i>Hubungi via WhatsApp
        </a>
      );
    }
    return (
      <button
        className="btn btn-dark btn-lg w-100"
        type="button"
        disabled={!selectedService}
        onClick={handleBooking}
      >
        Pesan Sekarang
      </button>
    );
  };

  const generateStructuredData = () => {
    if (!store) return null;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: store.name,
      image: store.images.map((img) => `${img}`),
      address: { "@type": "PostalAddress", streetAddress: store.location },
      description:
        store.description ||
        `Layanan cuci sepatu profesional di ${store.name}, ${store.location}.`,
      telephone: "+62-XXX-XXXX-XXXX",
      aggregateRating:
        reviews.length > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: store.rating,
              reviewCount: reviews.length,
            }
          : undefined,
    });
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
        <Helmet>
          <title>Toko Tidak Ditemukan | StrideBase</title>
        </Helmet>
        <h2>404 - Toko Tidak Ditemukan</h2>
      </div>
    );

  const availableShoeTypes = [...new Set(servicesData.map((s) => s.shoeType))];

  return (
    <>
      <main className="store-detail-page-container">
        <Helmet>
          <title>{`${store.name} - Jasa Cuci Sepatu di ${store.location} | StrideBase`}</title>
          <meta
            name="description"
            content={`Layanan cuci sepatu profesional di ${store.name}, ${store.location}. Lihat daftar layanan, harga, dan ulasan pelanggan. Pesan sekarang melalui StrideBase.`}
          />
          <script type="application/ld+json">{generateStructuredData()}</script>
        </Helmet>

        <div className="store-detail-main">
          <div className="store-header">
            {store.tier === "PRO" && (
              <span
                className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 fs-6"
                style={{ zIndex: 2 }}
              >
                <i className="fas fa-crown me-1"></i> PRO
              </span>
            )}
            <img
              src={
                headerImage
                  ? `${headerImage}`
                  : "https://via.placeholder.com/800x400.png?text=No+Header"
              }
              alt={store.name}
              className="store-header-image"
            />
            <div className="store-header-overlay">
              <h1>{store.name}</h1>
              <p className="lead">{store.location}</p>
              <div className="rating-badge">
                <i className="fas fa-star"></i> {store.rating} ({reviews.length}{" "}
                ulasan)
              </div>
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className="info-box store-gallery-section">
              <h5 className="section-title">Galeri Toko</h5>
              <div className="gallery-preview-grid">
                {galleryPreviewImages.map((img, index) => (
                  <div
                    key={index}
                    className="gallery-preview-item"
                    onClick={() => setShowGalleryModal(true)}
                  >
                    <img src={`${img}`} alt={`Galeri ${index + 1}`} />
                  </div>
                ))}
                {galleryImages.length > 4 && (
                  <div
                    className="gallery-preview-item gallery-view-all"
                    onClick={() => setShowGalleryModal(true)}
                  >
                    <img src={`${galleryImages[4]}`} alt="Lihat semua" />
                    <div className="gallery-view-all-overlay">
                      <span>+{galleryImages.length - 4} Lainnya</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="info-box">
            <h5 className="section-title">
              <i className="fas fa-info-circle me-2"></i>Tentang Toko
            </h5>
            <p className="text-muted">
              {store.description || "Deskripsi untuk toko ini belum tersedia."}
            </p>
          </div>
        </div>

        <div className="store-detail-sidebar">
          <div className="info-box">
            <h5 className="section-title">Pesan Layanan</h5>
            <div className="mb-4">
              <h6 className="fw-semibold mb-3">1. Pilih Jenis Sepatu</h6>
              <div className="d-flex flex-wrap gap-2">
                {availableShoeTypes.map((type) => (
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
            </div>
            <div
              className={`mb-4 ${!selectedShoeType ? "section-disabled" : ""}`}
            >
              <h6 className="fw-semibold mb-3">2. Pilih Layanan</h6>
              <div className="service-card-container">
                {selectedShoeType ? (
                  servicesData
                    .filter((s) => s.shoeType === selectedShoeType)
                    .map((service) => (
                      <label className="service-card" key={service.id}>
                        <input
                          type="radio"
                          name="service"
                          value={service.id}
                          onChange={handleServiceChange}
                          checked={selectedService?.id === service.id}
                        />
                        <div className="service-card-content">
                          <div className="service-card-icon">
                            <i
                              className={`fas ${getServiceIcon(service.name)}`}
                            ></i>
                          </div>
                          <div className="service-card-details">
                            <span className="fw-bold d-block">
                              {service.name}
                            </span>
                            <span className="small text-muted">
                              {service.price > 0
                                ? `Rp ${service.price.toLocaleString("id-ID")}`
                                : "Gratis Konsultasi"}
                            </span>
                          </div>
                          <div className="service-card-checkmark">
                            <i className="fas fa-check-circle"></i>
                          </div>
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
            <div
              className={`mb-4 ${
                !selectedService || selectedService.id === "repair"
                  ? "section-disabled"
                  : ""
              }`}
            >
              <h6 className="fw-semibold mb-3">3. Atur Pengantaran</h6>
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
                      <small>Kurir akan mengambil sepatumu.</small>
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
                      <small>Datang langsung ke toko.</small>
                    </div>
                  </div>
                </label>
              </div>
              {deliveryOption === "pickup" && (
                <div className="mt-3">
                  <h6 className="fw-semibold mb-2 small">
                    Pilih Alamat Jemput
                  </h6>
                  {addresses.map((addr) => (
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
                  ))}
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
                  <div className="text-start flex-grow-1">
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
            <div className="d-grid mt-4 pt-3 border-top">
              {renderActionButton()}
            </div>
          </div>
        </div>

        <div className="store-detail-reviews">
          <div className="info-box">
            <h5 className="section-title">
              <i className="fas fa-star-half-alt me-2"></i>Ulasan Pelanggan (
              {reviews.length})
            </h5>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-muted">Belum ada ulasan untuk toko ini.</p>
            )}
          </div>
        </div>
      </main>

      {showGalleryModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            onClick={() => setShowGalleryModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-content"
                style={{ backgroundColor: "transparent", border: "none" }}
              >
                <div className="modal-header" style={{ borderBottom: "none" }}>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowGalleryModal(false)}
                  ></button>
                </div>
                <div className="modal-body gallery-modal-body">
                  <div
                    id="fullGalleryCarousel"
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      {galleryImages.map((image, index) => (
                        <div
                          className={`carousel-item ${
                            index === 0 ? "active" : ""
                          }`}
                          key={index}
                        >
                          <img
                            src={`${image}`}
                            className="d-block w-100"
                            alt={`Galeri Penuh ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target="#fullGalleryCarousel"
                          data-bs-slide="prev"
                        >
                          <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Previous</span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target="#fullGalleryCarousel"
                          data-bs-slide="next"
                        >
                          <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Next</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

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
    </>
  );
};

export default StoreDetailPage;