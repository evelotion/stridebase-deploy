// File: client/src/pages/AdminSettingsPage.jsx (Versi Gabungan & Final)

import React, { useState, useEffect, useCallback } from "react";
import {
  getAdminSettings,
  updateAdminSettings,
  uploadImage,
  reseedDatabase,
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
            Ini adalah contoh teks paragraf yang akan berubah.
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

const AdminSettingsPage = ({ showMessage }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const configData = await getAdminSettings();
      setConfig(configData);
      setInitialConfig(JSON.stringify(configData));
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
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
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
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
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
      const result = await uploadImage(formData);
      const keys = path.split(".");
      setConfig((prev) => {
        const newConfig = JSON.parse(JSON.stringify(prev));
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = result.imageUrl;
        return newConfig;
      });
      if (showMessage) showMessage("Gambar berhasil diunggah!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setUploadingStatus((prev) => ({ ...prev, [path]: false }));
    }
  };

  const handleConfigSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = await updateAdminSettings(config);
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

  const hasChanges = JSON.stringify(config) !== initialConfig;

  if (loading || !config)
    return <div className="p-4">Memuat pengaturan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Pusat Kontrol & Pengaturan</h2>
        <button
          className="btn btn-dark"
          onClick={handleConfigSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Menyimpan..." : "Simpan & Siarkan Konfigurasi"}
        </button>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card card-account p-4">
            {/* Bagian Branding, Warna, Font, dan Fitur disalin dari DeveloperDashboard */}
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
                    <label htmlFor={key} className="form-label text-capitalize">
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
          {/* Hanya tampilkan "Zona Berbahaya" jika role adalah developer */}
          {user.role === "developer" && (
            <div className="card card-account p-4 mt-4">
              <h5 className="mb-4 fw-bold text-danger">
                Zona Berbahaya (Developer Only)
              </h5>
              <div className="alert alert-danger">
                <strong>Peringatan:</strong> Aksi ini akan menghapus semua data
                transaksi dan mengembalikannya ke kondisi awal.
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
        <div className="col-lg-4">
          <div
            className="card card-account p-3 position-sticky"
            style={{ top: "20px" }}
          >
            <ThemePreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
