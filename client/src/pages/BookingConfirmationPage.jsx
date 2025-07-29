import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BookingConfirmationPage = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
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
        showMessage("Detail layanan tidak lengkap. Silakan ulangi proses pemesanan.");
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
    } else {
      showMessage("Tidak ada detail booking ditemukan. Silakan ulangi proses.");
      navigate("/");
    }
  }, [navigate]);

  const handleApplyPromo = async () => {
    setPromoError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/promos/validate", {
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

    // Sertakan promo yang diaplikasikan ke dalam detail booking
    const finalBookingDetails = {
      ...bookingDetails,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalBookingDetails), // Kirim detail final
      });

      const newBookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(newBookingData.message || "Gagal membuat pesanan.");
      }

      const paymentResponse = await fetch("/api/payments/create-transaction", {
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
              </div>

              {/* --- BAGIAN PROMO BARU --- */}
              <div className="booking-section">
                <h5 className="section-title">
                  <i className="fas fa-tags me-2"></i>Kode Promo
                </h5>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan kode promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleApplyPromo}
                  >
                    Terapkan
                  </button>
                </div>
                {appliedPromo && (
                  <div className="text-success small mt-2">
                    ✓ Promo <strong>{appliedPromo.code}</strong> berhasil
                    diterapkan!
                  </div>
                )}
                {promoError && (
                  <div className="text-danger small mt-2">{promoError}</div>
                )}
              </div>
              {/* --- AKHIR BAGIAN PROMO --- */}

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
                      <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
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
          <div className="card confirmation-action-card">
            <div className="card-body text-center p-4">
              <h5 className="card-title fw-semibold">
                Lanjutkan ke Pembayaran?
              </h5>
              <p className="card-text text-muted small">
                Anda akan diarahkan ke halaman pembayaran yang aman setelah
                menekan tombol di bawah.
              </p>
              <div className="d-grid gap-2 mt-4">
                <button
                  onClick={handleConfirmAndPay}
                  className="btn btn-dark btn-lg btn-confirm"
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
                      <i className="fas fa-shield-alt me-2"></i>Ya, Lanjutkan ke
                      Pembayaran
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={isSubmitting}
                >
                  Batal dan Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingConfirmationPage;
