// File: client/src/pages/PaymentSuccessPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookingDetails } from "../services/apiService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Fade, Zoom } from "react-awesome-reveal";
import "./HomePageElevate.css";

const PaymentSuccessPage = ({ showMessage }) => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingReceipt = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getBookingDetails(bookingId);
        setBooking(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingReceipt();
  }, [bookingId]);

  const generatePDF = () => {
    if (!booking) return;
    const doc = new jsPDF();
    doc.text("StrideBase Receipt", 14, 22);
    doc.text(`Order ID: #${booking.id}`, 14, 32);
    doc.text(`Total: Rp ${booking.totalPrice.toLocaleString("id-ID")}`, 14, 44);
    doc.save(`receipt.pdf`);
  };

  if (loading)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* --- RENDER DESKTOP (SIMPLE CENTER) --- */
  const renderDesktop = () => (
    <div
      className="home-elevate-wrapper d-none d-lg-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="text-center p-5 rounded-5 shadow-lg"
        style={{
          background: "var(--sb-card-bg)",
          border: "1px solid var(--sb-card-border)",
          maxWidth: "500px",
        }}
      >
        <Zoom triggerOnce>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-lg"
            style={{
              width: 100,
              height: 100,
              background: "#10b981",
              color: "#fff",
              fontSize: "3rem",
            }}
          >
            <i className="fas fa-check"></i>
          </div>
        </Zoom>
        <h2 className="fw-bold text-white mb-2">Pembayaran Berhasil!</h2>
        <p className="text-muted mb-4">
          Pesanan Anda sedang diproses oleh toko.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button
            onClick={generatePDF}
            className="btn btn-outline-light rounded-pill"
          >
            Download PDF
          </button>
          <Link to="/dashboard" className="btn btn-primary rounded-pill">
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  /* --- RENDER MOBILE (CELEBRATION SCREEN) --- */
  const renderMobile = () => (
    <div className="he-mobile-success-wrapper d-lg-none">
      <div className="he-success-content">
        <div className="he-success-icon-anim">
          <i className="fas fa-check"></i>
        </div>

        <h2 className="fw-bold text-white mt-4 mb-2">Hore! Berhasil</h2>
        <p className="text-white-50 mb-5 px-4">
          Pembayaran Anda telah diterima. Mitra kami akan segera memproses
          pesanan Anda.
        </p>

        {/* Ticket Summary */}
        <div className="he-mobile-success-ticket">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted small">Total Bayar</span>
            <span className="fw-bold text-dark">
              Rp {booking.totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted small">Metode</span>
            <span className="fw-bold text-dark">QRIS</span>
          </div>
          <div className="he-divider-dashed my-3"></div>
          <div className="text-center">
            <Link
              to={`/track/${booking.id}`}
              className="text-primary fw-bold text-decoration-none small"
            >
              Lacak Pesanan #{booking.id.slice(-4)}
            </Link>
          </div>
        </div>
      </div>

      <div
        className="he-mobile-sticky-footer"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
      >
        <Link
          to="/dashboard"
          className="btn btn-light w-100 rounded-pill py-3 fw-bold shadow-lg"
          style={{ color: "var(--sb-accent)" }}
        >
          Kembali ke Beranda
        </Link>
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

export default PaymentSuccessPage;
