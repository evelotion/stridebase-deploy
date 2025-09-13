import React, { useState, useEffect, useCallback } from "react";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getPayoutRequests,
  resolvePayoutRequest, // Diubah namanya agar konsisten, pastikan di apiService.js juga diubah
  reseedDatabase,
} from "../services/apiService";

const DeveloperDashboardPage = ({ showMessage }) => {
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configData, requestsData] = await Promise.all([
        getSuperUserConfig(),
        getPayoutRequests(),
      ]);
      setConfig(configData);
      setInitialConfig(JSON.stringify(configData));
      setPayoutRequests(requestsData);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfigChange = (e, path) => {
    const { value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
      return newConfig;
    });
  };

  const handleConfigSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = await updateSuperUserConfig(config);
      setConfig(updatedConfig);
      setInitialConfig(JSON.stringify(updatedConfig));
      if (showMessage) showMessage("Konfigurasi berhasil disimpan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReseed = async () => {
    if (window.confirm("PERINGATAN: Aksi ini akan menghapus semua data dan mengembalikannya ke data awal (seed). Apakah Anda benar-benar yakin?")) {
      setIsSeeding(true);
      try {
        const result = await reseedDatabase();
        if (showMessage) showMessage(result.message || "Database berhasil di-seed ulang.", "Success");
      } catch (err) {
        if (showMessage) showMessage(err.message, "Error");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleResolveRequest = async (requestId, resolution) => {
    const action = resolution === 'APPROVED' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Anda yakin ingin ${action} permintaan ini?`)) return;
    try {
      // Pastikan nama fungsi di apiService adalah resolvePayoutRequest atau yang sesuai
      await resolvePayoutRequest(requestId, resolution);
      setPayoutRequests(prev => prev.filter(req => req.id !== requestId));
      if (showMessage) showMessage(`Permintaan berhasil di-${resolution.toLowerCase()}.`);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const hasChanges = JSON.stringify(config) !== initialConfig;

  if (loading) return <div className="p-4">Memuat dashboard developer...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Developer Dashboard</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>Konfigurasi Tema</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
            Persetujuan Payout <span className="badge bg-danger ms-1">{payoutRequests.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>Maintenance</button>
        </li>
      </ul>

      {activeTab === 'theme' && config && (
        <div className="card card-account p-4">
          <h5 className="mb-4 fw-bold">Pengaturan Tema & Fitur Global</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="primaryColor" className="form-label">Warna Primer</label>
              <input type="color" className="form-control form-control-color" id="primaryColor" name="primary" value={config.colors.primary} onChange={(e) => handleConfigChange(e, "colors.primary")} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="secondaryColor" className="form-label">Warna Sekunder</label>
              <input type="color" className="form-control form-control-color" id="secondaryColor" name="secondary" value={config.colors.secondary} onChange={(e) => handleConfigChange(e, "colors.secondary")} />
            </div>
          </div>
          <div className="mb-3 form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="maintenanceMode" name="maintenanceMode" checked={config.featureFlags.maintenanceMode} onChange={(e) => handleConfigChange(e, "featureFlags.maintenanceMode")} />
            <label className="form-check-label" htmlFor="maintenanceMode">Mode Maintenance</label>
          </div>
          <div className="text-end">
            <button className="btn btn-dark" onClick={handleConfigSave} disabled={isSaving || !hasChanges}>
              {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
         <div className="table-card p-3 shadow-sm">
           <h5 className="mb-3">Permintaan Penarikan Dana (Payout)</h5>
           {payoutRequests.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>Toko</th>
                      <th>Jumlah</th>
                      <th>Pemohon</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map(req => (
                      <tr key={req.id}>
                        <td>{new Date(req.createdAt).toLocaleString('id-ID')}</td>
                        <td>{req.store?.name || 'Nama Toko Tidak Tersedia'}</td>
                        <td>Rp {req.amount.toLocaleString('id-ID')}</td>
                        <td>{req.requestedBy?.name || 'Nama Pemohon Tidak Tersedia'}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-success me-2" onClick={() => handleResolveRequest(req.id, 'APPROVED')}>Setujui</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleResolveRequest(req.id, 'REJECTED')}>Tolak</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           ) : (
             <p className="text-muted text-center p-4">Tidak ada permintaan penarikan dana yang menunggu.</p>
           )}
         </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="card card-account p-4">
          <h5 className="mb-4 fw-bold text-danger">Zona Berbahaya</h5>
          <div className="alert alert-danger">
            <strong>Peringatan:</strong> Aksi di bawah ini akan menghapus semua data transaksi dan mengembalikannya ke kondisi awal (seed). Lanjutkan dengan sangat hati-hati.
          </div>
          <button className="btn btn-outline-danger" onClick={handleReseed} disabled={isSeeding}>
            {isSeeding ? "Memproses..." : "Reset & Seed Ulang Database"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboardPage;