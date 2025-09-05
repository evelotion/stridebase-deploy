import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const BookingConfirmationPage = ({ showMessage }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [redeemedPromos, setRedeemedPromos] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Sesi Anda telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    const fetchRedeemedPromos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/redeemed-promos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRedeemedPromos(data);
        }
      } catch (err) {
        console.error("Gagal mengambil promo:", err);
      }
    };

    fetchRedeemedPromos();

    if (savedBooking) {
      const bookingData = JSON.parse(savedBooking);
      if (!bookingData.storeId || !bookingData.service) {
        showMessage(
          "Detail layanan tidak lengkap. Silakan ulangi proses pemesanan."
        );
        navigate(`/store/${bookingData.storeId || ""}`);
        return;
      }
      if (bookingData.deliveryOption === "pickup" && !bookingData.addressId) {
        showMessage(
          "Alamat penjemputan belum dipilih. Silakan lengkapi detail pesanan Anda."
        );
        navigate(`/store/${bookingData.storeId}`);
        return;
      }
      if (bookingData.schedule && bookingData.schedule.date) {
        bookingData.schedule.date = new Date(bookingData.schedule.date);
      }
      setBookingDetails(bookingData);

      if (bookingData.deliveryOption === "pickup" && bookingData.addressId) {
        const fetchAddress = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const addresses = await res.json();
              const foundAddress = addresses.find(
                (addr) => addr.id === bookingData.addressId
              );
              if (foundAddress) {
                setSelectedAddress(foundAddress);
              }
            } else {
              console.error("Gagal mengambil daftar alamat.");
            }
          } catch (error) {
            console.error("Error fetching address:", error);
          }
        };
        fetchAddress();
      }
    } else {
      showMessage("Tidak ada detail booking ditemukan. Silakan ulangi proses.");
      navigate("/");
    }
  }, [navigate, showMessage]);

  const handleApplyPromoFromModal = (code) => {
    setPromoCode(code);
    setShowPromoModal(false);
    setTimeout(() => {
      handleApplyPromo(code);
    }, 100);
  };

  const handleApplyPromo = async (codeToApply = promoCode) => {
    setPromoError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/promos/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: codeToApply }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppliedPromo(data);
    } catch (error) {
      setPromoError(error.message);
      setAppliedPromo(null);
    }
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const finalBookingDetails = {
      ...bookingDetails,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalBookingDetails),
      });

      const newBookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(newBookingData.message || "Gagal membuat pesanan.");
      }

      const paymentResponse = await fetch(
        `${API_BASE_URL}/api/payments/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId: newBookingData.id }),
        }
      );

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.message || "Gagal memulai sesi pembayaran."
        );
      }

      localStorage.removeItem("pendingBooking");
      window.location.href = paymentData.redirectUrl;
    } catch (error) {
      showMessage(error.message);
      setIsSubmitting(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="container py-5 text-center">
        <p>Memuat detail booking...</p>
      </div>
    );
  }

  const { storeName, service, shoeType, deliveryOption, schedule } =
    bookingDetails;
  const handlingFee = 2000;
  const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
  const subtotal = service?.price || 0;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === "percentage") {
      discountAmount = (subtotal * appliedPromo.value) / 100;
    } else {
      discountAmount = appliedPromo.value;
    }
  }

  const totalCost = subtotal + handlingFee + deliveryFee - discountAmount;

  const scheduleString = schedule
    ? `${schedule.date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })} - Pukul ${schedule.time}`
    : "Langsung diantar ke toko";

  return (
    <>
      <main className="page-content-booking container">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Periksa Pesanan Anda</h2>
          <p className="text-muted">
            Pastikan semua detail sudah benar sebelum melanjutkan ke pembayaran.
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-lg-7">
            <div className="card confirmation-details-card">
              <div className="card-body p-4">
                <div className="booking-section">
                  <h5 className="section-title">
                    <i className="fas fa-store me-2"></i>Layanan & Lokasi
                  </h5>
                  <p className="mb-1">
                    <strong>{storeName}</strong>
                  </p>
                  <p className="text-muted mb-0">
                    Layanan yang Anda pilih adalah{" "}
                    <strong>{service?.name}</strong> untuk sepatu jenis{" "}
                    <strong>{shoeType}</strong>.
                  </p>
                </div>
                <div className="booking-section">
                  <h5 className="section-title">
                    <i className="fas fa-truck me-2"></i>Pengantaran & Jadwal
                  </h5>
                  <p className="mb-1">
                    <strong>Opsi:</strong>{" "}
                    {deliveryOption === "pickup"
                      ? "Antar Jemput oleh Kurir"
                      : "Diantar Sendiri ke Toko"}
                  </p>
                  <p className="text-muted mb-0">
                    <strong>Jadwal:</strong> {scheduleString}
                  </p>
                  {deliveryOption === "pickup" && selectedAddress && (
                    <div className="mt-3 p-3 bg-light rounded border">
                      <h6 className="small text-muted mb-1">
                        Alamat Penjemputan:
                      </h6>
                      <p className="mb-0 fw-semibold">
                        {selectedAddress.recipientName} ({selectedAddress.label}
                        )
                      </p>
                      <p className="mb-0 small">
                        {selectedAddress.fullAddress}, {selectedAddress.city},{" "}
                        {selectedAddress.postalCode}
                      </p>
                      <p className="mb-0 small">
                        {selectedAddress.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
                <div className="booking-section">
                  <h5 className="section-title">
                    <i className="fas fa-receipt me-2"></i>Rincian Biaya
                  </h5>
                  <ul className="list-group list-group-flush cost-details">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{service?.name}</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </li>
                    {deliveryFee > 0 && (
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Biaya Antar Jemput</span>
                        <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                      </li>
                    )}
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Biaya Penanganan</span>
                      <span>Rp {handlingFee.toLocaleString("id-ID")}</span>
                    </li>
                    {appliedPromo && (
                      <li className="list-group-item d-flex justify-content-between align-items-center text-success">
                        <span>Diskon ({appliedPromo.code})</span>
                        <span>
                          - Rp {discountAmount.toLocaleString("id-ID")}
                        </span>
                      </li>
                    )}
                  </ul>
                  <ul className="list-group list-group-flush cost-details">
                    <li className="list-group-item d-flex justify-content-between align-items-center total-row">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold fs-5">
                        Rp {totalCost.toLocaleString("id-ID")}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card confirmation-action-card h-100">
              <div className="card-body p-4 d-flex flex-column">
                <div className="text-center mb-4">
                  <img
                    src="https://res.cloudinary.com/dvrb4t9m1/image/upload/v1709405230/stridebase/secure_payment_xmjc9t.png"
                    alt="Secure Payment"
                    className="img-fluid mb-3"
                    style={{ maxWidth: "150px" }}
                  />
                  <h5 className="card-title fw-bold">
                    Siap untuk Menyelesaikan Pesanan Anda?
                  </h5>
                  <p className="card-text text-muted small">
                    Kami menjamin proses pembayaran yang aman dan mudah.
                    Lanjutkan untuk mendapatkan layanan terbaik kami!
                  </p>
                </div>

                <div className="promo-section mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="section-title-small mb-0">
                      <i className="fas fa-tags me-2"></i>Punya Kode Promo?
                    </h5>
                    <button
                      className="btn btn-link btn-sm text-decoration-none"
                      onClick={() => setShowPromoModal(true)}
                    >
                      Lihat Voucher Saya
                    </button>
                  </div>
                  {/* === PERUBAHAN STRUKTUR HTML DI SINI === */}
                  <div className="promo-input-wrapper">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan kode promo"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                    />
                    <button
                      className="btn btn-dark"
                      type="button"
                      onClick={() => handleApplyPromo()}
                    >
                      Terapkan
                    </button>
                  </div>
                  {/* === AKHIR PERUBAHAN STRUKTUR HTML === */}
                  {appliedPromo && (
                    <div className="text-success small mt-2">
                      <i className="fas fa-check-circle me-1"></i> Promo{" "}
                      <strong>{appliedPromo.code}</strong> berhasil diterapkan!
                      Anda menghemat{" "}
                      <strong>
                        Rp {discountAmount.toLocaleString("id-ID")}
                      </strong>
                      .
                    </div>
                  )}
                  {promoError && (
                    <div className="text-danger small mt-2">
                      <i className="fas fa-exclamation-triangle me-1"></i>{" "}
                      {promoError}
                    </div>
                  )}
                </div>

                <div className="mt-auto d-grid gap-2">
                  <button
                    onClick={handleConfirmAndPay}
                    className="btn btn-primary btn-lg btn-confirm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ms-2">Memproses...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>Lanjutkan ke
                        Pembayaran
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline-secondary btn-sm"
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-arrow-left me-2"></i>Batal dan Kembali
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPromoModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Voucher Saya</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPromoModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {redeemedPromos.length > 0 ? (
                    redeemedPromos.map((promo) => (
                      <div
                        key={promo.id}
                        className="voucher-card"
                        onClick={() => handleApplyPromoFromModal(promo.code)}
                      >
                        <div className="voucher-value">
                          {promo.discountType === "percentage"
                            ? `${promo.value}%`
                            : `Rp${promo.value / 1000}k`}
                        </div>
                        <div className="voucher-details">
                          <h6 className="voucher-code">{promo.code}</h6>
                          <p className="voucher-description">
                            {promo.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">
                      Anda tidak memiliki voucher yang tersedia.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default BookingConfirmationPage;