import React, { useState, useEffect, useCallback } from "react";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getApprovalRequests,
  resolveApprovalRequest,
  reseedDatabase,
} from "../services/apiService";

const DeveloperDashboardPage = ({ showMessage }) => {
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Panggil semua data yang dibutuhkan untuk dashboard developer secara paralel
      const [configData, requestsData] = await Promise.all([
        getSuperUserConfig(),
        getApprovalRequests(),
      ]);
      setConfig(configData);
      setInitialConfig(JSON.stringify(configData)); // Simpan sebagai string untuk perbandingan mudah
      setApprovalRequests(requestsData);
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

  // Handler untuk mengubah state config secara dinamis
  const handleConfigChange = (e, path) => {
    const { name, value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      // Deep copy untuk menghindari mutasi state secara langsung
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      // Terapkan nilai baru
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
    if (!window.confirm(`Anda yakin ingin ${resolution.toUpperCase()} permintaan ini?`)) return;
    try {
      await resolveApprovalRequest(requestId, resolution);
      setApprovalRequests(prev => prev.filter(req => req.id !== requestId));
      if (showMessage) showMessage(`Permintaan berhasil di-${resolution.toLowerCase()}.`);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };
  
  // Cek apakah ada perubahan pada config
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
            Persetujuan <span className="badge bg-danger ms-1">{approvalRequests.length}</span>
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
         <h5 className="mb-3">Permintaan Persetujuan</h5>
         {approvalRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Tanggal</th>
                    <th>Tipe</th>
                    <th>Detail</th>
                    <th>Pemohon</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalRequests.map(req => (
                    <tr key={req.id}>
                      <td>{new Date(req.createdAt).toLocaleString('id-ID')}</td>
                      <td><span className="badge bg-info text-dark">{req.type}</span></td>
                      <td>{req.details}</td>
                      <td>{req.requestedBy.name}</td>
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
           <p className="text-muted text-center p-4">Tidak ada permintaan yang menunggu persetujuan.</p>
         )}
       </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="card card-account p-4">
          <h5 className="mb-4 fw-bold text-danger">Zona Berbahaya</h5>
          <div className="alert alert-danger">
            <strong>Peringatan:</strong> Aksi di bawah ini dapat menyebabkan perubahan signifikan pada data aplikasi. Lanjutkan dengan hati-hati.
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