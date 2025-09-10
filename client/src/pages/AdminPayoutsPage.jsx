import React, { useState, useEffect, useCallback } from "react";
import { getPayoutRequests, resolvePayoutRequest } from "../services/apiService";

const AdminPayoutsPage = ({ showMessage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchPayoutRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPayoutRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchPayoutRequests();
  }, [fetchPayoutRequests]);

  const handleResolveRequest = async (requestId, status) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${status === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} permintaan ini?`)) {
      return;
    }
    setProcessingId(requestId);
    try {
      const result = await resolvePayoutRequest(requestId, status);
      // Optimistic update: hapus request dari daftar setelah diproses
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      if (showMessage) showMessage(result.message || "Permintaan berhasil diproses.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-4">Memuat permintaan penarikan dana...</div>;
  if (error && requests.length === 0) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Permintaan Penarikan Dana (Payouts)</h2>
      
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Toko</th>
                <th>Pemilik</th>
                <th className="text-end">Jumlah (Rp)</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map(req => (
                  <tr key={req.id}>
                    <td>{new Date(req.createdAt).toLocaleString('id-ID')}</td>
                    <td><span className="fw-bold">{req.store.name}</span></td>
                    <td>{req.requestedBy.name}</td>
                    <td className="text-end fw-bold">
                      {req.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleResolveRequest(req.id, 'APPROVED')}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <span className="spinner-border spinner-border-sm"></span> : 'Setujui'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleResolveRequest(req.id, 'REJECTED')}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <span className="spinner-border spinner-border-sm"></span> : 'Tolak'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">Tidak ada permintaan penarikan dana yang menunggu.</p>
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