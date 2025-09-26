// File: client/src/pages/PaymentSuccessPage.jsx (BARU)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingDetails } from '../services/apiService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PaymentSuccessPage = ({ showMessage }) => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await getBookingDetails(bookingId);
                setBooking(data);
            } catch (error) {
                showMessage(error.message, "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, showMessage]);

    const generatePDF = () => {
        if (!booking) return;

        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Tanda Terima Pembayaran - StrideBase", 14, 22);
        doc.setFontSize(12);
        doc.text(`ID Pesanan: #${booking.id}`, 14, 32);
        doc.text(`Tanggal: ${new Date(booking.createdAt).toLocaleString('id-ID')}`, 14, 39);
        
        doc.autoTable({
            startY: 50,
            head: [['Deskripsi', 'Jumlah', 'Harga']],
            body: [
                [booking.serviceName, '1', `Rp ${booking.totalPrice.toLocaleString('id-ID')}`],
            ],
            foot: [['Total', '', `Rp ${booking.totalPrice.toLocaleString('id-ID')}`]]
        });

        doc.save(`receipt-stridebase-${booking.id.substring(0, 8)}.pdf`);
    };

    if (loading) return <div className="container py-5 text-center">Memuat tanda terima...</div>;
    if (!booking) return <div className="container py-5 text-center">Gagal memuat data pesanan.</div>;

    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className="fas fa-check-circle text-success"></i>
                </div>
                <h2 className="success-title">Pembayaran Berhasil!</h2>
                <p className="success-details mb-4">
                    Pesanan Anda telah kami konfirmasi. Silakan lacak status pengerjaan di dashboard Anda.
                </p>

                <div className="d-flex justify-content-center gap-2 mt-4">
                    <button onClick={generatePDF} className="btn btn-dark">
                        <i className="fas fa-download me-2"></i>Unduh Tanda Terima (PDF)
                    </button>
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                        Lihat Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default PaymentSuccessPage;