// File: client/src/pages/DeveloperDashboardPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getApprovalRequests,
  resolveApprovalRequest,
  reseedDatabase,
  uploadDeveloperAsset,
  getSecurityLogs, // Pastikan ini diimport jika ada di apiService
} from "../services/apiService";

import API_BASE_URL from "../apiConfig";
import "../styles/ElevateDashboard.css";

// --- HELPER: SAFE RENDER ---
const safeRender = (data, fallback = "-") => {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") {
    return JSON.stringify(data);
  }
  return data;
};

// --- STYLE HELPER: GLASS INPUT ---
// Style ini memaksa input terlihat bagus di Dark Mode (Teks Putih, BG Transparan)
const glassInputStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid var(--pe-card-border)",
  color: "var(--pe-text-main)", // KUNCI: Paksa warna teks mengikuti tema
  borderRadius: "8px",
  padding: "10px 12px",
};

// --- HELPER: PAGINATION CONTROLS ---
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
      <span style={{ color: "var(--pe-text-muted)", fontSize: "0.85rem" }}>
        Page {currentPage} of {totalPages}
      </span>
      <div className="d-flex gap-2">
        <button
          className="pe-btn-action py-1 px-3"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-left me-1"></i> Prev
        </button>
        <button
          className="pe-btn-action py-1 px-3"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          style={{ fontSize: "0.8rem" }}
        >
          Next <i className="fas fa-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};

// --- KOMPONEN: DEBOUNCED SLIDER ---
const DebouncedRangeInput = ({ label, value, min, max, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(parseInt(value));
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== parseInt(value)) {
        onChange(localValue);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <label style={{ color: "var(--pe-text-muted)", fontSize: "0.85rem" }}>
          {label}
        </label>
        <span className="text-info small">{localValue}px</span>
      </div>
      <input
        type="range"
        className="form-range"
        min={min}
        max={max}
        value={localValue}
        onChange={(e) => setLocalValue(parseInt(e.target.value))}
      />
    </div>
  );
};

// --- HELPER: GOOGLE FONTS ---
const googleFonts = [
  "Outfit",
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Raleway",
  "Oswald",
  "Quicksand",
  "Work Sans",
  "Rubik",
  "Barlow",
  "Lora",
  "DM Sans",
  "Space Grotesk",
  "Syne",
  "Urbanist",
];

