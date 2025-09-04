import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const BookingConfirmationPage = ({ showMessage }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Sesi Anda telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

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
              const foundAddress = addresses.find(addr => addr.id === bookingData.addressId);
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

  const handleApplyPromo = async () => {
    setPromoError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/promos/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: promoCode }),
      });
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

      const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/create-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: newBookingData.id }),
      });

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
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-dark">Konfirmasi Pesanan Anda</h1>
        <p className="lead text-muted">
          Mohon periksa kembali detail pesanan Anda sebelum melanjutkan.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Kolom Kiri: Detail Pesanan */}
        <div className="col-lg-7">
          <div className="card shadow-sm mb-4 booking-summary-card">
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4">Rincian Pesanan</h4>

              {/* Bagian Layanan & Lokasi */}
              <div className="d-flex align-items-start mb-4">
                <i className="fas fa-store-alt fa-2x text-primary me-4 mt-1"></i>
                <div>
                  <h6 className="mb-1 fw-semibold text-dark">Layanan & Lokasi</h6>
                  <p className="mb-0">
                    <strong className="text-secondary">{storeName}</strong>
                  </p>
                  <small className="text-muted">
                    Layanan yang dipilih: <strong>{service?.name}</strong> untuk{" "}
                    <strong>{shoeType}</strong>.
                  </small>
                </div>
              </div>

              {/* Bagian Pengantaran & Jadwal */}
              <div className="d-flex align-items-start mb-4">
                <i className="fas fa-truck-moving fa-2x text-primary me-4 mt-1"></i>
                <div>
                  <h6 className="mb-1 fw-semibold text-dark">Pengantaran & Jadwal</h6>
                  <p className="mb-0">
                    Opsi:{" "}
                    <strong className="text-secondary">
                      {deliveryOption === "pickup"
                        ? "Antar Jemput oleh Kurir"
                        : "Diantar Sendiri ke Toko"}
                    </strong>
                  </p>
                  <small className="text-muted">
                    Jadwal: <strong>{scheduleString}</strong>
                  </small>
                  {deliveryOption === "pickup" && selectedAddress && (
                    <div className="mt-3 p-3 bg-light rounded shadow-sm-light border-light">
                      <h6 className="small text-muted mb-1">Alamat Penjemputan:</h6>
                      <p className="mb-0 fw-semibold">{selectedAddress.recipientName} ({selectedAddress.label})</p>
                      <p className="mb-0 small">{selectedAddress.fullAddress}, {selectedAddress.city}, {selectedAddress.postalCode}</p>
                      <p className="mb-0 small">{selectedAddress.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian Kode Promo */}
              <div className="d-flex align-items-start mb-4">
                <i className="fas fa-tags fa-2x text-primary me-4 mt-1"></i>
                <div className="flex-grow-1">
                  <h6 className="mb-2 fw-semibold text-dark">Kode Promo</h6>
                  <div className="input-group promo-input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan kode promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      aria-label="Kode Promo"
                    />
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isSubmitting}
                    >
                      Terapkan
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="text-success small mt-2 d-flex align-items-center">
                      <i className="fas fa-check-circle me-1"></i>
                      Promo <strong>{appliedPromo.code}</strong> berhasil diterapkan!
                    </div>
                  )}
                  {promoError && (
                    <div className="text-danger small mt-2 d-flex align-items-center">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {promoError}
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian Rincian Biaya */}
              <hr className="my-4" />
              <h5 className="fw-bold mb-3">Total Pembayaran</h5>
              <div className="cost-summary-list">
                <div className="d-flex justify-content-between py-2">
                  <span>{service?.name}</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="d-flex justify-content-between py-2">
                    <span>Biaya Antar Jemput</span>
                    <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-2">
                  <span>Biaya Penanganan</span>
                  <span>Rp {handlingFee.toLocaleString("id-ID")}</span>
                </div>
                {appliedPromo && (
                  <div className="d-flex justify-content-between py-2 text-success fw-semibold">
                    <span>Diskon ({appliedPromo.code})</span>
                    <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-3 mt-2 border-top total-amount">
                  <span className="fw-bold fs-5 text-dark">Total</span>
                  <span className="fw-bold fs-4 text-primary">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Aksi Pembayaran */}
        <div className="col-lg-5">
          <div className="card shadow-sm p-4 text-center payment-action-card">
            <i className="fas fa-credit-card fa-3x text-primary mb-4"></i>
            <h5 className="fw-bold mb-3">Satu Langkah Lagi\!</h5>
            <p className="text-muted mb-4">
              Konfirmasi pesanan Anda dan lanjutkan ke halaman pembayaran yang aman.
            </p>
            <button
              onClick={handleConfirmAndPay}
              className="btn btn-primary btn-lg w-100 mb-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Memproses Pembayaran...
                </>
              ) : (
                <>
                  <i className="fas fa-wallet me-2"></i>Lanjutkan ke Pembayaran
                </>
              )}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary w-100"
              disabled={isSubmitting}
            >
              <i className="fas fa-arrow-left me-2"></i>Kembali & Ubah Pesanan
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingConfirmationPage;