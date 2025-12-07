// File: client/src/pages/InvoicePrintPage.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InvoicePrintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    // Ambil data dari state navigasi (dikirim dari AdminStoresPage)
    if (location.state?.invoiceData) {
      setInvoiceData(location.state.invoiceData);
    } else {
      // Jika diakses langsung tanpa data, kembali
      navigate("/admin/stores");
    }
  }, [location, navigate]);

  const handleDownloadPDF = () => {
    if (!invoiceData) return;

    const doc = new jsPDF();
    const { invoiceNumber, store, issueDate, dueDate, items, totalAmount } =
      invoiceData;

    // -- PDF GENERATION LOGIC --
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`No: ${invoiceNumber}`, 14, 28);
    doc.text(
      `Tanggal: ${new Date(issueDate).toLocaleDateString("id-ID")}`,
      14,
      33
    );

    // Info Mitra
    doc.text("DITAGIHKAN KEPADA:", 14, 45);
    doc.setFont("helvetica", "bold");
    doc.text(store.name, 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(store.location || "", 14, 55);

    // Tabel
    const tableBody = items.map((item) => [
      item.description,
      `Rp ${item.unitPrice.toLocaleString()}`,
      item.quantity,
      `Rp ${item.total.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Deskripsi", "Harga Satuan", "Qty", "Total"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `TOTAL TAGIHAN: Rp ${totalAmount.toLocaleString("id-ID")}`,
      196,
      finalY,
      { align: "right" }
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Jatuh Tempo: ${new Date(dueDate).toLocaleDateString("id-ID")}`,
      196,
      finalY + 6,
      { align: "right" }
    );

    doc.save(`${invoiceNumber.replace(/\//g, "-")}.pdf`);
  };

  if (!invoiceData) return null;

  return (
    <div className="min-vh-100 bg-secondary bg-opacity-25 py-5 d-flex justify-content-center">
      <div
        className="bg-white p-5 shadow-lg"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* Visual Preview di Layar */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
          <h1 className="fw-bold text-dark">INVOICE</h1>
          <div className="text-end">
            <h5 className="mb-0">StrideBase HQ</h5>
            <small className="text-muted">Platform Management</small>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-6">
            <h6 className="text-muted small text-uppercase">Kepada</h6>
            <h4 className="fw-bold">{invoiceData.store.name}</h4>
            <p className="text-muted mb-0">{invoiceData.store.location}</p>
          </div>
          <div className="col-6 text-end">
            <h6 className="text-muted small text-uppercase">Detail</h6>
            <p className="mb-0">
              <strong>No:</strong> {invoiceData.invoiceNumber}
            </p>
            <p className="mb-0">
              <strong>Tgl:</strong>{" "}
              {new Date(invoiceData.issueDate).toLocaleDateString("id-ID")}
            </p>
            <p className="mb-0 text-danger">
              <strong>Jatuh Tempo:</strong>{" "}
              {new Date(invoiceData.dueDate).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <table className="table table-bordered mb-4">
          <thead className="table-light">
            <tr>
              <th>Deskripsi</th>
              <th className="text-end">Harga</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td className="text-end">
                  Rp {item.unitPrice.toLocaleString()}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">Rp {item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-end">
          <h3 className="fw-bold">
            Rp {invoiceData.totalAmount.toLocaleString("id-ID")}
          </h3>
        </div>

        {/* Floating Action Buttons */}
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 d-flex gap-3 p-3 bg-dark rounded-pill shadow">
          <button
            className="btn btn-light rounded-pill px-4"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-2"></i> Kembali
          </button>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={handleDownloadPDF}
          >
            <i className="fas fa-download me-2"></i> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPage;
