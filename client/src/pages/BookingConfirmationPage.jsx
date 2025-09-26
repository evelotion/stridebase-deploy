// File: client/src/pages/BookingConfirmationPage.jsx (Versi Lengkap & Perbaikan Alur)

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
      // URL DIPERBAIKI: dari /api/admin/promos/validate menjadi /api/user/promos/validate
      const response = await fetch(
        `${API_BASE_URL}/api/user/promos/validate`,
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
  // --- FUNGSI UTAMA YANG DIPERBARUI ---
  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const finalBookingDetails = {
      ...bookingDetails,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      // 1. Buat booking di database terlebih dahulu
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalBookingDetails),
      });

      const newBookingData = await response.json();
      if (!response.ok) {
        throw new Error(newBookingData.message || "Gagal membuat pesanan.");
      }

      // 2. Hapus data booking sementara
      localStorage.removeItem("pendingBooking");

      // 3. Arahkan ke halaman simulasi pembayaran dengan ID booking yang baru dibuat
      navigate(`/payment-simulation/${newBookingData.id}`);
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

  return (
    <>
      <main className="page-content-booking container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Satu Langkah Lagi!</h2>
          <p className="text-muted">
            Pesanan Anda hampir selesai. Konfirmasi detail di "tiket" Anda di
            bawah ini.
          </p>
        </div>

        <div className="booking-ticket">
          <div className="ticket-main">
            <div className="ticket-header">
              <h5 className="ticket-eyebrow">StrideBase Service Ticket</h5>
              <h3 className="ticket-store-name">{storeName}</h3>
            </div>
            <div className="ticket-body">
              <div className="ticket-section">
                <span className="ticket-label">Layanan</span>
                <span className="ticket-value">
                  {service?.name || "N/A"} ({shoeType})
                </span>
              </div>
              <div className="ticket-section">
                <span className="ticket-label">Pengantaran</span>
                <span className="ticket-value">
                  {deliveryOption === "pickup"
                    ? "Diambil Kurir"
                    : "Antar Sendiri"}
                </span>
              </div>
              <div className="ticket-section">
                <span className="ticket-label">Jadwal</span>
                <span className="ticket-value">
                  {schedule
                    ? `${schedule.date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                      })} @ ${schedule.time}`
                    : "Langsung ke Toko"}
                </span>
              </div>
              {selectedAddress && (
                <div className="ticket-section ticket-address">
                  <span className="ticket-label">Alamat Jemput</span>
                  <span className="ticket-value small">
                    {selectedAddress.recipientName},{" "}
                    {selectedAddress.fullAddress}, {selectedAddress.city}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="ticket-stub">
            <div className="stub-promo-section">
              <h6 className="promo-title">Gunakan Voucher</h6>
              <div className="promo-input-wrapper">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kode Voucher"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleApplyPromo()}
                >
                  Pakai
                </button>
              </div>
              {appliedPromo && (
                <div className="text-success small mt-2">
                  <i className="fas fa-check-circle me-1"></i> Diskon Rp{" "}
                  {discountAmount.toLocaleString("id-ID")} diterapkan!
                </div>
              )}
              {promoError && (
                <div className="text-danger small mt-2">
                  <i className="fas fa-exclamation-triangle me-1"></i>{" "}
                  {promoError}
                </div>
              )}
              <button
                className="btn btn-link btn-sm text-decoration-none p-0 mt-2"
                onClick={() => setShowPromoModal(true)}
              >
                Lihat Voucher Saya
              </button>
            </div>
            <div className="stub-price">
              <span className="price-label">Total Bayar</span>
              <span className="price-amount">
                Rp {totalCost.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              onClick={handleConfirmAndPay}
              className="btn btn-primary btn-block btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
            </button>
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
