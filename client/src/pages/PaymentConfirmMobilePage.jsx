// File: client/src/pages/PaymentConfirmMobilePage.jsx

import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // Tambah useSearchParams
import API_BASE_URL from "../apiConfig";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

const PaymentConfirmMobilePage = ({ showMessage }) => {
  const { bookingId } = useParams(); // Ini bisa berisi ID Booking atau ID Invoice
  const [searchParams] = useSearchParams(); // Hook untuk membaca query params (?type=...)
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Ambil tipe transaksi dari URL, default ke "booking" jika kosong
  const transactionType = searchParams.get("type") || "booking";

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payment/confirm-simulation/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Wajib ada untuk kirim body JSON
          },
          body: JSON.stringify({ type: transactionType }), // Kirim type ke backend
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal konfirmasi.");
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="home-elevate-wrapper d-flex align-items-center justify-content-center p-4"
      style={{ minHeight: "100vh" }}
    >
      <Fade triggerOnce>
        <div
          className="w-100 p-4 rounded-4 text-center shadow-lg"
          style={{
            background: "var(--sb-card-bg)",
            border: "1px solid var(--sb-card-border)",
            maxWidth: "400px",
          }}
        >
          {isSuccess ? (
            <>
              <div className="mb-4 text-success display-1">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2
                className="fw-bold mb-3"
                style={{ color: "var(--sb-text-main)" }}
              >
                Pembayaran Sukses!
              </h2>
              <p className="he-service-desc mb-4">
                Terima kasih. Status pembayaran di perangkat utama
                (Desktop/Laptop) Anda akan ter-update secara otomatis.
              </p>
              <div className="alert alert-success small">
                Anda boleh menutup halaman ini.
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 text-primary display-1">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3
                className="fw-bold mb-2"
                style={{ color: "var(--sb-text-main)" }}
              >
                Konfirmasi Bayar
              </h3>
              <p className="he-service-desc mb-4 small">
                {/* Tampilkan label sesuai tipe transaksi */}
                {transactionType === "invoice" ? "Invoice ID: " : "Pesanan ID: "}
                <span className="fw-bold text-primary">
                  #{bookingId.substring(0, 8)}
                </span>
              </p>

              {error && (
                <div className="alert alert-danger small mb-4">{error}</div>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-lg"
              >
                {isProcessing ? "Memproses..." : "Bayar Sekarang (Simulasi)"}
              </button>

              <p className="text-muted x-small mt-3 fst-italic">
                Klik tombol di atas untuk mensimulasikan pembayaran sukses dari
                Mobile Banking / E-Wallet.
              </p>
            </>
          )}
        </div>
      </Fade>
    </div>
  );
};

export default PaymentConfirmMobilePage;