// File: client/src/pages/PaymentSimulationPage.jsx (Dengan WebSocket Listener)

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { io } from "socket.io-client";

// Inisialisasi koneksi socket ke server
const socket = io(API_BASE_URL, { transports: ["websocket"] });

const PaymentSimulationPage = ({ showMessage }) => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // Waktu 5 menit

  const handleCancelBooking = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage(
        "Waktu pembayaran habis. Pesanan Anda telah dibatalkan.",
        "Info"
      );
      navigate("/dashboard");
    } catch (error) {
      showMessage(error.message, "Error");
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
        if (!response.ok) throw new Error("Gagal mengambil detail pesanan.");
        const data = await response.json();
        if (data.status !== "pending") {
          showMessage(
            `Halaman ini tidak valid karena status pesanan sudah ${data.status}.`,
            "Info"
          );
          navigate("/dashboard");
          return;
        }
        setBooking(data);
      } catch (error) {
        showMessage(error.message, "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();

    // --- LOGIKA BARU: Mendengarkan event dari WebSocket ---
    const handlePaymentConfirmed = (data) => {
      if (data.bookingId === bookingId) {
        console.log(
          "Event konfirmasi pembayaran diterima! Navigasi ke halaman sukses..."
        );
        navigate(`/payment-success/${bookingId}`);
      }
    };

    socket.on("payment_confirmed", handlePaymentConfirmed);

    // Fungsi cleanup untuk berhenti mendengarkan saat komponen ditutup
    return () => {
      socket.off("payment_confirmed", handlePaymentConfirmed);
    };
  }, [bookingId, navigate, showMessage]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (loading || !booking) {
    return (
      <div className="container py-5 text-center">
        Memuat halaman pembayaran...
      </div>
    );
  }

  // --- PERUBAHAN: URL pada QR Code diubah ke halaman konfirmasi mobile ---
  const paymentConfirmUrl = `${window.location.origin}/payment-confirm-mobile/${bookingId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    paymentConfirmUrl
  )}`;

  return (
    <main className="container success-container d-flex align-items-center justify-content-center">
      <div className="success-box text-center">
        <div className="success-icon-wrapper">
          <i className="fas fa-qrcode"></i>
        </div>
        <h2 className="success-title">Simulasi Pembayaran</h2>
        <p className="success-details mb-2">
          Scan QR code di bawah ini dengan kamera ponsel Anda untuk melanjutkan.
        </p>
        <div className="timer-box alert alert-warning">
          Selesaikan pembayaran dalam:{" "}
          <strong>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </strong>
        </div>
        <div className="booking-recap my-4">
          <img src={qrCodeUrl} alt="QR Code Pembayaran" />
          <p className="text-muted small mt-3">
            Total Bayar:{" "}
            <strong>Rp {booking.totalPrice.toLocaleString("id-ID")}</strong>
          </p>
        </div>
        <div className="alert alert-info mt-4">
          <i className="fas fa-info-circle me-2"></i>
          Halaman ini akan otomatis beralih ke tanda terima setelah pembayaran
          di perangkat lain berhasil.
        </div>
      </div>
    </main>
  );
};

export default PaymentSimulationPage;
