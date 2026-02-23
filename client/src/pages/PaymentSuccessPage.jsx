

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { Fade } from "react-awesome-reveal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./HomePageElevate.css";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
 
 
  const bookingId = searchParams.get("order_id") || searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setBooking(data);
      } catch (error) {
        console.error("Gagal load booking", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

 
  const handleDownloadReceipt = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

   
    const primaryBlue = [13, 110, 253];
    const darkText = [33, 37, 41];
    const lightText = [108, 117, 125];
    const bgLight = [248, 249, 250];

   
   
    doc.setFillColor(...primaryBlue);
    doc.circle(0, 0, 40, "F");

   
    doc.setFontSize(22);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text("StrideBase.", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Shoe Care Service", 20, 30);

   
    doc.setFontSize(16);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RECEIPT", pageWidth - 20, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    doc.setFont("courier", "normal");
    doc.text(
      `#${booking.id.substring(0, 8).toUpperCase()}`,
      pageWidth - 20,
      31,
      { align: "right" }
    );

   
    doc.setFillColor(209, 231, 221);
    doc.roundedRect(pageWidth - 50, 36, 30, 8, 3, 3, "F");
    doc.setTextColor(25, 135, 84);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PAID", pageWidth - 35, 41, { align: "center" });

   
    const startY = 55;

   
    doc.setFontSize(9);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER INFO", 20, startY);

    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.text(booking.user.name, 20, startY + 6);
    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    doc.text(booking.user.email, 20, startY + 11);

   
    doc.setFontSize(9);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSACTION DETAILS", pageWidth - 20, startY, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date(booking.createdAt).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(dateStr, pageWidth - 20, startY + 6, { align: "right" });

   
    const method = booking.payment?.paymentMethod || "Online Payment";
    doc.text(
      method.toUpperCase().replace("_", " "),
      pageWidth - 20,
      startY + 11,
      { align: "right" }
    );

   
   
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(...bgLight);
    doc.roundedRect(20, startY + 25, pageWidth - 40, 35, 3, 3, "FD");

   
    doc.setFontSize(14);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text(booking.serviceName, 30, startY + 38);

    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Shoe Type: ${booking.service?.shoeType || "General"}`,
      30,
      startY + 45
    );
    doc.text(
      `Duration: ${booking.service?.duration || "-"} Minutes`,
      30,
      startY + 50
    );

   
    doc.setFontSize(14);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Rp ${booking.totalPrice.toLocaleString("id-ID")}`,
      pageWidth - 30,
      startY + 45,
      { align: "right" }
    );

   
    const totalY = startY + 75;
    doc.setDrawColor(200);
    doc.line(20, totalY, pageWidth - 20, totalY);

    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "normal");
    doc.text("Total Paid", pageWidth - 70, totalY + 10);

    doc.setFontSize(16);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Rp ${booking.totalPrice.toLocaleString("id-ID")}`,
      pageWidth - 20,
      totalY + 10,
      { align: "right" }
    );

   
    const footerY = 250;

   
    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(0.5);
    doc.rect(20, footerY, 170, 25);

    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.text("TRACK YOUR ORDER", 30, footerY + 8);

    doc.setFontSize(9);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Scan QR Code or visit stridebase.com/track-order",
      30,
      footerY + 15
    );
    doc.text(`Tracking ID: ${booking.id}`, 30, footerY + 20);

    doc.save(`Receipt-${booking.id.substring(0, 8)}.pdf`);
  };

  return (
    <div
      className="home-elevate-wrapper d-flex align-items-center justify-content-center p-4"
      style={{ minHeight: "100vh" }}
    >
      <Fade>
        <div
          className="text-center bg-white p-5 rounded-4 shadow-lg"
          style={{
            maxWidth: "500px",
            width: "100%",
            borderTop: "5px solid var(--sb-primary)",
          }}
        >
          {}
          <div className="mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="fas fa-check fa-3x text-success"></i>
            </div>
          </div>

          <h2 className="fw-bold mb-2 text-dark">Pembayaran Berhasil!</h2>
          <p className="text-muted mb-4">
            Terima kasih! Pesanan Anda telah terkonfirmasi. Mitra kami akan
            segera memproses sepatu kesayangan Anda.
          </p>

          {}
          {loading ? (
            <div
              className="spinner-border text-primary mb-4"
              role="status"
            ></div>
          ) : booking ? (
            <div className="bg-light p-3 rounded-3 mb-4 text-start border border-secondary border-opacity-10">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Order ID</span>
                <span className="fw-bold small text-dark">
                  #{booking.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Layanan</span>
                <span className="fw-bold small text-dark">
                  {booking.serviceName}
                </span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2">
                <span className="fw-bold text-dark">Total Bayar</span>
                <span className="fw-bold text-primary">
                  Rp {booking.totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ) : null}

          <div className="d-grid gap-3">
            <button
              onClick={handleDownloadReceipt}
              disabled={loading || !booking}
              className="btn btn-outline-dark rounded-pill py-2 fw-bold"
            >
              <i className="fas fa-file-invoice me-2"></i> Download E-Receipt
            </button>

            <Link
              to={booking ? `/track-order/${booking.id}` : "/dashboard"}
              className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm"
              style={{ background: "var(--sb-accent)", border: "none" }}
            >
              Lacak Pesanan Saya <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          <div className="mt-4">
            <Link
              to="/dashboard"
              className="text-muted text-decoration-none small"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default PaymentSuccessPage;
