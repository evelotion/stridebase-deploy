// File: client/src/pages/InvoicePage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./HomePageElevate.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InvoicePage = ({ showMessage }) => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Invoice tidak ditemukan.");
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  // --- FITUR BARU: PDF GENERATOR ---
  const handleDownloadPDF = () => {
    if (!booking) return;

    const doc = new jsPDF();

    // 1. Header Brand
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 110, 253); // StrideBase Blue
    doc.text("StrideBase.", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Platform Perawatan Sepatu Premium", 14, 28);

    // 2. Invoice Title & ID
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 140, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("courier", "normal");
    doc.text(`#${booking.id.substring(0, 8).toUpperCase()}`, 140, 28);
    doc.text(
      `Date: ${new Date(booking.createdAt).toLocaleDateString("id-ID")}`,
      140,
      33
    );

    // Garis Pemisah
    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // 3. Info Penagihan (Bill To & From)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("DITAGIHKAN KEPADA:", 14, 50);
    doc.text("DARI MITRA:", 110, 50);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);

    // Customer Info
    doc.text(booking.user.name, 14, 56);
    doc.text(booking.user.email, 14, 61);
    if (booking.address) {
      const addr = booking.address;
      const addrText = doc.splitTextToSize(`${addr.street}, ${addr.city}`, 80);
      doc.text(addrText, 14, 66);
    }

    // Mitra Info
    doc.text(booking.store.name, 110, 56);
    const locText = doc.splitTextToSize(booking.store.location, 80);
    doc.text(locText, 110, 61);

    // 4. Tabel Item (AutoTable)
    const tableBody = [
      [
        booking.serviceName,
        `${booking.service?.shoeType || "Standard"} - ${
          booking.service?.duration || 0
        } Min`,
        booking.status.toUpperCase(),
        `Rp ${booking.totalPrice.toLocaleString("id-ID")}`,
      ],
    ];

    autoTable(doc, {
      startY: 85,
      head: [["Layanan", "Detail", "Status", "Harga"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [13, 110, 253] }, // Blue Header
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold" },
        3: { halign: "right", fontStyle: "bold" },
      },
    });

    // 5. Total Section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 140, finalY);
    doc.text(`Rp ${booking.totalPrice.toLocaleString("id-ID")}`, 196, finalY, {
      align: "right",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 110, 253);
    doc.text("TOTAL", 140, finalY + 8);
    doc.text(
      `Rp ${booking.totalPrice.toLocaleString("id-ID")}`,
      196,
      finalY + 8,
      { align: "right" }
    );

    // 6. Footer Note
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Terima kasih telah mempercayakan sepatu Anda kepada mitra StrideBase.",
      105,
      280,
      { align: "center" }
    );
    doc.text(
      "Bukti pembayaran ini sah dan diproses secara otomatis.",
      105,
      285,
      { align: "center" }
    );

    // Save File
    doc.save(`Invoice-StrideBase-${booking.id.substring(0, 8)}.pdf`);
    if (showMessage) showMessage("Invoice berhasil diunduh.", "Success");
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

  if (error)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center text-danger"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <p>{error}</p>
          <Link to="/dashboard" className="btn btn-outline-light btn-sm">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className="home-elevate-wrapper py-5"
      style={{ minHeight: "100vh", paddingTop: "100px" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Kertas Invoice */}
            <div className="bg-white text-dark rounded-4 shadow-lg overflow-hidden position-relative">
              {/* Dekorasi Watermark */}
              <div className="position-absolute top-50 start-50 translate-middle opacity-5 pointer-events-none">
                <h1
                  className="fw-bold text-uppercase"
                  style={{
                    fontSize: "8rem",
                    color: "#f0f0f0",
                    transform: "rotate(-45deg)",
                  }}
                >
                  {booking.status}
                </h1>
              </div>

              {/* Header Biru */}
              <div className="bg-dark text-white p-5 d-flex justify-content-between align-items-center position-relative z-1">
                <div>
                  <h2 className="fw-bold mb-1">INVOICE</h2>
                  <span className="opacity-75 font-monospace small">
                    ID: {booking.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold fst-italic">StrideBase.</h4>
                  <span className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-50">
                    Official Receipt
                  </span>
                </div>
              </div>

              <div className="p-5 position-relative z-1">
                {/* Info Pengirim & Penerima */}
                <div className="row mb-5">
                  <div className="col-sm-6">
                    <h6 className="text-uppercase text-muted x-small fw-bold mb-3 tracking-widest">
                      Ditagihkan Kepada:
                    </h6>
                    <h5 className="fw-bold text-dark mb-1">
                      {booking.user.name}
                    </h5>
                    <p className="text-muted mb-0 small">
                      {booking.user.email}
                    </p>
                    {booking.address && (
                      <p className="text-muted small mt-1">
                        <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                        {booking.address.street}, {booking.address.city}
                      </p>
                    )}
                  </div>
                  <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
                    <h6 className="text-uppercase text-muted x-small fw-bold mb-3 tracking-widest">
                      Dari Mitra:
                    </h6>
                    <h5 className="fw-bold text-dark mb-1">
                      {booking.store.name}
                    </h5>
                    <p className="text-muted mb-0 small">
                      {booking.store.location}
                    </p>
                    <div className="mt-2">
                      <span className="text-muted x-small">
                        Tanggal Terbit:
                      </span>
                      <br />
                      <span className="fw-bold small">
                        {new Date(booking.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabel Item */}
                <div className="table-responsive mb-5">
                  <table className="table table-borderless">
                    <thead className="border-bottom border-dark border-2">
                      <tr>
                        <th className="py-3 ps-0 text-uppercase x-small text-muted tracking-widest">
                          Layanan
                        </th>
                        <th className="py-3 text-center text-uppercase x-small text-muted tracking-widest">
                          Status
                        </th>
                        <th className="py-3 pe-0 text-end text-uppercase x-small text-muted tracking-widest">
                          Harga
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-bottom">
                        <td className="py-4 ps-0">
                          <div className="fw-bold">{booking.serviceName}</div>
                          <div className="small text-muted mt-1">
                            <span className="badge bg-light text-dark border me-2">
                              {booking.service?.shoeType || "General"}
                            </span>
                            <i className="far fa-clock me-1"></i>{" "}
                            {booking.service?.duration} Menit
                          </div>
                        </td>
                        <td className="py-4 text-center align-middle">
                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              booking.status === "paid" ||
                              booking.status === "completed"
                                ? "bg-success bg-opacity-10 text-success"
                                : "bg-warning bg-opacity-10 text-warning"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 pe-0 text-end fw-bold align-middle fs-5">
                          Rp {booking.totalPrice.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Total */}
                <div className="row">
                  <div className="col-lg-5 ms-auto">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Subtotal Layanan</span>
                      <span className="fw-bold">
                        Rp {booking.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="border-top border-dark border-2 my-3"></div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 fw-bold mb-0">TOTAL BAYAR</span>
                      <span className="h3 fw-bold text-primary mb-0">
                        Rp {booking.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-end mt-2">
                      <small className="text-muted fst-italic">
                        Termasuk pajak & biaya layanan
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Action (Tidak ikut diprint) */}
              <div className="bg-light p-4 d-flex justify-content-between align-items-center d-print-none border-top">
                <Link
                  to="/dashboard"
                  className="btn btn-link text-muted text-decoration-none small"
                >
                  <i className="fas fa-arrow-left me-2"></i> Kembali ke
                  Dashboard
                </Link>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-dark rounded-pill px-4 btn-sm"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print me-2"></i> Print
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4 btn-sm fw-bold"
                    onClick={handleDownloadPDF}
                    style={{ background: "var(--sb-accent)", border: "none" }}
                  >
                    <i className="fas fa-file-pdf me-2"></i> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
