import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const InvoicePage = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookingDetails = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`process.env.API_BASE_URL + "/api/bookings/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Invoice tidak ditemukan atau Anda tidak memiliki akses.');
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
    }, [id]);

    if (loading) {
        return <div className="container py-5 text-center">Memuat invoice...</div>;
    }

    if (error) {
        return <div className="container py-5 text-center text-danger">{error}</div>;
    }

    if (!booking) {
        return <div className="container py-5 text-center">Data invoice tidak ditemukan.</div>;
    }

    return (
        <div className="container py-5 mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">Invoice / Tanda Terima</h4>
                        </div>
                        <div className="card-body p-4">
                            <div className="row mb-4">
                                <div className="col-sm-6">
                                    <h6 className="mb-3">Kepada:</h6>
                                    <div><strong>{booking.user.name}</strong></div>
                                    <div>{booking.user.email}</div>
                                </div>
                                <div className="col-sm-6 text-sm-end">
                                    <h6 className="mb-3">Dari:</h6>
                                    <div><strong>{booking.store.name}</strong></div>
                                    <div>{booking.store.location}</div>
                                </div>
                            </div>

                            <div className="table-responsive-sm">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Layanan</th>
                                            <th>Status</th>
                                            <th>Tanggal</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{booking.serviceName}</td>
                                            <td><span className="badge bg-success">{booking.status}</span></td>
                                            <td>{new Date(booking.bookingDate).toLocaleDateString('id-ID')}</td>
                                            <td className="text-end">Rp {booking.totalPrice.toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="row">
                                <div className="col-lg-4 col-sm-5 ms-auto">
                                    <table className="table table-clear">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold">Subtotal</td>
                                                <td className="text-end">Rp {(booking.totalPrice - 2000).toLocaleString('id-ID')}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Biaya Penanganan</td>
                                                <td className="text-end">Rp 2.000</td>
                                            </tr>
                                            <tr className="bg-light">
                                                <td className="fw-bold">Total</td>
                                                <td className="text-end fw-bold">Rp {booking.totalPrice.toLocaleString('id-ID')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <Link to="/dashboard" className="btn btn-outline-dark">
                                    <i className="fas fa-arrow-left me-2"></i>Kembali ke Dashboard
                                </Link>
                                <button className="btn btn-dark" onClick={() => window.print()}>
                                    <i className="fas fa-print me-2"></i>Cetak Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;