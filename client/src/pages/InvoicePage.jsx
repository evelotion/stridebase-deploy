// File: client/src/pages/InvoicePage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./HomePageElevate.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InvoicePage = ({ showMessage }) => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null); // Ganti 'booking' jadi 'invoice'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        // PERBAIKAN: Fetch ke endpoint INVOICE, bukan BOOKING
        // Pastikan endpoint ini aksesibel (misal: /api/admin/invoices/ atau /api/partner/invoices/)
        const response = await fetch(
          `${API_BASE_URL}/api/admin/invoices/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Data tagihan tidak ditemukan.");
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [id]);

  // --- CORPORATE INVOICE GENERATOR (B2B: HQ -> PARTNER) ---
  const handleDownloadPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Color Palette (Corporate Blue)
    const brandColor = [28, 64, 212]; // #1c40d4 (StrideBase Deep Blue)
    const grayColor = [248, 249, 250];
    const textDark = [33, 37, 41];
    const textMuted = [108, 117, 125];

    // 1. HEADER & BRANDING
    // Logo Text
    doc.setFontSize(26);
    doc.setTextColor(...brandColor);
    doc.setFont("helvetica", "bold");
    doc.text("StrideBase.", 14, 25);

    // HQ Address (Static - Platform Info)
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text("Headquarters Operations", 14, 31);
    doc.text("Jakarta Selatan, Indonesia", 14, 35);
    doc.text("finance@stridebase.com", 14, 39);

    // Invoice Title & Status
    doc.setFontSize(28);
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(
      ...(invoice.status === "PAID" ? [25, 135, 84] : [220, 53, 69])
    ); // Green or Red
    doc.text(invoice.status.toUpperCase(), pageWidth - 14, 32, {
      align: "right",
    });

    doc.setTextColor(...textMuted);
    doc.setFont("courier", "normal");
    doc.text(`#${invoice.invoiceNumber}`, pageWidth - 14, 38, {
      align: "right",
    });

    // 2. BILL TO SECTION (Gray Background)
    doc.setFillColor(...grayColor);
    doc.rect(0, 50, pageWidth, 35, "F");

    // Bill To (Mitra)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text("DITAGIHKAN KEPADA:", 14, 60);

    doc.setFontSize(11);
    doc.text(invoice.store.name, 14, 66);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text(invoice.store.owner?.name || "Owner", 14, 71);
    doc.text(invoice.store.location || "Lokasi Mitra", 14, 76);

    // Dates (Right Side)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text("TANGGAL TERBIT:", pageWidth - 50, 60);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);
    doc.text(
      new Date(invoice.issueDate).toLocaleDateString("id-ID"),
      pageWidth - 50,
      65
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text("JATUH TEMPO:", pageWidth - 50, 73);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(
      ...(invoice.status !== "PAID" ? [220, 53, 69] : textMuted)
    );
    doc.text(
      new Date(invoice.dueDate).toLocaleDateString("id-ID"),
      pageWidth - 50,
      78
    );

    // 3. TABLE ITEMS
    // Mapping items dari invoice
    const tableBody = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `Rp ${item.unitPrice.toLocaleString("id-ID")}`,
      `Rp ${item.total.toLocaleString("id-ID")}`,
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["DESKRIPSI TAGIHAN", "QTY", "HARGA SATUAN", "TOTAL"]],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: brandColor,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: textDark,
      },
      columnStyles: {
        0: { cellWidth: "auto" }, // Desc
        1: { cellWidth: 20, halign: "center" }, // Qty
        2: { cellWidth: 40, halign: "right" }, // Price
        3: { cellWidth: 40, halign: "right", fontStyle: "bold" }, // Total
      },
    });

    // 4. TOTAL & PAYMENT INFO
    const finalY = doc.lastAutoTable.finalY + 10;

    // Payment Instructions (Left)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text("INFO PEMBAYARAN:", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);
    doc.text("Bank BCA: 123-456-7890", 14, finalY + 6);
    doc.text("A/N: PT StrideBase Indonesia", 14, finalY + 11);
    doc.text("Mohon cantumkan No. Invoice saat transfer.", 14, finalY + 16);

    // Grand Total (Right)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL TAGIHAN", pageWidth - 14, finalY, { align: "right" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text(
      `Rp ${invoice.totalAmount.toLocaleString("id-ID")}`,
      pageWidth - 14,
      finalY + 8,
      { align: "right" }
    );

    // 5. FOOTER
    doc.setDrawColor(200);
    doc.line(14, 270, pageWidth - 14, 270);

    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(
      "Dokumen ini diterbitkan otomatis oleh sistem StrideBase.",
      14,
      275
    );
    doc.text("Terima kasih atas kerjasama Anda.", pageWidth - 14, 275, {
      align: "right",
    });

    doc.save(`${invoice.invoiceNumber.replace(/\//g, "-")}.pdf`);
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
          <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline-dark btn-sm"
          >
            Kembali
          </button>
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
            {/* Visual Invoice Paper */}
            <div className="bg-white rounded-4 shadow-lg overflow-hidden position-relative border">
              {/* Header */}
              <div className="p-5 border-bottom">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h1 className="fw-bold text-primary mb-0">StrideBase.</h1>
                    <p className="small text-muted mb-0">Partner Invoice</p>
                  </div>
                  <div className="text-end">
                    <h2 className="fw-bold mb-1">TAGIHAN</h2>
                    <p className="font-monospace text-muted mb-0">
                      #{invoice.invoiceNumber}
                    </p>
                    <span
                      className={`badge mt-2 ${
                        invoice.status === "PAID" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-5 bg-light">
                <div className="row">
                  <div className="col-sm-6">
                    <h6 className="text-uppercase fw-bold text-muted x-small">
                      Ditagihkan Kepada:
                    </h6>
                    <h5 className="fw-bold mb-1">{invoice.store.name}</h5>
                    <p className="mb-0 text-muted small">
                      {invoice.store.owner?.name}
                    </p>
                  </div>
                  <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
                    <div className="mb-2">
                      <span className="text-muted small d-block">
                        Tanggal Terbit
                      </span>
                      <span className="fw-bold">
                        {new Date(invoice.issueDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted small d-block">
                        Jatuh Tempo
                      </span>
                      <span
                        className={`fw-bold ${
                          invoice.status !== "PAID" ? "text-danger" : ""
                        }`}
                      >
                        {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="p-5">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead className="border-bottom border-2">
                      <tr>
                        <th className="text-uppercase x-small text-muted py-3 ps-0">
                          Deskripsi
                        </th>
                        <th className="text-uppercase x-small text-muted py-3 text-center">
                          Qty
                        </th>
                        <th className="text-uppercase x-small text-muted py-3 text-end">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className="border-bottom">
                          <td className="py-4 ps-0">
                            <span className="fw-bold text-dark">
                              {item.description}
                            </span>
                          </td>
                          <td className="py-4 text-center">{item.quantity}</td>
                          <td className="py-4 text-end fw-bold">
                            Rp {item.total.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row mt-4">
                  <div className="col-md-6 text-muted small fst-italic">
                    * Harap melakukan pembayaran sebelum tanggal jatuh tempo
                    untuk menghindari pembekuan layanan.
                  </div>
                  <div className="col-md-6 text-end">
                    <h4 className="fw-bold text-primary">
                      Rp {invoice.totalAmount.toLocaleString("id-ID")}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-light p-4 border-top d-flex justify-content-between align-items-center">
                <button
                  onClick={() => window.history.back()}
                  className="btn btn-link text-muted text-decoration-none small"
                >
                  <i className="fas fa-arrow-left me-2"></i> Kembali
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                  onClick={handleDownloadPDF}
                >
                  <i className="fas fa-file-download me-2"></i> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
