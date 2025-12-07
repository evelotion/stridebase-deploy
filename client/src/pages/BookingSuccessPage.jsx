// File: client/src/pages/BookingSuccessPage.jsx

import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Fade, Zoom } from "react-awesome-reveal";
import "./HomePageElevate.css";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (!bookingData) {
      navigate("/");
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  return (
    // [FIX] Gunakan class he-centered-page-fix
    <div className="home-elevate-wrapper he-centered-page-fix">
      <div className="text-center p-4" style={{ maxWidth: "600px" }}>
        <Zoom triggerOnce>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-lg"
            style={{
              width: 100,
              height: 100,
              background: "var(--sb-accent)",
              color: "#fff",
              fontSize: "3rem",
            }}
          >
            <i className="fas fa-check"></i>
          </div>
        </Zoom>

        <Fade direction="up" triggerOnce delay={200}>
          <h1 className="he-section-title mb-3">Pemesanan Diterima!</h1>
          <p className="he-service-desc mb-5">
            Terima kasih! Pesanan Anda sedang diproses oleh toko.
          </p>

          <div
            className="p-4 rounded-4 text-start mb-5 shadow-sm"
            style={{
              background: "var(--sb-card-bg)",
              border: "1px solid var(--sb-card-border)",
            }}
          >
            {/* Konten Detail... (Kode sama seperti sebelumnya) */}
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Toko</span>
              <span
                className="fw-bold"
                style={{ color: "var(--sb-text-main)" }}
              >
                {bookingData.storeName}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Layanan</span>
              <span
                className="fw-bold"
                style={{ color: "var(--sb-text-main)" }}
              >
                {bookingData.serviceName}
              </span>
            </div>
            <div className="border-top border-secondary opacity-25 my-2"></div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Total Estimasi</span>
              <span className="fw-bold fs-5 text-primary">
                Rp {bookingData.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="d-flex gap-3 justify-content-center">
            <Link
              to="/dashboard"
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold"
              style={{ background: "var(--sb-accent)", border: "none" }}
            >
              Lihat Dashboard <i className="fas fa-arrow-right ms-2"></i>
            </Link>
            <Link
              to="/"
              className="btn btn-outline-light rounded-pill px-4 py-2"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
