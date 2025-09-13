import React, { useState, useEffect, useCallback } from "react";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getPayoutRequests,
  resolvePayoutRequest,
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
    const { name, value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        // Jika path tidak ada, buat objeknya
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
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
      if (showMessage) showMessage("Konfigurasi berhasil disimpan dan disiarkan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReseed = async () => {
    if (window.confirm("PERINGATAN: Aksi ini akan menghapus semua data transaksi dan mengembalikannya ke kondisi awal (seed). Apakah Anda benar-benar yakin?")) {
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
      await resolvePayoutRequest(requestId, resolution);
      setPayoutRequests(prev => prev.filter(req => req.id !== requestId));
      if (showMessage) showMessage(`Permintaan berhasil di-${resolution.toLowerCase()}.`);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const hasChanges = JSON.stringify(config) !== initialConfig;

  if (loading || !config) return <div className="p-4">Memuat dashboard developer...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Developer Dashboard</h2>
        <button className="btn btn-dark" onClick={handleConfigSave} disabled={isSaving || !hasChanges}>
            {isSaving ? "Menyimpan..." : "Simpan & Siarkan Konfigurasi"}
        </button>
      </div>

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

      {activeTab === 'theme' && (
        <div className="card card-account p-4">
          <div className="row">
            {/* Kolom Kiri: Branding & Colors */}
            <div className="col-lg-6">
              <h5 className="mb-4 fw-bold">Branding & Tampilan</h5>
              <div className="mb-3">
                <label htmlFor="logoUrl" className="form-label">URL Logo</label>
                <input type="text" className="form-control" id="logoUrl" value={config.branding.logoUrl} onChange={(e) => handleConfigChange(e, "branding.logoUrl")} />
              </div>
              <div className="mb-3">
                <label htmlFor="faviconUrl" className="form-label">URL Favicon</label>
                <input type="text" className="form-control" id="faviconUrl" value={config.branding.faviconUrl} onChange={(e) => handleConfigChange(e, "branding.faviconUrl")} />
              </div>
              <div className="mb-3">
                <label htmlFor="loginImageUrl" className="form-label">URL Gambar Halaman Login</label>
                <input type="text" className="form-control" id="loginImageUrl" value={config.branding.loginImageUrl} onChange={(e) => handleConfigChange(e, "branding.loginImageUrl")} />
              </div>
               <div className="mb-3">
                <label htmlFor="registerImageUrl" className="form-label">URL Gambar Halaman Register</label>
                <input type="text" className="form-control" id="registerImageUrl" value={config.branding.registerImageUrl} onChange={(e) => handleConfigChange(e, "branding.registerImageUrl")} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="primaryColor" className="form-label">Warna Primer</label>
                  <input type="color" className="form-control form-control-color" id="primaryColor" value={config.colors.primary} onChange={(e) => handleConfigChange(e, "colors.primary")} />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="secondaryColor" className="form-label">Warna Sekunder</label>
                  <input type="color" className="form-control form-control-color" id="secondaryColor" value={config.colors.secondary} onChange={(e) => handleConfigChange(e, "colors.secondary")} />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Typography & Feature Flags */}
            <div className="col-lg-6">
              <h5 className="mb-4 fw-bold">Tipografi</h5>
              <div className="mb-3">
                <label htmlFor="fontFamily" className="form-label">Jenis Font (dari Google Fonts)</label>
                <input type="text" className="form-control" id="fontFamily" value={config.typography.fontFamily} onChange={(e) => handleConfigChange(e, "typography.fontFamily")} placeholder="Contoh: 'Poppins', sans-serif" />
              </div>
              <div className="row">
                 <div className="col-md-6 mb-3">
                   <label htmlFor="baseFontSize" className="form-label">Ukuran Font Dasar</label>
                   <input type="text" className="form-control" id="baseFontSize" value={config.typography.baseFontSize} onChange={(e) => handleConfigChange(e, "typography.baseFontSize")} placeholder="Contoh: 16px" />
                 </div>
                 <div className="col-md-6 mb-3">
                   <label htmlFor="h1FontSize" className="form-label">Ukuran Font H1</label>
                   <input type="text" className="form-control" id="h1FontSize" value={config.typography.h1FontSize} onChange={(e) => handleConfigChange(e, "typography.h1FontSize")} placeholder="Contoh: 2.5rem" />
                 </div>
              </div>
              
              <hr className="my-4"/>
              
              <h5 className="mb-4 fw-bold">Fitur (Feature Flags)</h5>
                <div className="row">
                    <div className="col-md-6 mb-3 form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="maintenanceMode" checked={config.featureFlags.maintenanceMode} onChange={(e) => handleConfigChange(e, "featureFlags.maintenanceMode")} />
                        <label className="form-check-label" htmlFor="maintenanceMode">Mode Maintenance</label>
                    </div>
                    <div className="col-md-6 mb-3 form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="enableGlobalAnnouncement" checked={config.featureFlags.enableGlobalAnnouncement} onChange={(e) => handleConfigChange(e, "featureFlags.enableGlobalAnnouncement")} />
                        <label className="form-check-label" htmlFor="enableGlobalAnnouncement">Aktifkan Pengumuman Global</label>
                    </div>
                     <div className="col-md-6 mb-3 form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="enableProTierUpgrade" checked={config.featureFlags.enableProTierUpgrade} onChange={(e) => handleConfigChange(e, "featureFlags.enableProTierUpgrade")} />
                        <label className="form-check-label" htmlFor="enableProTierUpgrade">Aktifkan Upgrade PRO</label>
                    </div>
                </div>
            </div>
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
                        <td>{req.store?.name || 'N/A'}</td>
                        <td>Rp {req.amount.toLocaleString('id-ID')}</td>
                        <td>{req.requestedBy?.name || 'N/A'}</td>
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