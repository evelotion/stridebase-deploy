// File: client/src/pages/AdminStoreInvoicesPage.jsx (Perbaikan Final toLocaleString)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoreInvoicesByAdmin, getStoreSettingsForAdmin } from '../services/apiService';

const AdminStoreInvoicesPage = ({ showMessage }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInvoiceHistory = useCallback(async () => {
        setLoading(true);
        try {
            const [invoicesData, storeData] = await Promise.all([
                getStoreInvoicesByAdmin(storeId),
                getStoreSettingsForAdmin(storeId)
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PAID': return 'bg-success';
            case 'SENT': return 'bg-info text-dark';
            case 'OVERDUE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    if (loading) return <div className="p-4">Memuat riwayat invoice...</div>;
    if (error) return <div className="p-4 text-danger">Error: {error}</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button onClick={() => navigate('/admin/stores')} className="btn btn-light me-3">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h2 className="fs-2 mb-0 d-inline-block">Riwayat Invoice: {storeName}</h2>
                </div>
            </div>

            <div className="table-card p-3 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>No. Invoice</th>
                                <th>Tanggal Kirim</th>
                                <th>Jatuh Tempo</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                                <th className="text-end">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="fw-bold">{invoice.invoiceNumber}</td>
                                        <td>{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</td>
                                        <td>{new Date(invoice.dueDate).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            {/* --- PERBAIKAN UTAMA DI SINI --- */}
                                            Rp {(invoice.totalAmount || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link 
                                                to={`/admin/invoice/print/${invoice.id}`} 
                                                className="btn btn-sm btn-outline-primary"
                                                target="_blank"
                                            >
                                                Lihat & Cetak
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <p className="text-muted mb-0">Belum ada invoice yang dikirim untuk toko ini.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStoreInvoicesPage;