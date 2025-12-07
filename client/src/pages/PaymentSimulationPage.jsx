// File: client/src/pages/PaymentSimulationPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { io } from "socket.io-client";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

const socket = io(
  import.meta.env.PROD
    ? "https://stridebase-server-wqdw.onrender.com"
    : "http://localhost:5000",
  { transports: ["websocket"], reconnection: true }
);

const PaymentSimulationPage = ({ showMessage }) => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [activeInstruction, setActiveInstruction] = useState("qr");

  // 1. Handle Timer Expired
  const handleCancelBooking = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (showMessage) showMessage("Waktu pembayaran habis.", "Info");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }, [bookingId, navigate, showMessage]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleCancelBooking();
      return;
    }
    const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, handleCancelBooking]);

  // 2. Fetch Data & Socket Listener
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Gagal ambil data pesanan.");
        const data = await response.json();

        if (data.status === "paid" || data.paymentStatus === "paid") {
          navigate(`/payment-success/${bookingId}`);
          return;
        }
        setBooking(data);
      } catch (error) {
        if (showMessage) showMessage(error.message, "Error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();

    const handlePaymentConfirmed = (data) => {
      if (data.bookingId === bookingId) {
        navigate(`/payment-success/${bookingId}`);
      }
    };

    socket.on("payment_confirmed", handlePaymentConfirmed);
    return () => {
      socket.off("payment_confirmed", handlePaymentConfirmed);
    };
  }, [bookingId, navigate, showMessage]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const paymentConfirmUrl = `${window.location.origin}/payment-confirm-mobile/${bookingId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    paymentConfirmUrl
  )}`;

  if (loading || !booking)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* --- RENDER DESKTOP (REVISED: COLOR VARIABLES) --- */
  const renderDesktop = () => (
    <div
      className="home-elevate-wrapper d-none d-lg-flex justify-content-center"
      style={{
        minHeight: "100vh",
        paddingTop: "120px",
        paddingBottom: "50px",
      }}
    >
      <Fade direction="up" triggerOnce>
        <div
          className="text-center p-4 rounded-4 shadow-lg position-relative overflow-hidden"
          style={{
            background: "var(--sb-card-bg)",
            border: "1px solid var(--sb-card-border)",
            backdropFilter: "blur(30px)",
            maxWidth: "380px",
            width: "100%",
            transform: "scale(0.95)",
          }}
        >
          {/* Scanning Animation */}
          <div
            className="position-absolute w-100 bg-primary opacity-50"
            style={{
              height: "2px",
              top: "0",
              left: "0",
              animation: "scan 3s infinite linear",
              boxShadow: "0 0 15px var(--sb-accent)",
            }}
          ></div>
          <style>{`@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}</style>

          {/* Header Ringkas */}
          <div className="mb-3">
            {/* FIX: Gunakan var text-main, bukan text-white */}
            <h4
              className="fw-bold mb-1"
              style={{ color: "var(--sb-text-main)" }}
            >
              Scan QRIS
            </h4>
            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
              {/* FIX: Gunakan var text-muted */}
              <span className="small" style={{ color: "var(--sb-text-muted)" }}>
                Sisa Waktu:
              </span>
              <div
                className="px-2 py-0 rounded-pill fw-bold border"
                style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  color: "#fbbf24",
                  borderColor: "rgba(251, 191, 36, 0.3)",
                  fontSize: "0.85rem",
                }}
              >
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-2 rounded-3 d-inline-block mb-3 shadow-lg position-relative">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="img-fluid"
              style={{ width: "160px", height: "160px" }}
            />
          </div>

          {/* Total Tagihan */}
          <div
            className="p-2 rounded-3"
            style={{
              background: "rgba(128, 128, 128, 0.1)", // Background netral
              border: "1px solid var(--sb-card-border)",
            }}
          >
            {/* FIX: Warna Text */}
            <small
              className="text-uppercase tracking-widest d-block mb-0"
              style={{ fontSize: "0.65rem", color: "var(--sb-text-muted)" }}
            >
              Total Tagihan
            </small>
            <h4 className="fw-bold m-0 text-primary">
              Rp {booking.totalPrice.toLocaleString("id-ID")}
            </h4>
          </div>

          <div className="mt-3">
            {/* FIX: Warna Text */}
            <small
              style={{ fontSize: "0.7rem", color: "var(--sb-text-muted)" }}
            >
              Buka aplikasi E-Wallet/Banking Anda dan scan kode di atas.
            </small>
          </div>
        </div>
      </Fade>
    </div>
  );

  /* --- RENDER MOBILE (REVISED: COLOR VARIABLES) --- */
  const renderMobile = () => (
    // FIX: Pastikan background wrapper mengikuti tema, jangan hardcode gelap
    <div
      className="d-lg-none"
      style={{
        backgroundColor: "var(--sb-bg-secondary)",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Sticky Timer Header */}
      <div className="he-mobile-timer-sticky">
        <div className="d-flex justify-content-between align-items-center">
          <span className="small text-white">Sisa Waktu</span>
          <span className="fw-bold text-warning font-monospace fs-5">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>

      <div className="container pt-4 pb-5 px-4">
        {/* Total Amount Card */}
        <div className="text-center mb-4">
          {/* FIX: Warna Text */}
          <p className="mb-1 small" style={{ color: "var(--sb-text-muted)" }}>
            Total Pembayaran
          </p>
          {/* FIX: Warna Text Main */}
          <h1 className="fw-bold mb-0" style={{ color: "var(--sb-text-main)" }}>
            Rp {booking.totalPrice.toLocaleString("id-ID")}
          </h1>
          <div
            className="he-divider my-3"
            style={{ backgroundColor: "var(--sb-card-border)" }}
          ></div>
          <div className="d-flex justify-content-between small">
            <span style={{ color: "var(--sb-text-muted)" }}>Order ID</span>
            <span style={{ color: "var(--sb-text-main)" }}>
              #{booking.id.slice(-8)}
            </span>
          </div>
        </div>

        {/* QR Section */}
        <div
          className="he-mobile-qr-card mb-4"
          style={{
            background: "var(--sb-card-bg)",
            border: "1px solid var(--sb-card-border)",
          }}
        >
          <div className="text-center p-4 bg-white rounded-3">
            <img src={qrCodeUrl} alt="QR" className="img-fluid w-100" />
          </div>
          <p
            className="text-center mt-3 small"
            style={{ color: "var(--sb-text-muted)" }}
          >
            Scan QR di atas dengan aplikasi pembayaran apa saja (GoPay, OVO, BCA
            Mobile).
          </p>
        </div>

        {/* Instructions Accordion */}
        <div className="he-mobile-instruction-list">
          {/* FIX: Judul Cara Pembayaran */}
          <h6 className="mb-3 fw-bold" style={{ color: "var(--sb-text-main)" }}>
            Cara Pembayaran
          </h6>

          <div
            className="he-mobile-accordion-item"
            style={{
              background: "var(--sb-card-bg)",
              border: "1px solid var(--sb-card-border)",
            }}
          >
            <button
              className="he-accordion-btn"
              onClick={() =>
                setActiveInstruction(activeInstruction === "qr" ? "" : "qr")
              }
              // FIX: Teks Button Accordion
              style={{ color: "var(--sb-text-main)" }}
            >
              <span>QRIS / E-Wallet</span>
              <i
                className={`fas fa-chevron-down ${
                  activeInstruction === "qr" ? "rotate-180" : ""
                }`}
              ></i>
            </button>
            {activeInstruction === "qr" && (
              <div
                className="he-accordion-body"
                style={{ borderTopColor: "var(--sb-card-border)" }}
              >
                {/* FIX: Teks List Instruksi */}
                <ol
                  className="ps-3 mb-0 small"
                  style={{ color: "var(--sb-text-muted)" }}
                >
                  <li>Buka aplikasi e-wallet atau m-banking.</li>
                  <li>
                    Pilih menu <strong>Scan QRIS</strong>.
                  </li>
                  <li>Arahkan kamera ke kode QR di atas.</li>
                  <li>Periksa detail dan konfirmasi pembayaran.</li>
                </ol>
              </div>
            )}
          </div>

          <div
            className="he-mobile-accordion-item mt-2"
            style={{
              background: "var(--sb-card-bg)",
              border: "1px solid var(--sb-card-border)",
            }}
          >
            <button
              className="he-accordion-btn"
              onClick={() =>
                setActiveInstruction(
                  activeInstruction === "manual" ? "" : "manual"
                )
              }
              style={{ color: "var(--sb-text-main)" }}
            >
              <span>Transfer Manual (Simulasi)</span>
              <i
                className={`fas fa-chevron-down ${
                  activeInstruction === "manual" ? "rotate-180" : ""
                }`}
              ></i>
            </button>
            {activeInstruction === "manual" && (
              <div
                className="he-accordion-body text-center"
                style={{ borderTopColor: "var(--sb-card-border)" }}
              >
                <p
                  className="small mb-3"
                  style={{ color: "var(--sb-text-muted)" }}
                >
                  Klik tombol di bawah untuk simulasi sukses (Dev Mode).
                </p>
                <a
                  href={paymentConfirmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-success w-100"
                >
                  Simulasi Bayar Sukses
                </a>
              </div>
            )}
          </div>
        </div>
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

export default PaymentSimulationPage;
