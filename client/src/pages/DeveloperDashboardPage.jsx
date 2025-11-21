// File: client/src/pages/DeveloperDashboardPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getApprovalRequests,
  resolveApprovalRequest,
  reseedDatabase,
  uploadImage,
  getSecurityLogs,
  uploadDeveloperAsset,
} from "../services/apiService";
import API_BASE_URL from "../apiConfig";

// --- HELPER: SAFE RENDER (Penyelamat Error #31) ---
const safeRender = (data, fallback = "-") => {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") {
    return JSON.stringify(data);
  }
  return data;
};

const googleFonts = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Work Sans",
  "Merriweather",
  "Alegreya",
  "Oswald",
  "Barlow",
  "Rokkitt",
  "Carme",
  "Encode Sans Semi Condensed",
  "Spectral",
  "Bitter",
  "Aleo",
  "Gelasio",
  "Asap Condensed",
  "Assistant",
  "Brawler",
  "Caladea",
  "Rubik",
  "Inter",
  "Literata",
  "DM Sans",
  "Source Sans Pro",
  "Nunito Sans",
  "Playfair Display",
  "Lora",
  "Roboto Mono",
  "Source Code Pro",
  "Fira Sans",
  "Cabin",
  "Karla",
  "Mulish",
  "Overpass",
  "Raleway",
  "Noto Sans",
  "Noto Serif",
  "Inconsolata",
  "PT Sans",
  "PT Serif",
  "Quicksand",
  "Exo 2",
  "Heebo",
  "Ubuntu",
  "Domine",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "IBM Plex Mono",
  "Hind",
  "Hind Siliguri",
  "Hind Madurai",
  "Hind Guntur",
  "Hind Vadodara",
  "Yanone Kaffeesatz",
  "Zilla Slab",
  "Arimo",
  "Teko",
  "Signika",
  "Signika Negative",
  "Manrope",
  "Chivo",
  "Overlock",
  "Oxygen",
  "Varela Round",
  "Kanit",
  "Prompt",
  "Fjalla One",
  "Muli",
  "Josefin Sans",
  "Cormorant Garamond",
  "Cormorant",
  "Crimson Text",
  "EB Garamond",
  "Nanum Gothic",
  "Nanum Myeongjo",
  "Nanum Pen Script",
  "Dancing Script",
  "Pacifico",
  "Great Vibes",
  "Shadows Into Light",
  "Amatic SC",
  "Caveat",
  "Sacramento",
  "Yellowtail",
  "Abril Fatface",
  "Bebas Neue",
  "Anton",
  "Patua One",
  "Fredoka One",
  "Baloo 2",
  "Chewy",
  "Permanent Marker",
  "Gloria Hallelujah",
  "Indie Flower",
  "Architects Daughter",
  "Courgette",
  "Kaushan Script",
  "Satisfy",
  "Cookie",
  "Outfit",
];

