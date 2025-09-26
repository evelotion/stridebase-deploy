// File: client/src/pages/PaymentSimulationPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const PaymentSimulationPage = ({ showMessage }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    // URL ini akan menjadi tujuan dari QR code
    const paymentSuccessUrl = `${window.location.origin}/payment-success/${bookingId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentSuccessUrl)}`;

    useEffect(() => {
        const fetchBooking = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage("Sesi tidak valid, silakan login kembali.", "Error");
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Gagal mengambil detail pesanan.");
                const data = await response.json();
                setBooking(data);
            } catch (error) {
                showMessage(error.message, "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, navigate, showMessage]);

    if (loading) {
        return <div className="container py-5 text-center">Memuat halaman pembayaran...</div>;
    }

    if (!booking) {
        return <div className="container py-5 text-center">Gagal memuat detail pesanan untuk pembayaran.</div>;
    }

    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className="fas fa-qrcode"></i>
                </div>
                <h2 className="success-title">Simulasi Pembayaran</h2>
                <p className="success-details mb-4">
                    Scan QR code di bawah ini dengan kamera ponsel Anda untuk melanjutkan ke halaman konfirmasi pembayaran.
                </p>

                <div className="booking-recap">
                    <img src={qrCodeUrl} alt="QR Code Pembayaran" />
                     <p className="text-muted small mt-3">
                        Total Bayar: <strong>Rp {booking.totalPrice.toLocaleString('id-ID')}</strong>
                    </p>
                </div>

                <div className="alert alert-info mt-4">
                    <i className="fas fa-info-circle me-2"></i>
                    Ini adalah halaman simulasi. Di aplikasi nyata, halaman ini akan digantikan oleh halaman pembayaran dari Midtrans atau payment gateway lainnya.
                </div>
            </div>
        </main>
    );
};

export default PaymentSimulationPage;