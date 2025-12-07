// File: client/src/pages/BookingConfirmationPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import { getStoreServices, getUserAddresses } from "../services/apiService";
import "./HomePageElevate.css";

const BookingConfirmationPage = ({ showMessage }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");

    if (!token || !savedBooking) {
      if (showMessage)
        showMessage("Sesi habis atau data tidak ditemukan.", "Error");
      navigate("/store");
      return;
    }

    try {
      const bookingData = JSON.parse(savedBooking);
      setBookingDetails(bookingData);

      const fetchExtraData = async () => {
        try {
          const allServices = await getStoreServices(bookingData.storeId);
          const foundService = allServices.find(
            (s) => s.id === bookingData.serviceId
          );

          if (!foundService)
            throw new Error("Layanan tidak ditemukan/tidak aktif.");
          setServiceDetails(foundService);

          if (
            bookingData.deliveryOption === "pickup_delivery" &&
            bookingData.addressId
          ) {
            const addresses = await getUserAddresses();
            const foundAddress = addresses.find(
              (addr) => addr.id === bookingData.addressId
            );
            setSelectedAddress(foundAddress);
          }
        } catch (err) {
          console.error(err);
          if (showMessage) showMessage("Gagal memuat detail pesanan.", "Error");
          navigate("/store");
        }
      };
      fetchExtraData();
    } catch (error) {
      console.error("Error parsing booking data", error);
      navigate("/store");
    }
  }, [navigate, showMessage]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
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
          body: JSON.stringify({ code: promoCode }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setAppliedPromo(data);
      if (showMessage) showMessage("Kode promo berhasil digunakan!", "Sukses");
    } catch (error) {
      setPromoError(error.message);
      setAppliedPromo(null);
    }
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        storeId: bookingDetails.storeId,
        serviceId: bookingDetails.serviceId,
        serviceName: serviceDetails?.name,
        scheduleDate: bookingDetails.schedule?.date || new Date(),
        deliveryOption: bookingDetails.deliveryOption,
        addressId: bookingDetails.addressId,
        notes: bookingDetails.notes || "",
        promoCode: appliedPromo ? appliedPromo.code : undefined,
      };

      // 1. Buat Booking
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = bookingResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Terjadi kesalahan server. Pastikan backend berjalan.");
      }

      const newBookingData = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(newBookingData.message || "Gagal booking.");

      // 2. Buat Transaksi Pembayaran
      const transactionResponse = await fetch(
        `${API_BASE_URL}/api/payment/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId: newBookingData.id }),
        }
      );

      const transactionData = await transactionResponse.json();
      if (!transactionResponse.ok)
        throw new Error(transactionData.message || "Gagal transaksi.");

      localStorage.removeItem("pendingBooking");

      // 3. Routing Pembayaran
      if (transactionData.paymentMethod === "simulation") {
        navigate(`/payment-simulation/${newBookingData.id}`);
      } else {
        if (window.snap) {
          window.snap.pay(transactionData.token, {
            onSuccess: () => navigate(`/payment-success/${newBookingData.id}`),
            onPending: () => navigate(`/payment-success/${newBookingData.id}`),
            onError: () => {
              if (showMessage) showMessage("Pembayaran gagal.", "Error");
            },
            onClose: () => {
              if (showMessage) showMessage("Pop-up ditutup.", "Info");
            },
          });
        } else {
          if (showMessage) showMessage("Midtrans error.", "Error");
        }
      }
    } catch (error) {
      console.error(error);
      if (showMessage) showMessage(error.message, "Error");
      setIsSubmitting(false);
    }
  };

  if (!bookingDetails || !serviceDetails) {
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  // --- Kalkulasi Biaya ---
  const handlingFee = 2000;
  const deliveryFee =
    bookingDetails.deliveryOption === "pickup_delivery" ? 15000 : 0;
  const subtotal = serviceDetails.price || 0;
  let discountAmount = 0;

  if (appliedPromo) {
    discountAmount =
      appliedPromo.discountType === "PERCENTAGE"
        ? (subtotal * appliedPromo.value) / 100
        : appliedPromo.value;
  }

  const totalCost = Math.max(
    0,
    subtotal + handlingFee + deliveryFee - discountAmount
  );

  /* --- [STYLE INJECTION] MEMAKSA TEKS PUTIH --- */
  // Ini memastikan tombol tetap putih meskipun Light Mode punya aturan text-dark !important
  const forceWhiteStyle = (
    <style>{`
      .text-white-force { color: #ffffff !important; }
      .text-white-force span, .text-white-force i { color: #ffffff !important; }
    `}</style>
  );

  /* --- RENDER DESKTOP --- */
  const renderDesktop = () => (
    <div
      className="home-elevate-wrapper d-none d-lg-block"
      style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "50px" }}
    >
      {forceWhiteStyle}
      <div className="container">
        <Fade direction="up" triggerOnce>
          <h2 className="he-section-title mb-5 text-center">Review Pesanan</h2>
          <div className="row g-5">
            {/* KIRI: DETAIL */}
            <div className="col-lg-8">
              <div
                className="p-5 rounded-4 h-100 position-relative overflow-hidden"
                style={{
                  background: "var(--sb-card-bg)",
                  border: "1px solid var(--sb-card-border)",
                  boxShadow: "var(--sb-card-shadow)",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4"
                  style={{ borderColor: "var(--sb-card-border)" }}
                >
                  <div>
                    <small
                      className="text-uppercase tracking-widest mb-1 d-block"
                      style={{ color: "var(--sb-text-muted)" }}
                    >
                      Mitra Penyedia Jasa
                    </small>
                    <h4
                      className="fw-bold mb-0"
                      style={{ color: "var(--sb-text-main)" }}
                    >
                      {bookingDetails.storeName}
                    </h4>
                  </div>
                  <div className="text-end">
                    <small
                      className="text-uppercase tracking-widest mb-1 d-block"
                      style={{ color: "var(--sb-text-muted)" }}
                    >
                      Tanggal Order
                    </small>
                    <span
                      className="fw-bold"
                      style={{ color: "var(--sb-text-main)" }}
                    >
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <h6
                    className="he-section-label mb-3 opacity-50"
                    style={{ color: "var(--sb-text-main)" }}
                  >
                    Detail Layanan
                  </h6>
                  <div
                    className="d-flex gap-4 align-items-center p-3 rounded-3"
                    style={{
                      background: "var(--sb-bg-secondary)",
                      border: "1px solid var(--sb-card-border)",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
                      style={{ width: 60, height: 60, fontSize: "1.5rem" }}
                    >
                      <i className="fas fa-shoe-prints"></i>
                    </div>
                    <div>
                      <h5
                        className="mb-1 fw-bold"
                        style={{ color: "var(--sb-text-main)" }}
                      >
                        {serviceDetails.name}
                      </h5>
                      <p
                        className="mb-0 small"
                        style={{ color: "var(--sb-text-muted)" }}
                      >
                        Estimasi:{" "}
                        <span className="text-primary fw-bold">
                          {serviceDetails.duration} Menit
                        </span>{" "}
                        • Tipe: {serviceDetails.shoeType || "Umum"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <h6
                      className="he-section-label mb-3 opacity-50"
                      style={{ color: "var(--sb-text-main)" }}
                    >
                      Metode Pengiriman
                    </h6>
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ background: "var(--sb-bg-secondary)" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i
                          className={`fas ${
                            bookingDetails.deliveryOption === "drop_off"
                              ? "fa-store"
                              : "fa-truck"
                          } text-primary`}
                        ></i>
                        <span
                          className="fw-bold"
                          style={{ color: "var(--sb-text-main)" }}
                        >
                          {bookingDetails.deliveryOption === "drop_off"
                            ? "Antar Mandiri"
                            : "Pickup & Delivery"}
                        </span>
                      </div>
                      <p
                        className="small mb-0"
                        style={{ color: "var(--sb-text-muted)" }}
                      >
                        {bookingDetails.deliveryOption === "drop_off"
                          ? "Anda mengantar sepatu ke toko."
                          : "Kurir kami menjemput sepatu Anda."}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6
                      className="he-section-label mb-3 opacity-50"
                      style={{ color: "var(--sb-text-main)" }}
                    >
                      Catatan / Alamat
                    </h6>
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ background: "var(--sb-bg-secondary)" }}
                    >
                      {selectedAddress ? (
                        <>
                          <span
                            className="d-block fw-bold mb-1"
                            style={{ color: "var(--sb-text-main)" }}
                          >
                            {selectedAddress.label}
                          </span>
                          <p
                            className="small mb-0"
                            style={{ color: "var(--sb-text-muted)" }}
                          >
                            {selectedAddress.street}, {selectedAddress.city}
                          </p>
                        </>
                      ) : (
                        <p
                          className="small mb-0 fst-italic"
                          style={{ color: "var(--sb-text-muted)" }}
                        >
                          {bookingDetails.notes
                            ? `"${bookingDetails.notes}"`
                            : "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN: PAYMENT SUMMARY */}
            <div className="col-lg-4">
              <div className="position-sticky" style={{ top: "120px" }}>
                <div
                  className="p-4 rounded-4 shadow-lg"
                  style={{
                    background: "var(--sb-card-bg)",
                    border: "1px solid var(--sb-card-border)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <h5
                    className="fw-bold mb-4"
                    style={{ color: "var(--sb-text-main)" }}
                  >
                    Rincian Biaya
                  </h5>
                  <div className="d-flex flex-column gap-3 mb-4">
                    <div
                      className="d-flex justify-content-between small"
                      style={{ color: "var(--sb-text-muted)" }}
                    >
                      <span>Layanan</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div
                      className="d-flex justify-content-between small"
                      style={{ color: "var(--sb-text-muted)" }}
                    >
                      <span>Biaya Aplikasi</span>
                      <span>Rp {handlingFee.toLocaleString("id-ID")}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div
                        className="d-flex justify-content-between small"
                        style={{ color: "var(--sb-text-muted)" }}
                      >
                        <span>Ongkir</span>
                        <span>Rp {deliveryFee.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between text-success small fw-bold">
                        <span>Diskon</span>
                        <span>
                          - Rp {discountAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      className="small fw-bold mb-2 d-block"
                      style={{
                        color: "var(--sb-text-muted)",
                        letterSpacing: "1px",
                      }}
                    >
                      KODE PROMO
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Masukkan kode..."
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--sb-text-main)",
                          borderColor: "var(--sb-card-border)",
                          padding: "12px 15px",
                          fontSize: "0.9rem",
                        }}
                      />
                      <button
                        className="btn fw-bold px-4 text-white-force"
                        type="button"
                        onClick={handleApplyPromo}
                        style={{
                          background: "var(--sb-accent)",
                          color: "#ffffff",
                          border: "1px solid var(--sb-accent)",
                        }}
                      >
                        Gunakan
                      </button>
                    </div>
                    {promoError && (
                      <small className="text-danger mt-2 d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>{" "}
                        {promoError}
                      </small>
                    )}
                    {appliedPromo && (
                      <small className="text-success mt-2 d-block">
                        <i className="fas fa-check-circle me-1"></i> Promo
                        diterapkan!
                      </small>
                    )}
                  </div>

                  <div
                    className="border-top border-dashed my-4"
                    style={{ borderColor: "var(--sb-card-border)" }}
                  ></div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span
                      className="fw-bold"
                      style={{ color: "var(--sb-text-main)" }}
                    >
                      Total
                    </span>
                    <span className="fs-3 fw-bold text-primary">
                      Rp {totalCost.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={handleConfirmAndPay}
                    disabled={isSubmitting}
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg mb-3 hover-scale text-white-force"
                    style={{ background: "var(--sb-accent)", border: "none" }}
                  >
                    {isSubmitting ? (
                      <span>
                        <i className="fas fa-circle-notch fa-spin me-2"></i>{" "}
                        Proses...
                      </span>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );

  const renderMobile = () => (
    <div className="he-mobile-receipt-wrapper d-lg-none">
      {forceWhiteStyle} {/* Inject Style Tag */}
      {/* Sticky Header */}
      <div className="he-mobile-header-sticky">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-decoration-none p-0"
            style={{ color: "var(--sb-text-main)" }}
          >
            <i className="fas fa-arrow-left fs-5"></i>
          </button>
          <h5
            className="mb-0 fw-bold flex-grow-1 text-center"
            style={{ color: "var(--sb-text-main)" }}
          >
            Konfirmasi
          </h5>
          <div style={{ width: "24px" }}></div>
        </div>
      </div>
      {/* Receipt Container */}
      <div className="container pt-4 pb-5 px-4">
        <div className="he-receipt-card">
          <div className="he-receipt-edge top"></div>

          <div className="he-receipt-content">
            {/* Header Receipt */}
            <div className="text-center mb-4 border-bottom border-dashed border-secondary border-opacity-25 pb-3">
              <div className="he-receipt-logo mb-2">
                <i className="fas fa-check-circle text-success fs-1"></i>
              </div>
              <h5 className="fw-bold mb-1">Order Summary</h5>
              <p
                className="small mb-0"
                style={{ color: "var(--sb-text-muted)" }}
              >
                {new Date().toLocaleString("id-ID")}
              </p>
            </div>

            {/* Order Details */}
            <div className="he-receipt-section">
              <div className="he-receipt-row">
                <span className="label">Store</span>
                <span className="value fw-bold">
                  {bookingDetails.storeName}
                </span>
              </div>
              <div className="he-receipt-row">
                <span className="label">Layanan</span>
                <span className="value">{serviceDetails.name}</span>
              </div>
              <div className="he-receipt-row">
                <span className="label">Metode</span>
                <span className="value">
                  {bookingDetails.deliveryOption === "drop_off"
                    ? "Antar Mandiri"
                    : "Pickup"}
                </span>
              </div>
              {selectedAddress && (
                <div className="he-receipt-row align-items-start">
                  <span className="label">Lokasi</span>
                  <span className="value text-end" style={{ maxWidth: "60%" }}>
                    {selectedAddress.street}
                  </span>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="he-receipt-section border-top border-dashed border-secondary border-opacity-25 pt-3 mt-3">
              <div className="he-receipt-row">
                <span className="label">Subtotal</span>
                <span className="value">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="he-receipt-row">
                <span className="label">Biaya App</span>
                <span className="value">
                  Rp {handlingFee.toLocaleString("id-ID")}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="he-receipt-row">
                  <span className="label">Ongkir</span>
                  <span className="value">
                    Rp {deliveryFee.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="he-receipt-row text-success">
                  <span className="label text-success">Diskon</span>
                  <span className="value">
                    - Rp {discountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div
              className="he-receipt-total mt-4 pt-3 border-top border-2"
              style={{ borderColor: "var(--sb-card-border)" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-4 text-primary">
                  Rp {totalCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
          <div className="he-receipt-edge bottom"></div>
        </div>

        {/* --- PROMO INPUT --- */}
        <div className="mt-4 mb-3">
          <label
            className="small mb-2 text-uppercase fw-bold"
            style={{
              letterSpacing: "1px",
              fontSize: "0.75rem",
              color: "var(--sb-text-muted)",
            }}
          >
            Kode Promo & Voucher
          </label>

          <div className="d-flex gap-2 position-relative">
            <div className="flex-grow-1 position-relative">
              <i
                className="fas fa-tag position-absolute"
                style={{
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--sb-accent)",
                  zIndex: 2,
                }}
              ></i>
              <input
                type="text"
                className="he-glass-input w-100"
                placeholder="Punya kode promo?"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm text-white-force"
              onClick={handleApplyPromo}
              style={{
                background: "var(--sb-accent)",
                border: "none",
                transition: "all 0.2s",
              }}
            >
              Pakai
            </button>
          </div>

          {promoError && (
            <small className="text-danger mt-1 d-block ps-3">
              <i className="fas fa-exclamation-circle me-1"></i> {promoError}
            </small>
          )}
          {appliedPromo && (
            <small className="text-success mt-1 d-block ps-3">
              <i className="fas fa-check-circle me-1"></i> Kode promo "
              {appliedPromo.code}" diterapkan!
            </small>
          )}
        </div>
      </div>
      {/* Sticky Action Button */}
      <div className="he-mobile-sticky-footer">
        <button
          onClick={handleConfirmAndPay}
          disabled={isSubmitting}
          // TAMBAHKAN CLASS 'text-white-force' DI SINI
          className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg d-flex justify-content-between px-4 align-items-center text-white-force"
          style={{
            background: "var(--sb-accent)",
            border: "none",
            // Hapus color: white inline yang kalah kuat
          }}
        >
          {isSubmitting ? (
            <span className="mx-auto">
              <i className="fas fa-circle-notch fa-spin me-2"></i> Proses...
            </span>
          ) : (
            <>
              <span>Bayar Sekarang</span>
              <span>Rp {totalCost.toLocaleString("id-ID")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
};

export default BookingConfirmationPage;