const LogDetails = ({ details }) => {
  if (!details) return <small>-</small>;

  // Parsing aman jika details berupa string JSON
  let parsedDetails = details;
  try {
    if (
      typeof details === "string" &&
      (details.startsWith("{") || details.startsWith("["))
    ) {
      parsedDetails = JSON.parse(details);
    }
  } catch (e) {
    // Biarkan sebagai string jika gagal parse
  }

  // Jika tipe data primitif (string/number), tampilkan langsung
  if (typeof parsedDetails !== "object" || parsedDetails === null) {
    return (
      <small style={{ whiteSpace: "pre-wrap" }}>{String(parsedDetails)}</small>
    );
  }

  // Tampilan Khusus: User Deletion Request
  if (parsedDetails.userId && parsedDetails.userName) {
    return (
      <div
        style={{
          fontSize: "0.8rem",
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        <p className="mb-1 fst-italic">"{parsedDetails.message}"</p>
        <div className="mt-2">
          <strong className="d-block">Target Pengguna:</strong>
          <ul className="list-unstyled ps-2 mb-0 border-start border-2 ps-2">
            <li>
              <strong>Nama:</strong> {parsedDetails.userName}
            </li>
            <li>
              <strong>Email:</strong> {parsedDetails.userEmail}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Helper untuk format key camelCase menjadi Title Case
  const formatKey = (key) => {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const renderValue = (value) => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="badge bg-success">Yes</span>
      ) : (
        <span className="badge bg-secondary">No</span>
      );
    }
    if (value === null || value === undefined)
      return <em className="text-muted">Not Set</em>;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderChange = (field, change) => (
    <li key={field}>
      <strong>{formatKey(field)}:</strong>
      <div className="ps-2">
        <span className="text-muted">From:</span> {renderValue(change.from)}
        <br />
        <span className="text-success">To:</span> {renderValue(change.to)}
      </div>
    </li>
  );

  // Tampilan Generic untuk Perubahan Data
  return (
    <div
      style={{
        fontSize: "0.8rem",
        whiteSpace: "normal",
        wordBreak: "break-word",
      }}
    >
      {parsedDetails.message && (
        <p className="mb-1 fst-italic">"{parsedDetails.message}"</p>
      )}
      {parsedDetails.from && parsedDetails.to && (
        <div className="mt-2">
          <strong className="d-block text-decoration-underline">
            Perubahan:
          </strong>
          <ul className="list-unstyled ps-2 mb-0">
            {Object.entries(parsedDetails.to).map(([field, toValue]) =>
              renderChange(field, {
                from: parsedDetails.from[field],
                to: toValue,
              })
            )}
          </ul>
        </div>
      )}
      {/* Fallback jika struktur objek tidak dikenali */}
      {!parsedDetails.from && !parsedDetails.userId && (
        <pre
          className="mb-0 bg-light p-1 rounded text-muted"
          style={{ maxWidth: "200px", overflowX: "auto", fontSize: "0.7rem" }}
        >
          {JSON.stringify(parsedDetails, null, 2)}
        </pre>
      )}
    </div>
  );
};

const ThemePreview = ({ config }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Safety Check: Jika config belum ada, jangan render
  if (!config) return null;

  const previewStyle = {
    fontFamily: config.typography?.fontFamily || "sans-serif",
    "--preview-primary-color": config.colors?.primary || "#0d6efd",
    "--preview-font-size-base": config.typography?.baseFontSize || "16px",
  };
  const buttonStyle = {
    backgroundColor: config.colors?.button?.background || "#212529",
    color: config.colors?.button?.text || "#ffffff",
    borderColor: config.colors?.button?.background || "#212529",
    fontSize: config.typography?.buttonFontSize || "1rem",
    transition: "all 0.2s ease",
  };
  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: config.colors?.button?.backgroundHover || "#0dcaf0",
    color: config.colors?.button?.textHover || "#ffffff",
    borderColor: config.colors?.button?.backgroundHover || "#0dcaf0",
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
            className="btn"
            style={isHovered ? buttonHoverStyle : buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Tombol Aksi Dinamis
          </button>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboardPage = ({ showMessage }) => {
  const [currentTheme, setCurrentTheme] = useState("classic");
  const [loadingTheme, setLoadingTheme] = useState(true);
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [uploadingStatus, setUploadingStatus] = useState({});
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingTheme(true);

    // 1. Cek Token Login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 2. Fetch Data dengan Error Handling
      const [configData, requestsData, logsData, themeRes] = await Promise.all([
        getSuperUserConfig(),
        getApprovalRequests(),
        getSecurityLogs(),
        fetch(`${API_BASE_URL}/api/public/theme-config`),
      ]);

      if (themeRes.ok) {
        const themeData = await themeRes.json();
        setCurrentTheme(themeData.homePageTheme || "classic");
      }

      setConfig(configData);
      setInitialConfig(JSON.stringify(configData));

      // 3. Pastikan data array (mencegah white screen)
      setApprovalRequests(Array.isArray(requestsData) ? requestsData : []);
      setSecurityLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");

      // 4. Handle Token Expired/Invalid (Redirect ke Login)
      if (
        err.message &&
        (err.message.includes("403") ||
          err.message.includes("401") ||
          err.message.includes("Forbidden"))
      ) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setLoadingTheme(false);
    }
  }, [showMessage, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleThemeChange = async (newTheme) => {
    setCurrentTheme(newTheme);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/settings/homepage-theme`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: newTheme }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      if (showMessage) showMessage("Tema homepage berhasil diubah!");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
      fetchData(); // Revert jika gagal
    }
  };

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
      const result = await uploadImage(formData);
      const updatedConfig = JSON.parse(JSON.stringify(config));
      const keys = path.split(".");
      let current = updatedConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = result.imageUrl;
      await updateSuperUserConfig(updatedConfig);
      setConfig(updatedConfig);
      setInitialConfig(JSON.stringify(updatedConfig));
      if (showMessage)
        showMessage("Gambar berhasil diunggah dan disimpan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setUploadingStatus((prev) => ({ ...prev, [path]: false }));
    }
  };

  const handleDeveloperUpload = async (e, path) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStatus((prev) => ({ ...prev, [path]: true }));
    const formData = new FormData();
    formData.append("asset", file);

    try {
      const result = await uploadDeveloperAsset(formData);
      const updatedConfig = JSON.parse(JSON.stringify(config));
      const keys = path.split(".");
      let current = updatedConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = result.imageUrl;

      await updateSuperUserConfig(updatedConfig);
      setConfig(updatedConfig);
      setInitialConfig(JSON.stringify(updatedConfig));

      if (showMessage)
        showMessage("Gambar berhasil diunggah dan disimpan!", "Success");
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
      if (showMessage)
        showMessage(`Permintaan berhasil di-${resolution.toLowerCase()}.`);
      fetchData();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const hasChanges =
    initialConfig && config ? JSON.stringify(config) !== initialConfig : false;

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Memuat Dashboard Developer...</span>
      </div>
    );

  if (error)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block shadow-sm">
          <h4 className="alert-heading">
            <i className="fas fa-exclamation-triangle me-2"></i>Terjadi
            Kesalahan
          </h4>
          <p>{error}</p>
          <button
            className="btn btn-outline-danger btn-sm mt-2"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync me-2"></i>Refresh Halaman
          </button>
        </div>
      </div>
    );

  if (!config)
    return (
      <div className="p-4 text-center text-muted">
        Konfigurasi tidak ditemukan. Silakan refresh.
      </div>
    );

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Developer Dashboard</h2>
        {activeTab === "theme" && (
          <button
            className="btn btn-dark"
            onClick={handleConfigSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Menyimpan..." : "Simpan & Siarkan Konfigurasi"}
          </button>
        )}
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
            Log Aktivitas{" "}
            <span className="badge bg-danger ms-1">
              {
                (approvalRequests || []).filter(
                  (req) => req.status === "PENDING"
                ).length
              }
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Log Keamanan
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
            {/* Kartu Pilihan Tema */}
            <div className="card card-account p-4 mb-4">
              <h5 className="mb-3 fw-bold">Tema Homepage</h5>
              {loadingTheme ? (
                <p>Memuat pilihan tema...</p>
              ) : (
                <div className="d-flex gap-3">
                  {["classic", "modern", "elevate"].map((themeName) => (
                    <div className="form-check" key={themeName}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="themeRadio"
                        id={`theme${themeName}`}
                        value={themeName}
                        checked={currentTheme === themeName}
                        onChange={() => handleThemeChange(themeName)}
                      />
                      <label
                        className="form-check-label text-capitalize"
                        htmlFor={`theme${themeName}`}
                      >
                        {themeName}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                      {config.branding && config.branding[key] && (
                        <img
                          src={config.branding[key]}
                          alt={`${key} preview`}
                          className="img-thumbnail mt-2"
                          style={{ maxHeight: "50px" }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Hero Section Inputs */}
                  <div className="mb-3">
                    <label
                      htmlFor="modernHeroSideBannerUrl"
                      className="form-label"
                    >
                      Modern Hero Side Banner
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="modernHeroSideBannerUrl"
                        onChange={(e) =>
                          handleDeveloperUpload(
                            e,
                            "branding.modernHeroSideBannerUrl"
                          )
                        }
                        accept="image/*"
                      />
                      {uploadingStatus["branding.modernHeroSideBannerUrl"] && (
                        <span className="input-group-text">
                          <div className="spinner-border spinner-border-sm"></div>
                        </span>
                      )}
                    </div>
                    {config.branding?.modernHeroSideBannerUrl && (
                      <img
                        src={config.branding.modernHeroSideBannerUrl}
                        alt="Preview"
                        className="img-thumbnail mt-2"
                        style={{ maxHeight: "50px" }}
                      />
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="modernHeroSectionBgUrl"
                      className="form-label"
                    >
                      Modern Hero Background (Atas)
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="modernHeroSectionBgUrl"
                        onChange={(e) =>
                          handleDeveloperUpload(
                            e,
                            "branding.modernHeroSectionBgUrl"
                          )
                        }
                        accept="image/*"
                      />
                      {uploadingStatus["branding.modernHeroSectionBgUrl"] && (
                        <span className="input-group-text">
                          <div className="spinner-border spinner-border-sm"></div>
                        </span>
                      )}
                    </div>
                    {config.branding?.modernHeroSectionBgUrl && (
                      <img
                        src={config.branding.modernHeroSectionBgUrl}
                        alt="Preview"
                        className="img-thumbnail mt-2"
                        style={{ maxHeight: "50px" }}
                      />
                    )}
                  </div>

                  <hr />
                  <div className="mb-3">
                    <label htmlFor="heroSecondaryImage" className="form-label">
                      Gambar Hero Sekunder (BARU)
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="heroSecondaryImage"
                        onChange={(e) =>
                          handleDeveloperUpload(
                            e,
                            "branding.heroSecondaryImage"
                          )
                        }
                        accept="image/*"
                      />
                      {uploadingStatus["branding.heroSecondaryImage"] && (
                        <span className="input-group-text">
                          <div className="spinner-border spinner-border-sm"></div>
                        </span>
                      )}
                    </div>
                    <div className="form-text">
                      Gambar ini untuk section baru di tema Modern.
                    </div>
                    {config.branding?.heroSecondaryImage && (
                      <img
                        src={config.branding.heroSecondaryImage}
                        alt="Hero Sekunder Preview"
                        className="img-thumbnail mt-2"
                        style={{ maxHeight: "50px" }}
                      />
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="heroSecondaryBgImage"
                      className="form-label"
                    >
                      Background Hero Sekunder (BARU)
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="heroSecondaryBgImage"
                        onChange={(e) =>
                          handleDeveloperUpload(
                            e,
                            "branding.heroSecondaryBgImage"
                          )
                        }
                        accept="image/*"
                      />
                      {uploadingStatus["branding.heroSecondaryBgImage"] && (
                        <span className="input-group-text">
                          <div className="spinner-border spinner-border-sm"></div>
                        </span>
                      )}
                    </div>
                    <div className="form-text">
                      Background untuk section gambar hero sekunder.
                    </div>
                    {config.branding?.heroSecondaryBgImage && (
                      <img
                        src={config.branding.heroSecondaryBgImage}
                        alt="Hero Background Preview"
                        className="img-thumbnail mt-2"
                        style={{ maxHeight: "50px" }}
                      />
                    )}
                  </div>

                  {/* Input Text Link */}
                  <div className="mb-3">
                    <label
                      htmlFor="modernHeroSideBannerLink"
                      className="form-label"
                    >
                      Modern Hero Side Banner Link
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="modernHeroSideBannerLink"
                      value={config.branding?.modernHeroSideBannerLink || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          e,
                          "branding.modernHeroSideBannerLink"
                        )
                      }
                      placeholder="/store"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <h5 className="mb-4 fw-bold">Warna & Font</h5>
                  {/* Color Inputs */}
                  {[
                    { label: "Warna Primer", path: "colors.primary" },
                    { label: "Warna Sekunder", path: "colors.secondary" },
                    { label: "Latar Tombol", path: "colors.button.background" },
                    { label: "Teks Tombol", path: "colors.button.text" },
                    {
                      label: "Latar Tombol (Hover)",
                      path: "colors.button.backgroundHover",
                    },
                    {
                      label: "Teks Tombol (Hover)",
                      path: "colors.button.textHover",
                    },
                  ].map((item, idx) => {
                    const keys = item.path.split(".");
                    let val = config;
                    keys.forEach((k) => {
                      val = val ? val[k] : null;
                    });
                    return (
                      <div className="mb-3" key={idx}>
                        <label className="form-label">{item.label}</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={val || "#000000"}
                          onChange={(e) => handleConfigChange(e, item.path)}
                        />
                      </div>
                    );
                  })}

                  <div className="mb-3">
                    <label htmlFor="fontFamily" className="form-label">
                      Jenis Font
                    </label>
                    <select
                      className="form-select"
                      id="fontFamily"
                      value={
                        config.typography?.fontFamily
                          ?.split(",")[0]
                          .replace(/'/g, "") || ""
                      }
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

                  {/* Font Size Sliders */}
                  {[
                    {
                      id: "baseFontSize",
                      label: "Ukuran Font Dasar",
                      path: "typography.baseFontSize",
                      min: 12,
                      max: 20,
                    },
                    {
                      id: "buttonFontSize",
                      label: "Ukuran Font Tombol",
                      path: "typography.buttonFontSize",
                      min: 12,
                      max: 24,
                    },
                    {
                      id: "h1FontSize",
                      label: "Ukuran Font Judul (H1)",
                      path: "typography.h1FontSize",
                      min: 24,
                      max: 48,
                    },
                    {
                      id: "displayFontSize",
                      label: "Ukuran Font Display",
                      path: "typography.displayFontSize",
                      min: 40,
                      max: 72,
                    },
                    {
                      id: "buttonLgFontSize",
                      label: "Ukuran Font Tombol (Besar)",
                      path: "typography.buttonLgFontSize",
                      min: 14,
                      max: 28,
                    },
                  ].map((slider) => {
                    const keys = slider.path.split(".");
                    let val = config;
                    keys.forEach((k) => {
                      val = val ? val[k] : null;
                    });
                    return (
                      <div className="mb-3" key={slider.id}>
                        <label className="form-label">
                          {slider.label}: <strong>{val}</strong>
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min={slider.min}
                          max={slider.max}
                          value={parseInt(val || slider.min)}
                          onChange={(e) => handleSliderChange(e, slider.path)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <hr className="my-4" />
              <h5 className="mb-3 fw-bold">Fitur (Feature Flags)</h5>
              <div className="row">
                {config.featureFlags &&
                  Object.entries(config.featureFlags)
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
          <h5 className="mb-3 d-none d-lg-block">
            Log Aktivitas & Persetujuan
          </h5>
          {(approvalRequests || []).length > 0 ? (
            <>
              <div className="table-responsive d-none d-lg-block">
                <table className="table table-hover align-top">
                  <thead className="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>Tipe</th>
                      <th style={{ minWidth: "300px" }}>Detail</th>
                      <th>Pemohon</th>
                      <th className="text-nowrap">Direview Oleh</th>
                      <th>Status</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          {new Date(req.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {req.requestType}
                          </span>
                        </td>
                        <td>
                          <LogDetails details={req.details} />
                        </td>
                        <td>{req.requestedBy?.name || "N/A"}</td>
                        <td>{req.reviewedBy?.name || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              req.status === "PENDING"
                                ? "bg-warning text-dark"
                                : req.status === "APPROVED"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {req.status === "PENDING" && (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  handleResolveRequest(req.id, "APPROVED")
                                }
                                title="Setujui"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleResolveRequest(req.id, "REJECTED")
                                }
                                title="Tolak"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-card-list d-lg-none">
                {approvalRequests.map((req) => (
                  <div className="mobile-card" key={req.id}>
                    <div className="mobile-card-header">
                      <span className="fw-bold">{req.requestType}</span>
                      <span
                        className={`badge ${
                          req.status === "PENDING"
                            ? "bg-warning text-dark"
                            : req.status === "APPROVED"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="mobile-card-body">
                      <div className="mobile-card-row">
                        <small>Tanggal</small>
                        <span>
                          {new Date(req.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="mobile-card-row">
                        <small>Pemohon</small>
                        <span>{req.requestedBy?.name || "N/A"}</span>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted d-block">Detail:</small>
                        <LogDetails details={req.details} />
                      </div>
                    </div>
                    {req.status === "PENDING" && (
                      <div className="mobile-card-footer d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-success"
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-center p-4">
              Tidak ada aktivitas atau permintaan yang menunggu persetujuan.
            </p>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="table-card p-3 shadow-sm">
          <h5 className="mb-3">Log Keamanan Terbaru</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aksi</th>
                  <th>Alamat IP</th>
                  <th style={{ minWidth: "300px" }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {(securityLogs || []).length > 0 ? (
                  securityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </td>
                      <td>
                        {log.user ? (
                          <>
                            {log.user.name}
                            <small className="d-block text-muted">
                              {log.user.email}
                            </small>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            log.action === "LOGIN_FAILURE"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>{log.ipAddress || "-"}</td>
                      <td>
                        <small>{safeRender(log.details)}</small>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-muted">
                      Belum ada log keamanan yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="card card-account p-4">
          <h5 className="mb-4 fw-bold text-danger">Zona Berbahaya</h5>
          <div className="alert alert-danger">
            <strong>Peringatan:</strong> Aksi ini akan menghapus semua data
            transaksi dan mengembalikannya ke kondisi awal. Lanjutkan dengan
            hati-hati.
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
