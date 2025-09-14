// File: client/src/pages/AdminStoresPage.jsx (Versi Final dengan Tombol Edit)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom"; // Pastikan Link diimpor
import { getAllStoresForAdmin, updateStoreStatus } from "../services/apiService";

const AdminStoresPage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllStoresForAdmin();
      setStores(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleStatusChange = async (storeId, newStatus) => {
    try {
      await updateStoreStatus(storeId, newStatus);
      setStores(prevStores =>
        prevStores.map(store =>
          store.id === storeId ? { ...store, storeStatus: newStatus } : store
        )
      );
      if (showMessage) showMessage("Status toko berhasil diubah.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active": return "bg-success";
      case "pending": return "bg-warning text-dark";
      case "rejected": return "bg-danger";
      case "inactive": return "bg-secondary";
      default: return "bg-light text-dark";
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || store.storeStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, filterStatus]);

  if (loading) return <div className="p-4">Memuat data toko...</div>;
  if (error && stores.length === 0) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
       <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fs-2 mb-0">Manajemen Toko</h2>
        <Link to="/admin/stores/new" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Tambah Toko Baru
        </Link>
      </div>
      <div className="card card-account p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Cari toko berdasarkan nama atau pemilik..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="rejected">Ditolak</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Toko</th>
                <th>Pemilik</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Rating</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.length > 0 ? (
                filteredStores.map(store => (
                  <tr key={store.id}>
                    <td><span className="fw-bold">{store.name}</span></td>
                    <td>{store.owner}</td>
                    <td><span className={`badge ${getStatusBadge(store.storeStatus)}`}>{store.storeStatus}</span></td>
                    <td><span className={`badge ${store.tier === 'PRO' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>{store.tier}</span></td>
                    <td><i className="fas fa-star text-warning me-1"></i> {store.rating || 'N/A'}</td>
                    <td className="text-end">
                      
                      {/* --- TOMBOL BARU DITAMBAHKAN DI SINI --- */}
                      <Link to={`/admin/stores/${store.id}/settings`} className="btn btn-sm btn-primary me-2">
                        Kelola Toko
                      </Link>
                      {/* --- AKHIR TOMBOL BARU --- */}

                      <div className="dropdown d-inline-block">
                        <button className="btn btn-sm btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Ubah Status
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li><button className="dropdown-item" onClick={() => handleStatusChange(store.id, 'active')}>Setujui (Aktif)</button></li>
                          <li><button className="dropdown-item" onClick={() => handleStatusChange(store.id, 'inactive')}>Nonaktifkan</button></li>
                          <li><button className="dropdown-item" onClick={() => handleStatusChange(store.id, 'rejected')}>Tolak</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <p className="text-muted mb-0">Tidak ada toko yang cocok dengan kriteria.</p>
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

export default AdminStoresPage;