const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;
  const fontName = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  const linkId = "dynamic-theme-font-preview";

  let link = document.getElementById(linkId);
  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
    /\s+/g,
    "+"
  )}:wght@300;400;500;600;700;800&display=swap`;
  if (link.href !== fontUrl) {
    link.href = fontUrl;
  }
};

// --- COMPONENT: LOG DETAILS ---
const LogDetails = ({ details }) => {
  if (!details) return <small>-</small>;
  let parsedDetails = details;
  try {
    if (typeof details === "string") parsedDetails = JSON.parse(details);
  } catch (e) {}

  if (typeof parsedDetails !== "object" || parsedDetails === null) {
    return (
      <small
        className="text-wrap font-monospace"
        style={{ color: "var(--pe-text-muted)" }}
      >
        {String(parsedDetails)}
      </small>
    );
  }

  return (
    <div style={{ fontSize: "0.8rem", color: "var(--pe-text-muted)" }}>
      {parsedDetails.message && (
        <p className="mb-1 fst-italic">"{parsedDetails.message}"</p>
      )}
      {parsedDetails.from && parsedDetails.to && (
        <div className="mt-2">
          <strong className="d-block text-info small">Changes:</strong>
          <ul className="list-unstyled ps-2 mb-0 border-start border-secondary ps-2">
            {Object.entries(parsedDetails.to).map(([field, toValue]) => (
              <li key={field}>
                <span className="text-muted small">{field}:</span>{" "}
                <span className="text-danger">
                  {String(parsedDetails.from[field] || "-")}
                </span>{" "}
                &rarr; <span className="text-success">{String(toValue)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!parsedDetails.from && (
        <pre
          className="mb-0 p-2 rounded small"
          style={{
            maxHeight: "150px", // Sedikit dipertinggi agar lebih nyaman
            overflowY: "auto", // Scroll vertikal saja
            whiteSpace: "pre-wrap", // <--- TAMBAHKAN INI: Agar teks turun ke bawah
            wordBreak: "break-word", // <--- TAMBAHKAN INI: Agar kata panjang dipotong
            background: "rgba(0,0,0,0.3)",
            color: "var(--pe-text-main)",
            border: "1px solid var(--pe-card-border)",
          }}
        >
          {JSON.stringify(parsedDetails, null, 2)}
        </pre>
      )}
    </div>
  );
};

// --- COMPONENT: THEME PREVIEW ---
const ThemePreview = ({ config }) => {
  if (!config) return null;

  // Style untuk wrapper preview
  const wrapperStyle = {
    fontFamily: config.typography?.fontFamily || "'Inter', sans-serif",
    "--primary-color": config.colors?.primary || "#0dcaf0",
    "--secondary-color": config.colors?.secondary || "#28a745",
    "--accent-color": config.colors?.accent || "#FFC107",
    "--font-size-base": config.typography?.baseFontSize || "16px",
    "--button-bg": config.colors?.button?.background || "#0D6EFD",
    "--button-text": config.colors?.button?.text || "#FFFFFF",

    // Container luar tetap mengikuti tema dashboard admin
    background: "var(--pe-bg)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid var(--pe-card-border)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={wrapperStyle}>
      {/* Decorative Blob */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          background:
            "radial-gradient(circle, var(--primary-color) 0%, transparent 70%)",
          opacity: 0.3,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      ></div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <h6
          style={{ color: "var(--pe-text-muted)" }} // Fix label visibility
          className="small text-uppercase mb-3 letter-spacing-2"
        >
          Live Preview
        </h6>

        {/* Inner Card: Simulasi Tampilan User */}
        <div
          style={{
            background: "var(--pe-card-bg)", // Menggunakan bg card tema dashboard
            backdropFilter: "blur(20px)",
            border: "1px solid var(--pe-card-border)",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <h2
            style={{
              fontSize: config.typography?.h1FontSize || "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
              lineHeight: 1.2,
              color: "var(--pe-text-main)", // Pastikan terlihat
            }}
          >
            Elevate Your{" "}
            <span style={{ color: "var(--primary-color)" }}>Style</span>
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--pe-text-muted)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Ini adalah simulasi tampilan teks paragraf dengan font{" "}
            <strong>{config.typography?.fontFamily?.split(",")[0]}</strong>.
          </p>
          <div className="d-flex gap-2">
            <button
              style={{
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
                border: "none",
                padding: "10px 24px",
                borderRadius: "50px",
                fontSize: config.typography?.buttonFontSize || "1rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              Primary Action
            </button>
            <button
              style={{
                backgroundColor: "transparent",
                color: "var(--pe-text-main)",
                border: "1px solid var(--pe-card-border)",
                padding: "10px 24px",
                borderRadius: "50px",
                fontSize: config.typography?.buttonFontSize || "1rem",
                cursor: "pointer",
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const DeveloperDashboardPage = ({ showMessage }) => {
  const [config, setConfig] = useState(null);
  const [initialConfig, setInitialConfig] = useState(null);

  const [approvalRequests, setApprovalRequests] = useState([]);
  const [approvalsMeta, setApprovalsMeta] = useState({
    page: 1,
    totalPages: 1,
  });
  const [securityLogs, setSecurityLogs] = useState([]);
  const [logsMeta, setLogsMeta] = useState({ page: 1, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [uploadingStatus, setUploadingStatus] = useState({});

  const navigate = useNavigate();

  const fetchConfig = async () => {
    try {
      const configData = await getSuperUserConfig();
      if (!configData.homePageTheme || configData.homePageTheme !== "elevate") {
        configData.homePageTheme = "elevate";
      }
      setConfig(configData);
      setInitialConfig(JSON.stringify(configData));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovals = async (page = 1) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/superuser/approval-requests?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (res.ok) {
        if (Array.isArray(result)) {
          setApprovalRequests(result);
        } else {
          setApprovalRequests(result.data);
          setApprovalsMeta(result.meta);
        }
      }
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    }
  };

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem("token");
    try {
      // Pastikan endpoint ini benar, kadang namanya /logs saja
      const res = await fetch(
        `${API_BASE_URL}/api/superuser/security-logs?page=${page}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (res.ok) {
        if (Array.isArray(result)) {
          setSecurityLogs(result);
        } else {
          setSecurityLogs(result.data);
          setLogsMeta(result.meta);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await Promise.all([fetchConfig(), fetchApprovals(1), fetchLogs(1)]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (config?.typography?.fontFamily) {
      loadGoogleFont(config.typography.fontFamily);
    }
  }, [config?.typography?.fontFamily]);

  const handleConfigChange = (e, path) => {
    const { value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig =
        typeof structuredClone === "function"
          ? structuredClone(prevConfig)
          : JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newConfig;
    });
  };

  const handleSliderUpdate = (value, path) => {
    const keys = path.split(".");
    setConfig((prevConfig) => {
      const newConfig =
        typeof structuredClone === "function"
          ? structuredClone(prevConfig)
          : JSON.parse(JSON.stringify(prevConfig));
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = `${value}px`;
      return newConfig;
    });
  };

  const handleUnifiedUpload = async (e, path) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      if (showMessage) showMessage("Tipe file tidak didukung.", "Error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      if (showMessage)
        showMessage("Ukuran file terlalu besar (Maks. 2MB).", "Error");
      return;
    }

    setUploadingStatus((prev) => ({ ...prev, [path]: true }));
    const formData = new FormData();
    formData.append("asset", file);

    try {
      const result = await uploadDeveloperAsset(formData);
      setConfig((prevConfig) => {
        const updatedConfig =
          typeof structuredClone === "function"
            ? structuredClone(prevConfig)
            : JSON.parse(JSON.stringify(prevConfig));
        const keys = path.split(".");
        let current = updatedConfig;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = result.imageUrl;
        return updatedConfig;
      });
      if (showMessage)
        showMessage("Upload Sukses! Klik 'Simpan Konfigurasi'.", "Success");
    } catch (err) {
      if (showMessage)
        showMessage(err.message || "Gagal mengunggah aset.", "Error");
    } finally {
      setUploadingStatus((prev) => ({ ...prev, [path]: false }));
    }
  };

  const handleConfigSave = async () => {
    setIsSaving(true);
    try {
      const configToSave = { ...config, homePageTheme: "elevate" };
      await updateSuperUserConfig(configToSave);
      // Opsional: Hit endpoint spesifik jika ada
      const token = localStorage.getItem("token");
      try {
        await fetch(`${API_BASE_URL}/api/superuser/settings/homepage-theme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: "elevate" }),
        });
      } catch (e) {} // Ignore if route doesn't exist

      setConfig(configToSave);
      setInitialConfig(JSON.stringify(configToSave));
      if (showMessage) showMessage("Konfigurasi disimpan!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReseed = async () => {
    if (
      !window.confirm(
        "PERINGATAN: Semua data akan dihapus dan di-reset. Lanjutkan?"
      )
    )
      return;
    setIsSeeding(true);
    try {
      const result = await reseedDatabase();
      if (showMessage)
        showMessage(result.message || "Database di-seed ulang.", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResolveRequest = async (requestId, resolution) => {
    const action = resolution === "APPROVED" ? "menyetujui" : "menolak";
    if (!window.confirm(`Yakin ingin ${action} permintaan ini?`)) return;
    try {
      await resolveApprovalRequest(requestId, resolution);
      if (showMessage) showMessage(`Berhasil di-${resolution.toLowerCase()}.`);
      fetchApprovals(approvalsMeta.page);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const hasChanges =
    initialConfig && config ? JSON.stringify(config) !== initialConfig : false;

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!config)
    return <div className="p-4 text-center text-white">No Config Found</div>;

  /* =========================================
     MOBILE VIEW
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* HEADER */}
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="pe-title mb-0 fs-4 fw-bold text-uppercase tracking-widest text-danger">
            DevConsole
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleConfigSave}
              disabled={!hasChanges || isSaving}
            >
              <i className="fas fa-save"></i>
            </button>
          </div>
        </div>
        {/* TABS SCROLLABLE */}
        <div className="d-flex gap-2 mt-3 overflow-auto pb-1">
          {[
            { id: "theme", label: "Theme", icon: "fa-palette" },
            { id: "approvals", label: "Approvals", icon: "fa-list-alt" },
            { id: "security", label: "Logs", icon: "fa-shield-alt" },
            { id: "maintenance", label: "Danger", icon: "fa-skull-crossbones" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm rounded-pill px-3 border-0`}
              // Fix Style Tab Mobile agar kontras
              style={{
                backgroundColor:
                  activeTab === tab.id
                    ? "var(--pe-accent)"
                    : "rgba(255,255,255,0.05)",
                color: activeTab === tab.id ? "#fff" : "var(--pe-text-muted)",
                whiteSpace: "nowrap",
                fontWeight: activeTab === tab.id ? "600" : "400",
              }}
            >
              <i className={`fas ${tab.icon} me-1`}></i> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-3">
        {activeTab === "theme" && (
          <div className="pe-card p-3">
            <h6
              className="fw-bold mb-3"
              style={{ color: "var(--pe-text-main)" }}
            >
              Feature Flags
            </h6>
            {config.featureFlags &&
              Object.entries(config.featureFlags)
                .filter(([key]) => key !== "pageStatus")
                .map(([key, value]) => (
                  <div className="form-check form-switch mb-3" key={key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`m_${key}`}
                      checked={!!value}
                      onChange={(e) =>
                        handleConfigChange(e, `featureFlags.${key}`)
                      }
                      style={{
                        backgroundColor: value
                          ? "var(--pe-accent)"
                          : "rgba(255,255,255,0.2)",
                      }}
                    />
                    <label
                      className="form-check-label small"
                      style={{ color: "var(--pe-text-main)" }} // Fix Contrast
                      htmlFor={`m_${key}`}
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                  </div>
                ))}
            <div
              className="alert alert-info small mt-3"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid var(--pe-info)",
                color: "var(--pe-info)",
              }}
            >
              <i className="fas fa-desktop me-1"></i> Edit color palette &
              typography di desktop.
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="d-flex flex-column gap-3">
            {approvalRequests.length > 0 ? (
              approvalRequests.map((req) => (
                <div className="pe-card p-3" key={req.id}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-info">{req.requestType}</span>
                    <small style={{ color: "var(--pe-text-muted)" }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {req.requestedBy?.name}
                  </h6>
                  <small
                    className="d-block mb-3"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    {req.requestedBy?.email}
                  </small>

                  <div
                    className="p-2 rounded mb-3"
                    style={{ background: "rgba(0,0,0,0.2)" }}
                  >
                    <LogDetails details={req.details} />
                  </div>

                  {req.status === "PENDING" && (
                    <div className="d-grid gap-2 grid-cols-2 d-flex">
                      <button
                        className="btn btn-sm btn-success flex-grow-1"
                        onClick={() => handleResolveRequest(req.id, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                        onClick={() => handleResolveRequest(req.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted">No pending requests.</p>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="d-flex flex-column gap-2">
            {securityLogs.map((log) => (
              <div
                className="pe-card p-3 border-start border-3"
                key={log.id}
                style={{
                  borderColor: log.action.includes("FAILURE")
                    ? "var(--pe-danger)"
                    : "var(--pe-success)",
                }}
              >
                <div className="d-flex justify-content-between">
                  <small style={{ color: "var(--pe-text-muted)" }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </small>
                  <small
                    className="fw-bold"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {log.ipAddress}
                  </small>
                </div>
                <div
                  className="fw-bold my-1 text-truncate"
                  style={{ color: "var(--pe-text-main)" }}
                >
                  {log.action}
                </div>
                <small
                  className="d-block"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  {log.user?.email || "System"}
                </small>
              </div>
            ))}
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="pe-card border-danger p-4 text-center">
            <i className="fas fa-skull-crossbones fa-3x text-danger mb-3"></i>
            <h5 className="text-danger">Danger Zone</h5>
            <p className="small mb-4" style={{ color: "var(--pe-text-muted)" }}>
              Aksi ini akan menghapus semua data transaksi & user.
            </p>
            <button
              className="btn btn-danger w-100 py-3 rounded-3"
              onClick={handleReseed}
              disabled={isSeeding}
            >
              {isSeeding ? "Processing..." : "RESET DATABASE"}
            </button>
          </div>
        )}
      </div>
      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     DESKTOP VIEW
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
            <i className="fas fa-code-branch me-2"></i>Root Access
          </h6>
          <h2 className="pe-title display-6 mb-0">Developer Console</h2>
        </div>
        <div className="d-flex gap-3">
          <button
            className="pe-btn-action"
            onClick={() => navigate("/admin/dashboard")}
            style={{ borderColor: "var(--pe-info)", color: "var(--pe-info)" }}
          >
            <i className="fas fa-user-shield me-2"></i> Switch to Admin
          </button>
          <button
            className="pe-btn-action"
            onClick={handleConfigSave}
            disabled={isSaving || !hasChanges}
            style={{
              background: hasChanges ? "var(--pe-accent-dev)" : "transparent",
              borderColor: "var(--pe-accent-dev)",
              color: hasChanges ? "#fff" : "var(--pe-accent-dev)",
              opacity: isSaving || !hasChanges ? 0.7 : 1,
            }}
          >
            <i
              className={`fas ${
                isSaving ? "fa-spinner fa-spin" : "fa-save"
              } me-2`}
            ></i>
            {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {[
          { id: "theme", label: "Theme Engine", icon: "fa-palette" },
          { id: "approvals", label: "Approval Queue", icon: "fa-list-alt" },
          { id: "security", label: "Audit Logs", icon: "fa-shield-alt" },
          { id: "maintenance", label: "System Tools", icon: "fa-tools" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pe-btn-action ${activeTab === tab.id ? "active" : ""}`}
            style={
              activeTab === tab.id
                ? {
                    background: "var(--pe-accent-dev)",
                    borderColor: "var(--pe-accent-dev)",
                    color: "#fff",
                  }
                : { opacity: 0.8 }
            }
          >
            <i className={`fas ${tab.icon} me-2`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div>
        {/* --- TAB 1: THEME CONFIGURATION --- */}
        {activeTab === "theme" && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="pe-card mb-4">
                <h5 className="pe-title mb-4 border-bottom border-secondary pb-3">
                  <i className="fas fa-sliders-h me-2"></i>Global Theme Settings
                </h5>
                <div
                  className="p-4 rounded-3 mb-4 d-flex align-items-center justify-content-between"
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid var(--pe-accent)",
                  }}
                >
                  <div>
                    <label
                      className="pe-subtitle d-block fw-bold mb-1"
                      style={{ color: "var(--pe-text-main)" }}
                    >
                      Active Homepage Layout
                    </label>
                    <small style={{ color: "var(--pe-text-muted)" }}>
                      This system is locked to the <strong>Elevate</strong>{" "}
                      theme design system.
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge bg-primary text-uppercase px-3 py-2"
                      style={{ letterSpacing: "1px" }}
                    >
                      <i className="fas fa-lock me-2"></i> LOCKED: ELEVATE
                    </span>
                  </div>
                </div>

                <div className="row g-5">
                  <div className="col-md-6">
                    <h6 className="pe-subtitle text-uppercase mb-3 fw-bold text-info">
                      Branding & Assets
                    </h6>
                    {[
                      "logoUrl",
                      "faviconUrl",
                      "loginImageUrl",
                      "registerImageUrl",
                    ].map((key) => (
                      <div className="mb-4" key={key}>
                        <label
                          className="form-label small text-capitalize"
                          style={{ color: "var(--pe-text-main)" }}
                        >
                          {key.replace(/([A-Z])/g, " $1").replace("Url", "")}
                        </label>
                        <div className="input-group">
                          <input
                            type="file"
                            className="form-control"
                            style={glassInputStyle}
                            onChange={(e) =>
                              handleUnifiedUpload(e, `branding.${key}`)
                            }
                            accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                          />
                          {uploadingStatus[`branding.${key}`] && (
                            <span className="input-group-text bg-dark border-secondary text-white">
                              <i className="fas fa-spinner fa-spin"></i>
                            </span>
                          )}
                        </div>
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Max 2MB. PNG/JPG/WEBP.
                        </small>
                        {config.branding?.[key] && (
                          <div className="mt-2 p-2 bg-secondary bg-opacity-10 rounded border border-secondary d-inline-block">
                            <img
                              src={config.branding[key]}
                              alt="Preview"
                              style={{
                                maxHeight: "60px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6 border-start border-secondary ps-md-5">
                    <h6 className="pe-subtitle text-uppercase mb-3 fw-bold text-info">
                      Design Tokens
                    </h6>
                    <div className="mb-4">
                      <label
                        className="small mb-2 d-block"
                        style={{ color: "var(--pe-text-main)" }}
                      >
                        Color Palette
                      </label>
                      <div className="d-grid gap-2">
                        {[
                          { label: "Primary", path: "colors.primary" },
                          { label: "Secondary", path: "colors.secondary" },
                          { label: "Accent", path: "colors.accent" },
                          {
                            label: "Button BG",
                            path: "colors.button.background",
                          },
                          { label: "Button Text", path: "colors.button.text" },
                        ].map((item, idx) => {
                          const keys = item.path.split(".");
                          let val = config;
                          keys.forEach((k) => {
                            val = val ? val[k] : null;
                          });
                          return (
                            <div
                              className="d-flex align-items-center justify-content-between p-2 rounded"
                              key={idx}
                              style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                              <span
                                style={{
                                  color: "var(--pe-text-muted)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {item.label}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="small font-monospace"
                                  style={{ color: "var(--pe-text-main)" }}
                                >
                                  {val}
                                </span>
                                <input
                                  type="color"
                                  className="form-control form-control-color bg-transparent border-0 p-0"
                                  value={val || "#000000"}
                                  onChange={(e) =>
                                    handleConfigChange(e, item.path)
                                  }
                                  style={{ width: "30px", height: "30px" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label
                        className="form-label small"
                        style={{ color: "var(--pe-text-main)" }}
                      >
                        Typography Family
                      </label>
                      <select
                        className="form-select"
                        style={glassInputStyle}
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
                          <option
                            key={font}
                            value={font}
                            style={{ color: "#000" }}
                          >
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    {[
                      {
                        label: "Base Size",
                        path: "typography.baseFontSize",
                        min: 12,
                        max: 20,
                      },
                      {
                        label: "Heading 1",
                        path: "typography.h1FontSize",
                        min: 24,
                        max: 64,
                      },
                    ].map((slider) => {
                      const keys = slider.path.split(".");
                      let val = config;
                      keys.forEach((k) => {
                        val = val ? val[k] : null;
                      });
                      return (
                        <DebouncedRangeInput
                          key={slider.label}
                          label={slider.label}
                          value={parseInt(val || slider.min)}
                          min={slider.min}
                          max={slider.max}
                          onChange={(newValue) =>
                            handleSliderUpdate(newValue, slider.path)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div
                className="pe-card mb-4 position-sticky"
                style={{ top: "20px", zIndex: 10 }}
              >
                <ThemePreview config={config} />
                <div className="mt-4 pt-4 border-top border-secondary">
                  <h6 className="pe-subtitle text-uppercase mb-3">
                    Feature Toggles
                  </h6>
                  {config.featureFlags &&
                    Object.entries(config.featureFlags)
                      .filter(([key]) => key !== "pageStatus")
                      .map(([key, value]) => (
                        <div className="form-check form-switch mb-2" key={key}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={key}
                            checked={!!value}
                            onChange={(e) =>
                              handleConfigChange(e, `featureFlags.${key}`)
                            }
                            style={{
                              backgroundColor: value
                                ? "var(--pe-accent)"
                                : "rgba(255,255,255,0.2)",
                            }}
                          />
                          <label
                            className="form-check-label small"
                            style={{ color: "var(--pe-text-main)" }}
                            htmlFor={key}
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: APPROVALS --- */}
        {activeTab === "approvals" && (
          <div className="pe-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="pe-title">Pending Requests</h5>
              <button
                className="pe-btn-action"
                onClick={() => fetchApprovals(approvalsMeta.page)}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            <div className="pe-table-wrapper">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Requester</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalRequests.length > 0 ? (
                    approvalRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="text-muted small">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="pe-badge pe-badge-info">
                            {req.requestType}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold">{req.requestedBy?.name}</div>
                          <small className="text-muted">
                            {req.requestedBy?.email}
                          </small>
                        </td>
                        <td style={{ maxWidth: "350px", minWidth: "250px" }}>
                          <LogDetails details={req.details} />
                        </td>
                        <td>
                          <span
                            className={`pe-badge ${
                              req.status === "PENDING"
                                ? "pe-badge-warning"
                                : req.status === "APPROVED"
                                ? "pe-badge-success"
                                : "pe-badge-danger"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {req.status === "PENDING" && (
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="pe-btn-action text-success"
                                onClick={() =>
                                  handleResolveRequest(req.id, "APPROVED")
                                }
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="pe-btn-action text-danger"
                                onClick={() =>
                                  handleResolveRequest(req.id, "REJECTED")
                                }
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-5">
                        No pending requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={approvalsMeta.page}
              totalPages={approvalsMeta.totalPages}
              onPageChange={fetchApprovals}
              loading={loading}
            />
          </div>
        )}

        {/* --- TAB 3: SECURITY LOGS --- */}
        {activeTab === "security" && (
          <div className="pe-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="pe-title">System Audit Logs</h5>
              <button
                className="pe-btn-action"
                onClick={() => fetchLogs(logsMeta.page)}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            <div className="pe-table-wrapper">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>IP Address</th>
                    <th>Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted small text-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        {log.user?.name || "System"}
                        <div
                          className="text-muted small"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {log.user?.email}
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            log.action.includes("FAILURE")
                              ? "text-danger fw-bold"
                              : "text-success"
                          }
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="font-monospace small text-muted">
                        {log.ipAddress}
                      </td>
                      <td>{safeRender(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={logsMeta.page}
              totalPages={logsMeta.totalPages}
              onPageChange={fetchLogs}
              loading={loading}
            />
          </div>
        )}

        {/* --- TAB 4: MAINTENANCE --- */}
        {activeTab === "maintenance" && (
          <div className="row">
            <div className="col-md-6">
              <div
                className="pe-card border-danger h-100"
                style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
              >
                <h5 className="pe-title text-danger mb-3">
                  <i className="fas fa-skull-crossbones me-2"></i>Danger Zone
                </h5>
                <p className="text-muted small">
                  Tindakan di sini bersifat destruktif dan tidak dapat
                  dibatalkan.
                </p>
                <div className="mt-4 p-3 border border-danger border-opacity-25 rounded bg-danger bg-opacity-10">
                  <h6 className="text-danger fw-bold">Reset Database</h6>
                  <p className="small text-muted mb-3">
                    Menghapus seluruh data transaksi, user, dan toko.
                  </p>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleReseed}
                    disabled={isSeeding}
                  >
                    <i
                      className={`fas ${
                        isSeeding ? "fa-spinner fa-spin" : "fa-trash"
                      } me-2`}
                    ></i>
                    {isSeeding ? "Resetting..." : "Execute Factory Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-dev"></div>
      <div className="pe-blob pe-blob-2"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default DeveloperDashboardPage;
