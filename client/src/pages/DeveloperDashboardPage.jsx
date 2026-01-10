// File: client/src/pages/DeveloperDashboardPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fade, Slide } from "react-awesome-reveal";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  getSuperUserConfig,
  updateSuperUserConfig,
  getApprovalRequests,
  resolveApprovalRequest,
  reseedDatabase,
  uploadDeveloperAsset,
  getDeveloperMetrics, // Pastikan ini ada di apiService.js
} from "../services/apiService";

import API_BASE_URL from "../apiConfig";
import "../styles/ElevateDashboard.css";

// Registrasi Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- HELPER: SAFE RENDER ---
const safeRender = (data, fallback = "-") => {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") {
    return JSON.stringify(data);
  }
  return data;
};

// --- STYLE HELPER: GLASS INPUT ---
const glassInputStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid var(--pe-card-border)",
  color: "var(--pe-text-main)",
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
      if (localValue !== parseInt(value)) onChange(localValue);
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
  if (link.href !== fontUrl) link.href = fontUrl;
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
            maxHeight: "150px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
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
  const wrapperStyle = {
    fontFamily: config.typography?.fontFamily || "'Inter', sans-serif",
    "--primary-color": config.colors?.primary || "#0dcaf0",
    "--button-bg": config.colors?.button?.background || "#0D6EFD",
    "--button-text": config.colors?.button?.text || "#FFFFFF",
    background: "var(--pe-bg)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid var(--pe-card-border)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={wrapperStyle}>
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
          style={{ color: "var(--pe-text-muted)" }}
          className="small text-uppercase mb-3 letter-spacing-2"
        >
          Live Preview
        </h6>
        <div
          style={{
            background: "var(--pe-card-bg)",
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
              color: "var(--pe-text-main)",
            }}
          >
            Elevate Your{" "}
            <span style={{ color: "var(--primary-color)" }}>Style</span>
          </h2>
          <p
            style={{
              fontSize: config.typography?.baseFontSize || "16px",
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
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Primary Action
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
  
  // State Monitoring Realtime
  const [metrics, setMetrics] = useState({
    uptime: "00:00:00",
    avgLatency: 0,
    errorRate: 0,
    memory: { used: 0, osUsagePercent: 0 },
    cpu: { usage: 0 },
    traffic: [0, 0, 0, 0, 0, 0, 0],
  });

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
  const [activeTab, setActiveTab] = useState("overview"); // Default ke Overview
  const [uploadingStatus, setUploadingStatus] = useState({});
  const navigate = useNavigate();

  // --- CHART DATA (REALTIME LINKED) ---
  const apiTrafficData = {
    labels: ["-6m", "-5m", "-4m", "-3m", "-2m", "-1m", "Now"],
    datasets: [
      {
        label: "API Requests (RPM)",
        data: metrics.traffic, // Gunakan data dari metrics
        fill: true,
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        borderColor: "#f43f5e",
        tension: 0.4,
        pointBackgroundColor: "#f43f5e",
        pointBorderColor: "#f43f5e",
        pointBorderWidth: 2,
      },
    ],
  };

  const serverHealthData = {
    labels: ["CPU Load", "RAM (OS)", "Node Mem"],
    datasets: [
      {
        label: "Usage % / Load",
        data: [
          metrics.cpu.usage * 10,
          metrics.memory.osUsagePercent,
          (metrics.memory.used / 2048) * 100, // Asumsi 2GB
        ],
        backgroundColor: [
          "#3b82f6",
          "#f59e0b",
          "#10b981",
        ],
        borderRadius: 6,
      },
    ],
  };

  // --- CHART OPTIONS (LIGHT MODE FIX) ---
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af" } }, // FIX: Warna netral
      y: {
        grid: { color: "rgba(128, 128, 128, 0.1)" },
        ticks: { color: "#9ca3af" },
      },
    },
  };

  // --- FETCHING DATA ---
  const fetchConfig = async () => {
    try {
      const configData = await getSuperUserConfig();
      // Default theme 'elevate' jika belum diset
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
        if (Array.isArray(result)) setApprovalRequests(result);
        else {
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
      const res = await fetch(
        `${API_BASE_URL}/api/superuser/security-logs?page=${page}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (res.ok) {
        if (Array.isArray(result)) setSecurityLogs(result);
        else {
          setSecurityLogs(result.data);
          setLogsMeta(result.meta);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await getDeveloperMetrics();
      if (data) setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
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
      await Promise.all([fetchConfig(), fetchApprovals(1), fetchLogs(1), fetchMetrics()]);
      setLoading(false);
    };
    init();

    // Polling Metrics setiap 5 detik
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (config?.typography?.fontFamily)
      loadGoogleFont(config.typography.fontFamily);
  }, [config?.typography?.fontFamily]);

  // --- HANDLERS ---
  const handleConfigChange = (e, path) => {
    const { value, type, checked } = e.target;
    const keys = path.split(".");
    setConfig((prev) => {
      const newC = JSON.parse(JSON.stringify(prev));
      let cur = newC;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newC;
    });
  };

  const handleSliderUpdate = (value, path) => {
    const keys = path.split(".");
    setConfig((prev) => {
      const newC = JSON.parse(JSON.stringify(prev));
      let cur = newC;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = `${value}px`;
      return newC;
    });
  };

  const handleUnifiedUpload = async (e, path) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStatus((prev) => ({ ...prev, [path]: true }));
    const formData = new FormData();
    formData.append("asset", file);
    try {
      const result = await uploadDeveloperAsset(formData);
      setConfig((prev) => {
        const newC = JSON.parse(JSON.stringify(prev));
        const keys = path.split(".");
        let cur = newC;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!cur[keys[i]]) cur[keys[i]] = {};
          cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = result.imageUrl;
        return newC;
      });
      if (showMessage) showMessage("Upload Sukses! Klik Simpan.", "Success");
    } catch (err) {
      if (showMessage) showMessage("Gagal upload.", "Error");
    } finally {
      setUploadingStatus((prev) => ({ ...prev, [path]: false }));
    }
  };

  const handleConfigSave = async () => {
    setIsSaving(true);
    try {
      const configToSave = { ...config, homePageTheme: "elevate" };
      await updateSuperUserConfig(configToSave);
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
      !window.confirm("PERINGATAN: Reset database akan menghapus semua data!")
    )
      return;
    setIsSeeding(true);
    try {
      const result = await reseedDatabase();
      if (showMessage) showMessage(result.message, "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResolveRequest = async (requestId, resolution) => {
    if (!window.confirm(`Yakin ingin ${resolution}?`)) return;
    try {
      await resolveApprovalRequest(requestId, resolution);
      if (showMessage) showMessage(`Berhasil di-${resolution}.`);
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
    return <div className="p-4 text-center text-adaptive">No Config Found</div>;

  /* =========================================
     RENDER CONTENT (Tabs)
     ========================================= */
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="row g-4">
            {/* METRICS CARDS */}
            {[
              {
                l: "API Uptime",
                v: metrics.uptime, // Real Data
                i: "fa-server",
                c: "pe-icon-green",
                s: "Operational",
              },
              {
                l: "Avg Latency",
                v: `${metrics.avgLatency}ms`, // Real Data
                i: "fa-bolt",
                c: "pe-icon-gold",
                s: metrics.avgLatency < 100 ? "Fast" : "Slow",
              },
              {
                l: "Error Rate",
                v: `${metrics.errorRate}%`, // Real Data
                i: "fa-exclamation-triangle",
                c: "pe-icon-red",
                s: metrics.errorRate < 1 ? "Healthy" : "Check Logs",
              },
              {
                l: "Active Nodes",
                v: "8/8", // Static for now
                i: "fa-network-wired",
                c: "pe-icon-blue",
                s: "Healthy",
              },
            ].map((m, idx) => (
              <div className="col-md-3" key={idx}>
                <Fade delay={idx * 100} triggerOnce>
                  <div className="pe-card h-100">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`pe-stat-icon ${m.c} mb-0`}>
                        <i className={`fas ${m.i}`}></i>
                      </div>
                      <span className={`pe-badge ${m.s === "Check Logs" || m.s === "Slow" ? "pe-badge-danger" : "pe-badge-success"}`}>
                        {m.s}
                      </span>
                    </div>
                    <h3 className="pe-title mb-1">{m.v}</h3>
                    <p className="pe-subtitle small mb-0">{m.l}</p>
                  </div>
                </Fade>
              </div>
            ))}

            {/* CHARTS */}
            <div className="col-lg-8">
              <Slide direction="left" triggerOnce>
                <div className="pe-card h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="pe-title mb-0">Live Traffic (RPM)</h5>
                    <span className="pe-badge pe-badge-info">
                      <i className="fas fa-circle me-1 small"></i> Live
                    </span>
                  </div>
                  <div style={{ height: "300px" }}>
                    <Line data={apiTrafficData} options={commonChartOptions} />
                  </div>
                </div>
              </Slide>
            </div>
            <div className="col-lg-4">
              <Slide direction="right" triggerOnce>
                <div className="pe-card h-100">
                  <h5 className="pe-title mb-4">Resource Usage</h5>
                  <div style={{ height: "300px" }}>
                    <Bar
                      data={serverHealthData}
                      options={{
                        ...commonChartOptions,
                        scales: {
                          ...commonChartOptions.scales,
                          y: { ...commonChartOptions.scales.y, max: 100 },
                        },
                      }}
                    />
                  </div>
                </div>
              </Slide>
            </div>
          </div>
        );

      case "theme":
        return (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="pe-card mb-4">
                <h5 className="pe-title mb-4 border-bottom border-secondary pb-3">
                  Global Theme Settings
                </h5>
                {/* Branding & Assets Section */}
                <div className="row g-5">
                  <div className="col-md-6">
                    <h6 className="pe-subtitle text-uppercase mb-3 fw-bold text-info">
                      Branding
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
                          />
                          {uploadingStatus[`branding.${key}`] && (
                            <span className="input-group-text bg-dark text-white">
                              <i className="fas fa-spinner fa-spin"></i>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6 border-start border-secondary ps-md-5">
                    <h6 className="pe-subtitle text-uppercase mb-3 fw-bold text-info">
                      Design Tokens
                    </h6>
                    {/* Color Palette Inputs */}
                    <div className="d-grid gap-2 mb-4">
                      {[
                        { label: "Primary", path: "colors.primary" },
                        {
                          label: "Button BG",
                          path: "colors.button.background",
                        },
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
                            <input
                              type="color"
                              className="form-control form-control-color bg-transparent border-0 p-0"
                              value={val || "#000000"}
                              onChange={(e) => handleConfigChange(e, item.path)}
                              style={{ width: "30px", height: "30px" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Font Selector */}
                    <select
                      className="form-select mb-3"
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
                      <option value="" disabled>
                        Select Font Family
                      </option>
                      {[
                        "Outfit",
                        "Inter",
                        "Poppins",
                        "Roboto",
                        "Open Sans",
                        "Lato",
                        "Montserrat",
                      ].map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SLIDERS */}
                <div className="mt-4 pt-4 border-top border-secondary">
                  <h6 className="pe-subtitle text-uppercase mb-3 fw-bold text-warning">
                    Dimensions
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <DebouncedRangeInput
                        label="Border Radius (px)"
                        value={parseInt(config.borderRadius || 8)}
                        min={0}
                        max={30}
                        onChange={(val) =>
                          handleSliderUpdate(val, "borderRadius")
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <DebouncedRangeInput
                        label="Spacing Unit (px)"
                        value={parseInt(config.spacing || 16)}
                        min={4}
                        max={40}
                        onChange={(val) => handleSliderUpdate(val, "spacing")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sticky-top" style={{ top: "100px" }}>
                <ThemePreview config={config} />
                <div className="pe-card mt-4">
                  <h6 className="pe-subtitle mb-3 text-info">Raw JSON Data</h6>
                  <pre
                    className="p-3 rounded small mb-0"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      color: "var(--pe-text-muted)",
                      maxHeight: "300px",
                      overflowY: "auto",
                      fontSize: "0.7rem",
                    }}
                  >
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );

      case "approvals":
        return (
          <div className="pe-card">
            <h5 className="pe-title mb-4">Pending Approvals</h5>
            <div className="table-responsive">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Requester</th>
                    <th>Details</th>
                    <th>Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalRequests.length > 0 ? (
                    approvalRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <span className="pe-badge pe-badge-warning">
                            {req.requestType}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold">
                            {safeRender(req.requestedBy?.name)}
                          </div>
                          <small className="text-muted">
                            {safeRender(req.requestedBy?.email)}
                          </small>
                        </td>
                        <td style={{ maxWidth: "300px" }}>
                          <LogDetails details={req.details} />
                        </td>
                        <td>
                          {new Date(req.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="text-end">
                          <button
                            className="pe-btn-action pe-btn-sm me-2 text-success border-success"
                            onClick={() =>
                              handleResolveRequest(req.id, "APPROVED")
                            }
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="pe-btn-action pe-btn-sm text-danger border-danger"
                            onClick={() =>
                              handleResolveRequest(req.id, "REJECTED")
                            }
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        No pending requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={approvalsMeta.page}
              totalPages={approvalsMeta.totalPages}
              onPageChange={(p) => fetchApprovals(p)}
              loading={loading}
            />
          </div>
        );

      case "security":
        return (
          <div className="pe-card">
            <h5 className="pe-title mb-4">System Security Logs</h5>
            <div className="table-responsive">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Event</th>
                    <th>User</th>
                    <th>IP / Details</th>
                    <th className="text-end">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.length > 0 ? (
                    securityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span
                            className={`pe-badge ${
                              log.level === "CRITICAL" || log.level === "ERROR"
                                ? "pe-badge-danger"
                                : log.level === "WARN"
                                ? "pe-badge-warning"
                                : "pe-badge-info"
                            }`}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="fw-bold text-info">{log.action}</td>
                        <td>{safeRender(log.user?.email, "System")}</td>
                        <td style={{ maxWidth: "300px" }}>
                          <div className="small font-monospace text-muted mb-1">
                            {log.ipAddress}
                          </div>
                          <LogDetails details={log.details} />
                        </td>
                        <td className="text-end text-muted small">
                          {new Date(log.timestamp).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        No logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={logsMeta.page}
              totalPages={logsMeta.totalPages}
              onPageChange={(p) => fetchLogs(p)}
              loading={loading}
            />
          </div>
        );

      case "maintenance":
        return (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="pe-card h-100 border-danger">
                <h5 className="pe-title text-danger mb-3">Danger Zone</h5>
                <p className="text-muted small mb-4">
                  Actions here are irreversible. Proceed with caution.
                </p>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={handleReseed}
                    disabled={isSeeding}
                  >
                    {isSeeding ? (
                      <div className="spinner-border spinner-border-sm"></div>
                    ) : (
                      <i className="fas fa-database"></i>
                    )}
                    RESET DATABASE (RESEED)
                  </button>
                  <button
                    className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={() => alert("Fitur flush cache belum aktif.")}
                  >
                    <i className="fas fa-broom"></i>
                    FLUSH REDIS CACHE
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="pe-card h-100">
                <h5 className="pe-title mb-3">System Utilities</h5>
                <div className="list-group list-group-flush bg-transparent">
                  <div className="list-group-item bg-transparent text-muted d-flex justify-content-between align-items-center">
                    <span>Node Version</span>
                    <span className="text-info font-monospace">v18.17.0</span>
                  </div>
                  <div className="list-group-item bg-transparent text-muted d-flex justify-content-between align-items-center">
                    <span>Database Status</span>
                    <span className="text-success">Connected</span>
                  </div>
                  <div className="list-group-item bg-transparent text-muted d-flex justify-content-between align-items-center">
                    <span>Server Uptime</span>
                    <span className="text-white">{metrics.uptime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      {/* Background Blobs khusus Dev */}
      <div className="pe-blob pe-blob-1 pe-blob-dev"></div>
      <div className="pe-blob pe-blob-2"></div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <Fade direction="down" triggerOnce>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              System Console <span className="text-success small ms-2">● Live</span>
            </h6>
            <h2 className="pe-title display-6 mb-0">Developer Dashboard</h2>
          </Fade>
        </div>

        <div className="d-flex gap-2">
          {hasChanges && (
            <button
              className="pe-btn-action bg-warning text-dark border-warning"
              onClick={handleConfigSave}
              disabled={isSaving}
            >
              <i
                className={`fas ${
                  isSaving ? "fa-spinner fa-spin" : "fa-save"
                } me-2`}
              ></i>
              {isSaving ? "Saving..." : "Save Config"}
            </button>
          )}
          <button
            className="pe-btn-action"
            onClick={() => navigate("/admin/dashboard")}
            style={{
              borderColor: "var(--pe-accent-admin)",
              color: "var(--pe-accent-admin)",
            }}
          >
            <i className="fas fa-user-shield me-2"></i> Switch to Admin
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: "fa-chart-line" },
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
            <i className={`fas ${tab.icon} me-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* DYNAMIC CONTENT */}
      {renderContent()}
    </div>
  );
};

export default DeveloperDashboardPage;