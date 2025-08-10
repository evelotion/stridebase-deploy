import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../invoice.css"; // Tetap gunakan file CSS yang sama
import API_BASE_URL from "../apiConfig";

const InvoicePrintPage = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null); // State untuk menyimpan tema

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Ambil data invoice dan theme secara bersamaan
        const [invoiceRes, themeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/invoices/${invoiceId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/public/theme-config`),
        ]);

        if (!invoiceRes.ok) throw new Error("Gagal mengambil detail invoice.");
        const invoiceData = await invoiceRes.json();
        setInvoice(invoiceData);

        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setTheme(themeData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && theme) {
      // Tunggu invoice dan theme siap sebelum mencetak
      window.print();
    }
  }, [invoice, theme]);

  if (loading) return <div>Memuat invoice...</div>;
  if (!invoice) return <div>Invoice tidak ditemukan.</div>;

  return (
    <div className="invoice-box">
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
            <span className={`status-${invoice.status.toLowerCase()}`}>
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
            {invoice.store.ownerUser?.email || "Email tidak tersedia"}
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
          {invoice.items.map((item) => (
            <tr key={item.id}>
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
        <p>Terima kasih atas kerja sama Anda.</p>
        <p>StrideBase Marketplace &copy; 2025</p>
      </footer>
    </div>
  );
};

export default InvoicePrintPage;
