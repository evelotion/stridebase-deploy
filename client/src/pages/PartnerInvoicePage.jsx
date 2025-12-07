// File: client/src/pages/PartnerInvoicePage.jsx

import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import "../styles/ElevateDashboard.css";

const PartnerInvoicePage = ({ showMessage }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/partner/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/payment/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invoiceId }), // Kirim invoiceId
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      if (data.paymentMethod === "simulation") {
        // Redirect ke halaman simulasi dengan tipe invoice
        window.location.href = `/payment-simulation/${invoiceId}?type=invoice`;
      } else {
        window.snap.pay(data.token, {
          onSuccess: () => {
            showMessage("Pembayaran Berhasil!", "Success");
            fetchInvoices();
          },
          onPending: () => showMessage("Menunggu Pembayaran...", "Info"),
          onError: () => showMessage("Pembayaran Gagal.", "Error"),
        });
      }
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  if (loading)
    return (
      <div className="pe-dashboard-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-1"></div>
      <div className="container-fluid px-4 py-4 position-relative z-1">
        <Fade direction="down" triggerOnce>
          <div className="mb-5">
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Kewajiban & Kontrak
            </h6>
            <h2 className="pe-title display-6 mb-0">Tagihan Saya</h2>
          </div>
        </Fade>

        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Periode / Keterangan</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th className="text-end">Jumlah</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="text-white font-monospace small">
                        {inv.invoiceNumber}
                      </td>
                      <td>
                        <div className="text-muted small">
                          {inv.items && inv.items[0]?.description}
                        </div>
                        {inv.notes && (
                          <div className="x-small text-info fst-italic">
                            "{inv.notes}"
                          </div>
                        )}
                      </td>
                      <td className="text-muted small">
                        {new Date(inv.dueDate).toLocaleDateString("id-ID")}
                      </td>
                      <td>
                        <span
                          className={`pe-badge ${
                            inv.status === "PAID"
                              ? "pe-badge-success"
                              : "pe-badge-danger"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-white">
                        Rp {inv.totalAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="text-end">
                        {inv.status !== "PAID" && (
                          <button
                            className="pe-btn-action btn-sm text-warning"
                            onClick={() => handlePayInvoice(inv.id)}
                          >
                            Bayar Sekarang{" "}
                            <i className="fas fa-arrow-right ms-1"></i>
                          </button>
                        )}
                        {inv.status === "PAID" && (
                          <span className="text-muted small">
                            <i className="fas fa-check-circle me-1"></i> Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Tidak ada tagihan aktif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerInvoicePage;
