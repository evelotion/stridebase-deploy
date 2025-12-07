// File: client/src/pages/AdminStoreInvoicesPage.jsx (Elevate Redesign)

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  getStoreInvoicesByAdmin,
  getStoreSettingsForAdmin,
} from "../services/apiService";
import "../styles/ElevateDashboard.css"; // Pastikan CSS Elevate terhubung

const AdminStoreInvoicesPage = ({ showMessage }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoiceHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [invoicesData, storeData] = await Promise.all([
        getStoreInvoicesByAdmin(storeId),
        getStoreSettingsForAdmin(storeId),
      ]);
      setInvoices(invoicesData);
      setStoreName(storeData.name);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [storeId, showMessage]);

  useEffect(() => {
    fetchInvoiceHistory();
  }, [fetchInvoiceHistory]);

  // --- HELPER: Status Badge dengan Gaya Elevate ---
  const getStatusBadge = (status) => {
    let badgeClass = "pe-badge-secondary";
    let icon = "fa-circle";

    switch (status) {
      case "PAID":
        badgeClass = "pe-badge-success";
        icon = "fa-check-circle";
        break;
      case "SENT":
        badgeClass = "pe-badge-info";
        icon = "fa-paper-plane";
        break;
      case "OVERDUE":
        badgeClass = "pe-badge-danger";
        icon = "fa-exclamation-circle";
        break;
      case "PENDING":
        badgeClass = "pe-badge-warning";
        icon = "fa-clock";
        break;
      default:
        break;
    }

    return (
      <span className={`pe-badge ${badgeClass}`}>
        <i className={`fas ${icon} me-1`}></i> {status}
      </span>
    );
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-danger">
        <i className="fas fa-exclamation-triangle fs-1 mb-3"></i>
        <p>Error: {error}</p>
        <button
          onClick={() => navigate("/admin/stores")}
          className="pe-btn-action mt-3"
        >
          Kembali
        </button>
      </div>
    );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      {/* Background Blob Decoration */}
      <div className="pe-blob pe-blob-2"></div>

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-end mb-5 position-relative z-2">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              <Link
                to="/admin/stores"
                className="text-decoration-none text-muted hover-white"
              >
                <i className="fas fa-arrow-left me-2"></i>Kembali ke Toko
              </Link>
            </h6>
            <h2 className="pe-title mb-0">
              Riwayat Invoice: <span className="text-info">{storeName}</span>
            </h2>
          </div>
        </Fade>
      </div>

      {/* TABLE CARD */}
      <Fade triggerOnce>
        <div className="pe-card position-relative z-2">
          <div className="pe-table-wrapper">
            <table className="pe-table align-middle">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Tanggal Kirim</th>
                  <th>Jatuh Tempo</th>
                  <th>Jumlah Tagihan</th>
                  <th>Status</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="pe-table-row-hover">
                      <td>
                        <span className="fw-bold text-white font-monospace">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(invoice.issueDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="text-muted small">
                        {new Date(invoice.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className="fw-bold text-white fs-6">
                          Rp{" "}
                          {(invoice.totalAmount || 0).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td>{getStatusBadge(invoice.status)}</td>
                      <td className="text-end">
                        <Link
                          to={`/admin/invoice/print/${invoice.id}`}
                          className="pe-btn-action py-1 px-3 text-decoration-none"
                          target="_blank"
                          title="Lihat & Cetak PDF"
                        >
                          <i className="fas fa-print me-2"></i> Cetak
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="fas fa-file-invoice-dollar fs-1 mb-3 opacity-25"></i>
                      <p className="mb-0">
                        Belum ada invoice yang dikirim untuk toko ini.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default AdminStoreInvoicesPage;
