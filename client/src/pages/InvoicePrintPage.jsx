// File: client/src/pages/InvoicePrintPage.jsx (Versi Final dengan Mode Pratinjau & Detail Penerbit)

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../invoice.css";
import API_BASE_URL from "../apiConfig";
import { getInvoiceByIdForAdmin } from "../services/apiService";

const InvoicePrintPage = () => {
  const { invoiceId } = useParams();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // Cek apakah ini mode pratinjau dari state navigasi
  const isPreview = useMemo(() => location.state?.isPreview, [location.state]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Ambil data tema secara paralel
        const themeRes = await fetch(`${API_BASE_URL}/api/public/theme-config`);
        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setTheme(themeData);
        }

        // Jika ini mode PRATINJAU, ambil data dari state
        if (isPreview && location.state.invoiceData) {
          setInvoice(location.state.invoiceData);
        }
        // Jika BUKAN mode pratinjau, ambil dari API berdasarkan ID
        else if (invoiceId) {
          const invoiceData = await getInvoiceByIdForAdmin(invoiceId);
          setInvoice(invoiceData);
        } else {
          throw new Error("Data invoice tidak ditemukan.");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [invoiceId, isPreview, location.state]);

  useEffect(() => {
    // Otomatis picu dialog cetak jika BUKAN mode pratinjau dan data sudah siap
    if (!isPreview && invoice && theme) {
      window.print();
    }
  }, [isPreview, invoice, theme]);

  if (loading) return <div>Memuat invoice...</div>;
  if (!invoice) return <div>Invoice tidak ditemukan.</div>;

  const getStatusClass = (status) => {
    switch (status) {
      case "PAID":
        return "status-paid";
      case "SENT":
        return "status-sent";
      case "OVERDUE":
        return "status-overdue";
      default:
        return "status-preview";
    }
  };

  return (
    <div className="invoice-box">
      {isPreview && (
        <div className="preview-banner">
          --- INI ADALAH PRATINJAU / PREVIEW ---
        </div>
      )}
      <header className="invoice-header">
        <div className="invoice-header__logo">
          {theme?.branding?.logoUrl ? (
            <img src={theme.branding.logoUrl} alt="StrideBase Logo" />
          ) : (
            <h2>StrideBase</h2>
          )}
        </div>
        <div className="invoice-header__details">
          <h1>INVOICE</h1>
          <p>
            <strong>No:</strong> {invoice.invoiceNumber}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={getStatusClass(invoice.status)}>
              {invoice.status}
            </span>
          </p>
        </div>
      </header>

      <section className="invoice-meta">
        <div className="invoice-meta__client">
          <h4>Ditagihkan Kepada:</h4>
          <p>
            <strong>{invoice.store.name}</strong>
            <br />
            {invoice.store.location}
            <br />
            {invoice.store.owner?.email ||
              invoice.store.ownerUser?.email ||
              "Email tidak tersedia"}
          </p>
        </div>
        <div className="invoice-meta__dates">
          <p>
            <strong>Tanggal Terbit:</strong>
            <br />
            {new Date(invoice.issueDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Tanggal Jatuh Tempo:</strong>
            <br />
            {new Date(invoice.dueDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <table className="items-table">
        <thead>
          <tr>
            <th className="item-desc">Deskripsi</th>
            <th className="item-qty">Jumlah</th>
            <th className="item-price">Harga Satuan</th>
            <th className="item-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, index) => (
            <tr key={item.id || index}>
              <td>{item.description}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">
                Rp {item.unitPrice.toLocaleString("id-ID")}
              </td>
              <td className="text-right">
                Rp {item.total.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="invoice-summary">
        <div className="invoice-summary__totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="total-row grand-total">
            <span>TOTAL TAGIHAN</span>
            <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </section>

      {invoice.notes && (
        <section className="invoice-notes">
          <h4>Catatan:</h4>
          <p>{invoice.notes}</p>
        </section>
      )}

      <footer className="invoice-footer">
        <div className="audit-trail">
          <p>
            Diterbitkan oleh: {invoice.issuer?.name || "N/A"} (ID:{" "}
            {invoice.issuer?.id || "N/A"})
            <br />
            Tanggal Cetak:{" "}
            {new Date().toLocaleString("id-ID", {
              dateStyle: "full",
              timeStyle: "long",
            })}
          </p>
        </div>
        <p>Terima kasih atas kerja sama Anda.</p>
        <p>StrideBase Marketplace &copy; 2025</p>
      </footer>
    </div>
  );
};

export default InvoicePrintPage;
