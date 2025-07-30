// File: stridebase-app/client/src/pages/PartnerInvoicePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../invoice.css'; // Kita gunakan CSS yang sama

const PartnerInvoicePage = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`process.env.API_BASE_URL + "/api/partner/invoices/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Invoice tidak ditemukan.');
                const data = await response.json();
                setInvoice(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePayNow = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`process.env.API_BASE_URL + "/api/partner/invoices/${id}/pay`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            window.location.href = data.redirectUrl; // Arahkan ke payment gateway
        } catch (error) {
            showMessage(error.message);
        }
    };

    if (loading) return <div className="p-4">Memuat tagihan...</div>;
    if (!invoice) return <div className="p-4">Tagihan tidak ditemukan.</div>;

    const isPayable = invoice.status === 'SENT' || invoice.status === 'OVERDUE';

    return (
        <div className="container-fluid px-4 py-5">
            <div className="invoice-box">
                {/* Tampilan detail invoice (mirip halaman cetak) */}
                <h1 className="invoice-title mb-4">Detail Tagihan</h1>
                <table className="items-table">
                    {/* ... (isi tabel seperti di InvoicePrintPage) ... */}
                </table>
                <div className="invoice-totals">{/* ... */}</div>
                
                <div className="text-center mt-5">
                    {isPayable ? (
                        <button onClick={handlePayNow} className="btn btn-success btn-lg">Bayar Sekarang</button>
                    ) : (
                        <p className="text-success fw-bold">Tagihan ini sudah lunas.</p>
                    )}
                    <Link to="/partner/dashboard" className="btn btn-link d-block mt-2">Kembali ke Dashboard</Link>
                </div>
            </div>
        </div>
    );
};

export default PartnerInvoicePage;