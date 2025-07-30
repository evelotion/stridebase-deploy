// File: client/src/pages/TrackOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from "socket.io-client";

// Inisialisasi socket di luar komponen agar tidak dibuat ulang terus-menerus
<<<<<<< HEAD
const socket = io("http://localhost:5000");
=======
const socket = io("");
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3

// Komponen untuk satu langkah di progress bar
const ProgressStep = ({ icon, title, active }) => (
    <div className={`progress-step ${active ? 'active' : ''}`}>
        <div className="progress-step-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="progress-step-title">{title}</div>
    </div>
);

const TrackOrderPage = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const workStages = [
        { status: 'RECEIVED', icon: 'fa-receipt', title: 'Diterima' },
        { status: 'WASHING', icon: 'fa-soap', title: 'Pencucian' },
        { status: 'DRYING', icon: 'fa-wind', title: 'Pengeringan' },
        { status: 'QUALITY_CHECK', icon: 'fa-clipboard-check', title: 'Pengecekan' },
        { status: 'READY_FOR_PICKUP', icon: 'fa-box-open', title: 'Siap Diambil' }
    ];

    useEffect(() => {
        const fetchBookingDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Silakan login untuk melihat detail pesanan.");
                setLoading(false);
                return;
            }
            try {
                // Endpoint ini harus dibuat/disesuaikan untuk mengambil detail booking tunggal
<<<<<<< HEAD
                const response = await fetch(`/api/bookings/${bookingId}`, {
=======
                const response = await fetch(`import.meta.env.VITE_API_BASE_URL + "/api/bookings/${bookingId}`, {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
                }
                const data = await response.json();
                setBooking(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();

        // Listener untuk update real-time dari Socket.IO
        const handleBookingUpdate = (updatedBooking) => {
            if (updatedBooking.id === bookingId) {
                console.log("🔥 Menerima update status pengerjaan:", updatedBooking.workStatus);
                setBooking(prev => ({ ...prev, ...updatedBooking }));
            }
        };
        socket.on('bookingUpdated', handleBookingUpdate);

        // Cleanup listener saat komponen unmount
        return () => {
            socket.off('bookingUpdated', handleBookingUpdate);
        };

    }, [bookingId]);

    const currentStageIndex = booking ? workStages.findIndex(stage => stage.status === booking.workStatus) : -1;

    if (loading) {
        return <div className="container py-5 text-center">Memuat detail pelacakan...</div>;
    }

    if (error) {
        return <div className="container py-5 text-center text-danger">{error}</div>;
    }

    if (!booking) {
        return <div className="container py-5 text-center">Data pesanan tidak ditemukan.</div>;
    }

    return (
        <div className="container py-5 mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white text-center">
                            <h4 className="mb-0">Lacak Pesanan Anda</h4>
                            <p className="mb-0 small">ID Pesanan: {booking.id}</p>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <div className="mb-4">
                                <h5 className="fw-bold">{booking.serviceName}</h5>
                                <p className="text-muted mb-0">di <strong>{booking.store.name}</strong></p>
                            </div>
                            
                            <div className="progress-tracker-container">
                                <div className="progress-bar-line" style={{ width: `${(currentStageIndex / (workStages.length - 1)) * 100}%` }}></div>
                                {workStages.map((stage, index) => (
                                    <ProgressStep 
                                        key={stage.status}
                                        icon={stage.icon}
                                        title={stage.title}
                                        active={index <= currentStageIndex}
                                    />
                                ))}
                            </div>

                            <div className="text-center mt-4 p-3 bg-light rounded">
                                <p className="mb-1 text-muted">Status Terkini:</p>
                                <h5 className="fw-bold text-primary">{workStages[currentStageIndex]?.title || 'Menunggu Konfirmasi'}</h5>
                            </div>

                            <hr className="my-4"/>
                            <div className="text-center">
                                <Link to="/dashboard" className="btn btn-outline-dark">
                                    <i className="fas fa-arrow-left me-2"></i>Kembali ke Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;