// File: client/src/pages/PaymentSimulationPage.jsx (Updated)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const PaymentSimulationPage = ({ showMessage }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60); // Countdown 1 menit (60 detik)

    // Fungsi untuk membatalkan pesanan
    const handleCancelBooking = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Gagal membatalkan pesanan.");
            
            showMessage("Waktu pembayaran habis. Pesanan Anda telah dibatalkan.", "Info");
            navigate('/dashboard/orders'); // Arahkan ke halaman riwayat pesanan
        } catch (error) {
            showMessage(error.message, "Error");
        }
    }, [bookingId, navigate, showMessage]);

    // Effect untuk countdown timer
    useEffect(() => {
        if (timeLeft === 0) {
            handleCancelBooking();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        // Cleanup interval saat komponen di-unmount atau timeLeft berubah
        return () => clearInterval(intervalId);
    }, [timeLeft, handleCancelBooking]);


    // Effect untuk mengambil data booking
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
                
                // Jika pesanan sudah tidak PENDING, arahkan pergi
                if (data.status !== 'PENDING') {
                    showMessage(`Halaman ini tidak valid karena status pesanan sudah ${data.status}.`, "Info");
                    navigate('/dashboard/orders');
                    return;
                }

                setBooking(data);
            } catch (error) {
                showMessage(error.message, "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, navigate, showMessage]);

    // Format waktu untuk display
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (loading) {
        return <div className="container py-5 text-center">Memuat halaman pembayaran...</div>;
    }

    if (!booking) {
        return <div className="container py-5 text-center">Gagal memuat detail pesanan untuk pembayaran.</div>;
    }

    const paymentSuccessUrl = `${window.location.origin}/payment-success/${bookingId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentSuccessUrl)}`;

    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className="fas fa-qrcode"></i>
                </div>
                <h2 className="success-title">Simulasi Pembayaran</h2>
                <p className="success-details mb-2">
                    Scan QR code di bawah ini dengan kamera ponsel Anda untuk melanjutkan.
                </p>
                <div className="timer-box alert alert-warning">
                    Selesaikan pembayaran dalam: <strong>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</strong>
                </div>

                <div className="booking-recap my-4">
                    <img src={qrCodeUrl} alt="QR Code Pembayaran" />
                     <p className="text-muted small mt-3">
                        Total Bayar: <strong>Rp {booking.totalPrice.toLocaleString('id-ID')}</strong>
                    </p>
                </div>

                <div className="alert alert-info mt-4">
                    <i className="fas fa-info-circle me-2"></i>
                    Ini adalah halaman simulasi. Jika waktu habis, pesanan akan otomatis dibatalkan.
                </div>
            </div>
        </main>
    );
};

export default PaymentSimulationPage;