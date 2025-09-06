import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const loader = ({ params }) => {
  const { storeId } = params;
  const token = localStorage.getItem("token");

  if (!token) {
    // In a real app, you'd redirect. Here we'll rely on the component to handle loading state.
    return { storeId, token: null };
  }
  return { storeId, token };
};

const AdminStoreInvoicePage = () => {
  const { storeId, token } = useLoaderData();
  const [store, setStore] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Autentikasi dibutuhkan. Silakan login kembali.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [storeRes, invoicesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stores/${storeId}`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/stores/${storeId}/invoices`, { headers }),
        ]);

        if (!storeRes.ok) throw new Error(`Gagal memuat data toko: ${storeRes.statusText}`);
        if (!invoicesRes.ok) throw new Error(`Gagal memuat data invoice: ${invoicesRes.statusText}`);

        const storeData = await storeRes.json();
        const invoicesData = await invoicesRes.json();

        setStore(storeData);
        setInvoices(invoicesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, token]);

  const downloadInvoice = (invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Invoice #${invoice.invoiceNumber}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Untuk: ${store.name}`, 14, 32);
    doc.text(`Periode: ${new Date(invoice.startDate).toLocaleDateString()} - ${new Date(invoice.endDate).toLocaleDateString()}`, 14, 38);

    doc.autoTable({
      startY: 50,
      head: [['Deskripsi', 'Jumlah']],
      body: [
        ['Biaya Langganan Tier', `Rp ${invoice.amount.toLocaleString()}`],
        ['Status', invoice.status],
      ],
      foot: [['Total', `Rp ${invoice.amount.toLocaleString()}`]]
    });
    
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  if (loading) return <div className="admin-container"><p>Memuat data...</p></div>;
  if (error) return <div className="admin-container"><p className="error-message">{error}</p></div>;
  if (!store) return <div className="admin-container"><p>Toko tidak ditemukan.</p></div>;

  return (
    <div className="admin-container">
      <h2>Invoice untuk {store.name}</h2>
      <p>Berikut adalah riwayat tagihan untuk toko ini.</p>
      
      <table>
        <thead>
          <tr>
            <th>Nomor Invoice</th>
            <th>Periode</th>
            <th>Jumlah</th>
            <th>Status</th>
            <th>Tanggal Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{`${new Date(invoice.startDate).toLocaleDateString()} - ${new Date(invoice.endDate).toLocaleDateString()}`}</td>
                <td>Rp {invoice.amount.toLocaleString()}</td>
                <td>{invoice.status}</td>
                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => downloadInvoice(invoice)}>Unduh PDF</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Belum ada invoice untuk toko ini.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Note: useLoaderData hook isn't standard in React, assuming it's from a library like React Router.
// For this to work with React Router v6.4+, you should export the loader and use useLoaderData().
// I'll simulate this with a simple custom hook for standalone component clarity.
const useLoaderData = () => {
    const { storeId } = useParams();
    const token = localStorage.getItem('token');
    return { storeId, token };
}


export default AdminStoreInvoicePage;