import React, { useState, useEffect, useCallback } from "react";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getApprovalRequests, // Diarahkan ke /api/superuser/approval-requests
  resolveApprovalRequest, // Diarahkan ke /api/superuser/approval-requests/:id/resolve
  reseedDatabase,
  uploadImage,
} from "../services/apiService";

const googleFonts = [
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Nunito Sans",
  "Inter",
];

const ThemePreview = ({ config }) => {
  const previewStyle = {
    fontFamily: config.typography?.fontFamily || "sans-serif",
    "--preview-primary-color": config.colors?.primary || "#0d6efd",
    "--preview-font-size-base": config.typography?.baseFontSize || "16px",
    "--preview-font-size-button": config.typography?.buttonFontSize || "1rem",
  };

  return (
    <div style={previewStyle}>
      <h6 className="text-muted small text-uppercase">Live Preview</h6>
      <div className="card">
        <div className="card-body">
          <h5
            className="card-title"
            style={{ color: "var(--preview-primary-color)" }}
          >
            Contoh Judul
          </h5>
          <p
            className="card-text"
            style={{ fontSize: "var(--preview-font-size-base)" }}
          >
            Ini adalah contoh teks paragraf yang akan berubah sesuai dengan
            pengaturan font yang Anda pilih.
          </p>
          <button
            className="btn text-white"
            style={{
              backgroundColor: "var(--preview-primary-color)",
              fontSize: "var(--preview-font-size-button)",
            }}
          >
            Tombol Aksi
          </button>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboardPage = ({ showMessage }) => {
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [uploadingStatus, setUploadingStatus] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configData, requestsData] = await Promise.all([
        getSuperUserConfig(),
        getApprovalRequests(), // Sekarang memanggil API yang benar
      ]);
      setConfig(configData);
      setInitialConfig(JSON.stringify(configData));
      setApprovalRequests(requestsData); // Mengisi state dengan data approval
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

  // ... (sisa fungsi handler tidak perlu diubah: handleConfigChange, handleSliderChange, handleImageUpload, dll.)
  const handleConfigChange = (e, path) => {
    const { name, value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newConfig;
    });
  };

  const handleSliderChange = (e, path) => {
    const { value } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = `${value}px`;
      return newConfig;
    });
  };

  const handleImageUpload = async (e, path) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStatus((prev) => ({ ...prev, [path]: true }));
    const formData = new FormData();
    formData.append("image", file);

    try {
      // 1. Unggah gambar seperti biasa
      const result = await uploadImage(formData);
      
      // 2. Buat salinan konfigurasi baru berdasarkan state saat ini
      const updatedConfig = JSON.parse(JSON.stringify(config));
      const keys = path.split(".");
      let current = updatedConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = result.imageUrl;

      // 3. LANGSUNG SIMPAN konfigurasi yang sudah diperbarui ke database
      await updateSuperUserConfig(updatedConfig);

      // 4. Perbarui state lokal dan state awal agar UI sinkron
      setConfig(updatedConfig);
      setInitialConfig(JSON.stringify(updatedConfig));

      if (showMessage) showMessage("Gambar berhasil diunggah dan disimpan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setUploadingStatus((prev) => ({ ...prev, [path]: false }));
    }
};

  const handleConfigSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = await updateSuperUserConfig(config);
      setConfig(updatedConfig);
      setInitialConfig(JSON.stringify(updatedConfig));
      if (showMessage)
        showMessage("Konfigurasi berhasil disimpan dan disiarkan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReseed = async () => {
    if (
      window.confirm(
        "PERINGATAN: Aksi ini akan menghapus semua data transaksi dan mengembalikannya ke kondisi awal (seed). Apakah Anda benar-benar yakin?"
      )
    ) {
      setIsSeeding(true);
      try {
        const result = await reseedDatabase();
        if (showMessage)
          showMessage(
            result.message || "Database berhasil di-seed ulang.",
            "Success"
          );
      } catch (err) {
        if (showMessage) showMessage(err.message, "Error");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleResolveRequest = async (requestId, resolution) => {
    const action = resolution === "APPROVED" ? "menyetujui" : "menolak";
    if (!window.confirm(`Anda yakin ingin ${action} permintaan ini?`)) return;
    try {
      await resolveApprovalRequest(requestId, resolution);
      setApprovalRequests((prev) => prev.filter((req) => req.id !== requestId));
      if (showMessage)
        showMessage(`Permintaan berhasil di-${resolution.toLowerCase()}.`);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const hasChanges = JSON.stringify(config) !== initialConfig;

  if (loading || !config)
    return <div className="p-4">Memuat dashboard developer...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Developer Dashboard</h2>
        <button
          className="btn btn-dark"
          onClick={handleConfigSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Menyimpan..." : "Simpan & Siarkan Konfigurasi"}
        </button>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "theme" ? "active" : ""}`}
            onClick={() => setActiveTab("theme")}
          >
            Konfigurasi Tema
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "approvals" ? "active" : ""}`}
            onClick={() => setActiveTab("approvals")}
          >
            Persetujuan{" "}
            <span className="badge bg-danger ms-1">
              {approvalRequests.length}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "maintenance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("maintenance")}
          >
            Maintenance
          </button>
        </li>
      </ul>

      {activeTab === "theme" && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card card-account p-4">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-4 fw-bold">Branding & Tampilan</h5>
                  {[
                    "logoUrl",
                    "faviconUrl",
                    "loginImageUrl",
                    "registerImageUrl",
                  ].map((key) => (
                    <div className="mb-3" key={key}>
                      <label
                        htmlFor={key}
                        className="form-label text-capitalize"
                      >
                        {key.replace("Url", " URL").replace("Image", " Image ")}
                      </label>
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          id={key}
                          onChange={(e) =>
                            handleImageUpload(e, `branding.${key}`)
                          }
                          accept="image/*"
                        />
                        {uploadingStatus[`branding.${key}`] && (
                          <span className="input-group-text">
                            <div className="spinner-border spinner-border-sm"></div>
                          </span>
                        )}
                      </div>
                      {config.branding[key] && (
                        <img
                          src={config.branding[key]}
                          alt={`${key} preview`}
                          className="img-thumbnail mt-2"
                          style={{ maxHeight: "50px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <h5 className="mb-4 fw-bold">Warna & Font</h5>
                  <div className="mb-3">
                    <label htmlFor="primaryColor" className="form-label">
                      Warna Primer
                    </label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="primaryColor"
                      value={config.colors.primary}
                      onChange={(e) => handleConfigChange(e, "colors.primary")}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="secondaryColor" className="form-label">
                      Warna Sekunder
                    </label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="secondaryColor"
                      value={config.colors.secondary}
                      onChange={(e) =>
                        handleConfigChange(e, "colors.secondary")
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="fontFamily" className="form-label">
                      Jenis Font
                    </label>
                    <select
                      className="form-select"
                      id="fontFamily"
                      value={config.typography.fontFamily
                        .split(",")[0]
                        .replace(/'/g, "")}
                      onChange={(e) =>
                        handleConfigChange(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              value: `'${e.target.value}', sans-serif`,
                            },
                          },
                          "typography.fontFamily"
                        )
                      }
                    >
                      {googleFonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="baseFontSize" className="form-label">
                      Ukuran Font Dasar:{" "}
                      <strong>{config.typography.baseFontSize}</strong>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      id="baseFontSize"
                      min="12"
                      max="20"
                      value={parseInt(config.typography.baseFontSize)}
                      onChange={(e) =>
                        handleSliderChange(e, "typography.baseFontSize")
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="buttonFontSize" className="form-label">
                      Ukuran Font Tombol:{" "}
                      <strong>{config.typography.buttonFontSize}</strong>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      id="buttonFontSize"
                      min="12"
                      max="24"
                      value={parseInt(config.typography.buttonFontSize)}
                      onChange={(e) =>
                        handleSliderChange(e, "typography.buttonFontSize")
                      }
                    />
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <h5 className="mb-3 fw-bold">Fitur (Feature Flags)</h5>
              <div className="row">
                {Object.entries(config.featureFlags)
                  .filter(([key]) => key !== "pageStatus")
                  .map(([key, value]) => (
                    <div
                      className="col-md-6 mb-3 form-check form-switch"
                      key={key}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={key}
                        checked={!!value}
                        onChange={(e) =>
                          handleConfigChange(e, `featureFlags.${key}`)
                        }
                      />
                      <label
                        className="form-check-label text-capitalize"
                        htmlFor={key}
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div
              className="card card-account p-3 position-sticky"
              style={{ top: "20px" }}
            >
              <ThemePreview config={config} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "approvals" && (
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
                  {approvalRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{new Date(req.createdAt).toLocaleString("id-ID")}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {req.requestType}
                        </span>
                      </td>
                      <td>{JSON.stringify(req.details)}</td>
                      <td>{req.requestedBy?.name || "N/A"}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() =>
                            handleResolveRequest(req.id, "APPROVED")
                          }
                        >
                          Setujui
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleResolveRequest(req.id, "REJECTED")
                          }
                        >
                          Tolak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center p-4">
              Tidak ada permintaan yang menunggu persetujuan.
            </p>
          )}
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="card card-account p-4">
          <h5 className="mb-4 fw-bold text-danger">Zona Berbahaya</h5>
          <div className="alert alert-danger">
            <strong>Peringatan:</strong> Aksi di bawah ini akan menghapus semua
            data transaksi dan mengembalikannya ke kondisi awal. Lanjutkan
            dengan hati-hati.
          </div>
          <button
            className="btn btn-outline-danger"
            onClick={handleReseed}
            disabled={isSeeding}
          >
            {isSeeding ? "Memproses..." : "Reset & Seed Ulang Database"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboardPage;
