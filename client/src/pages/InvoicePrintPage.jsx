import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../invoice.css";

const InvoicePrintPage = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal mengambil detail invoice.");
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [invoiceId]);

  useEffect(() => {
    if (invoice) {
      window.print();
    }
  }, [invoice]);

  if (loading) return <div>Memuat invoice...</div>;
  if (!invoice) return <div>Invoice tidak ditemukan.</div>;

  return (
    <div className="invoice-box">
      <div className="invoice-header">
        <div>
          <h1 className="invoice-title">INVOICE</h1>
          <div className="invoice-number">#{invoice.invoiceNumber}</div>
        </div>
        <div>
          <div className="stridebase-logo">StrideBase</div>
        </div>
      </div>

      <div className="invoice-meta">
        <div className="meta-section">
          <strong>Ditagihkan Kepada:</strong>
          <address>
            {invoice.store.name}
            <br />
            {invoice.store.location}
            <br />
            {invoice.store.ownerUser?.email || "Email tidak tersedia"}
          </address>
        </div>
        <div className="meta-section text-end">
          <strong>Tanggal Terbit:</strong>{" "}
          {new Date(invoice.issueDate).toLocaleDateString("id-ID")}
          <br />
          <strong>Tanggal Jatuh Tempo:</strong>{" "}
          {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
          <br />
          <strong>Status:</strong>{" "}
          <span className="status-paid">{invoice.status}</span>
        </div>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th>Jumlah</th>
            <th>Harga Satuan</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>Rp {item.unitPrice.toLocaleString("id-ID")}</td>
              <td>Rp {item.total.toLocaleString("id-ID")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <div className="total-row">
          <strong>Subtotal:</strong>
          <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
        </div>
        <div className="total-row grand-total">
          <strong>Grand Total:</strong>
          <span>Rp {invoice.totalAmount.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="invoice-footer">
        <p>Terima kasih atas pembayaran Anda.</p>
        <p>StrideBase Marketplace</p>
      </div>
    </div>
  );
};

export default InvoicePrintPage;
