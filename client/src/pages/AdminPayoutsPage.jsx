import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';
import MessageBox from '../components/MessageBox';

const AdminPayoutsPage = () => {
    const [payoutRequests, setPayoutRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(null); // Menyimpan ID request yang sedang diproses

    const fetchPayoutRequests = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/payout-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Gagal mengambil data permintaan penarikan.');
            }
            const data = await response.json();
            setPayoutRequests(data);
        } catch (error) {
            setIsError(true);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayoutRequests();
    }, []);

    const handleResolveRequest = async (requestId, newStatus) => {
        if (!confirm(`Apakah Anda yakin ingin ${newStatus === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} permintaan ini? Aksi ini tidak dapat dibatalkan.`)) {
            return;
        }

        setSubmitting(requestId);
        setMessage('');
        setIsError(false);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/payout-requests/${requestId}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ newStatus }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memproses permintaan.');
            }
            
            setIsError(false);
            setMessage(data.message);
            // Refresh data setelah berhasil
            fetchPayoutRequests();

        } catch (error) {
            setIsError(true);
            setMessage(error.message);
        } finally {
            setSubmitting(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);
      };
      
       const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

    if (loading) {
        return <div className="p-4">Memuat data...</div>;
    }

    return (
        <div className="container-fluid px-4">
            <h2 className="fs-2 my-4">Manajemen Penarikan Dana</h2>
            {message && <MessageBox message={message} isError={isError} onDismiss={() => setMessage('')} />}

            <div className="table-card p-3 shadow-sm">
                 <p className="form-text mb-3">Halaman ini menampilkan semua permintaan penarikan dana dari mitra yang menunggu persetujuan Anda.</p>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Tanggal Permintaan</th>
                                <th>Nama Toko</th>
                                <th>Pemilik</th>
                                <th className="text-end">Jumlah</th>
                                <th className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutRequests.length > 0 ? (
                                payoutRequests.map(req => (
                                    <tr key={req.id}>
                                        <td>{formatDate(req.createdAt)}</td>
                                        <td>{req.store.name}</td>
                                        <td>{req.requestedBy.name}</td>
                                        <td className="text-end fw-bold">{formatCurrency(req.amount)}</td>
                                        <td className="text-center">
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleResolveRequest(req.id, 'APPROVED')}
                                                    disabled={submitting === req.id}
                                                >
                                                    <i className="fas fa-check me-1"></i>
                                                    {submitting === req.id ? 'Memproses...' : 'Setujui'}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleResolveRequest(req.id, 'REJECTED')}
                                                    disabled={submitting === req.id}
                                                >
                                                    <i className="fas fa-times me-1"></i>
                                                    {submitting === req.id ? 'Memproses...' : 'Tolak'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        Tidak ada permintaan penarikan dana yang menunggu.
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

export default AdminPayoutsPage;