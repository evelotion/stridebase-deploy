import React, { useState, useEffect } from "react";
import Select from "react-select";
import API_BASE_URL from "../apiConfig";

// Komponen helper (tidak berubah)
const HealthStatusIndicator = ({ service, status }) => {
  const isOperational = status === "Operasional";
  return (
    <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
      <span className="fw-bold">{service}</span>
      <span className={`badge ${isOperational ? "bg-success" : "bg-danger"}`}>
        {status}
      </span>
    </div>
  );
};
const ColorInput = ({ label, name, value, onChange }) => (
  <div className="col-lg-6 mb-3">
    <label className="form-label">{label}</label>
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        style={{ maxWidth: "120px" }}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder="#RRGGBB"
      />
      <input
        type="color"
        className="form-control form-control-color"
        name={name}
        value={value || "#FFFFFF"}
        onChange={onChange}
      />
    </div>
  </div>
);

// Komponen utama
const DeveloperDashboardPage = ({ showMessage }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");
  const [loginImagePreview, setLoginImagePreview] = useState("");
  const [registerImagePreview, setRegisterImagePreview] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [localConfig, setLocalConfig] = useState(null);
  const [activeTab, setActiveTab] = useState("theming");
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ mode: "sandbox" });
  const [loadingPaymentConfig, setLoadingPaymentConfig] = useState(true);
  const [fontOptions, setFontOptions] = useState([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);

  // State terpisah untuk setiap preview font size
  const [previewBaseSize, setPreviewBaseSize] = useState(16);
  const [previewH1Size, setPreviewH1Size] = useState(48);
  const [previewButtonSize, setPreviewButtonSize] = useState(13.6);
  const [previewDisplaySize, setPreviewDisplaySize] = useState(56);
  const [previewLeadSize, setPreviewLeadSize] = useState(20);
  const [previewBtnLgSize, setPreviewBtnLgSize] = useState(16);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchInitialConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/superuser/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal mengambil data konfigurasi.");
        const data = await response.json();
        setConfig(data);
        setLocalConfig(JSON.parse(JSON.stringify(data)));

        // Set nilai awal slider dari config
        setPreviewBaseSize(parseFloat(data.typography?.baseFontSize) || 16);
        setPreviewH1Size(parseFloat(data.typography?.h1FontSize) * 16 || 48);
        setPreviewButtonSize(
          parseFloat(data.typography?.buttonFontSize) * 16 || 13.6
        );
        setPreviewDisplaySize(
          parseFloat(data.typography?.displayFontSize) * 16 || 56
        );
        setPreviewLeadSize(
          parseFloat(data.typography?.leadFontSize) * 16 || 20
        );
        setPreviewBtnLgSize(
          parseFloat(data.typography?.buttonLgFontSize) * 16 || 16
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialConfig();
  }, []);

  // useEffect untuk memuat font
  useEffect(() => {
    const fetchFonts = async () => {
      // Ganti dengan variabel dari .env
      const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );
        const data = await response.json();
        const options = data.items.slice(0, 200).map((font) => ({
          value: `'${font.family}', ${font.category}`,
          label: font.family,
        }));
        setFontOptions(options);
      } catch (error) {
        console.error("Gagal mengambil daftar font:", error);
        setFontOptions([
          { value: "'Poppins', sans-serif", label: "Poppins" },
          { value: "'Inter', sans-serif", label: "Inter" },
          { value: "'Roboto', sans-serif", label: "Roboto" },
        ]);
      } finally {
        setIsLoadingFonts(false);
      }
    };
    fetchFonts();
  }, []);

  // useEffect untuk data tab
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const fetchHealthStatus = async () => {
      setLoadingHealth(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/superuser/maintenance/health-check`,
          { headers }
        );
        const data = await response.json();
        setHealthStatus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHealth(false);
      }
    };
    const fetchSecurityLogs = async () => {
      setLoadingLogs(true);
      try {
        // Alamatnya kini lengkap: https://stridebase-server.onrender.com/api/...
        const response = await fetch(
          `${API_BASE_URL}/api/superuser/maintenance/security-logs`,
          { headers }
        );
        if (!response.ok) throw new Error("Gagal mengambil log keamanan.");
        const data = await response.json();
        setSecurityLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLogs(false);
      }
    };
    const fetchApprovalRequests = async () => {
      setLoadingRequests(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/superuser/approval-requests`,
          {
            headers,
          }
        );
        if (!response.ok)
          throw new Error("Gagal mengambil permintaan persetujuan.");
        const data = await response.json();
        setApprovalRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRequests(false);
      }
    };
    const fetchPaymentConfig = async () => {
      setLoadingPaymentConfig(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/superuser/config/payment`,
          {
            headers,
          }
        );
        if (!response.ok)
          throw new Error("Gagal mengambil konfigurasi pembayaran.");
        const data = await response.json();
        setPaymentConfig(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPaymentConfig(false);
      }
    };
    if (activeTab === "theming") fetchHealthStatus();
    if (activeTab === "security") fetchSecurityLogs();
    if (activeTab === "approvals") fetchApprovalRequests();
    if (activeTab === "payment") fetchPaymentConfig();
  }, [activeTab]);

  const handleSizeChange = (e, type) => {
    const value = e.target.value;
    const root = document.documentElement;
    const remValue = value / 16;

    const sizeConfig = {
      base: {
        setter: setPreviewBaseSize,
        property: "--font-size-base",
        key: "baseFontSize",
        unit: "px",
      },
      h1: {
        setter: setPreviewH1Size,
        property: "--font-size-h1",
        key: "h1FontSize",
        unit: "rem",
      },
      button: {
        setter: setPreviewButtonSize,
        property: "--font-size-button",
        key: "buttonFontSize",
        unit: "rem",
      },
      display: {
        setter: setPreviewDisplaySize,
        property: "--font-size-display",
        key: "displayFontSize",
        unit: "rem",
      },
      lead: {
        setter: setPreviewLeadSize,
        property: "--font-size-lead",
        key: "leadFontSize",
        unit: "rem",
      },
      btnLg: {
        setter: setPreviewBtnLgSize,
        property: "--font-size-button-lg",
        key: "buttonLgFontSize",
        unit: "rem",
      },
    };

    const config = sizeConfig[type];
    if (config) {
      config.setter(value);
      const cssValue = config.unit === "px" ? `${value}px` : `${remValue}rem`;
      root.style.setProperty(config.property, cssValue);
      setLocalConfig((prev) => ({
        ...prev,
        typography: { ...prev.typography, [config.key]: cssValue },
      }));
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
    if (!localConfig) return;
    setLocalConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let temp = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (temp[key] === undefined || temp[key] === null) {
          temp[key] = {};
        }
        temp = temp[key];
      }
      temp[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newConfig;
    });
  };

  const handleFileUpload = async (file, configKey) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("asset", file);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/upload-asset`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal mengunggah file.");
      setLocalConfig((prevConfig) => ({
        ...prevConfig,
        branding: { ...prevConfig.branding, [configKey]: result.filePath },
      }));
      alert(
        "File berhasil diunggah! Jangan lupa simpan perubahan untuk menerapkan."
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFileChange = (e, configKey) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (configKey === "logoUrl") setLogoPreview(previewUrl);
    else if (configKey === "faviconUrl") setFaviconPreview(previewUrl);
    // Tambahkan dua kondisi ini
    else if (configKey === "loginImageUrl") setLoginImagePreview(previewUrl);
    else if (configKey === "registerImageUrl")
      setRegisterImagePreview(previewUrl);
    handleFileUpload(file, configKey);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/superuser/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(localConfig),
      });
      if (!response.ok) throw new Error("Gagal menyimpan perubahan.");
      alert(
        "Konfigurasi berhasil diperbarui! Muat ulang halaman untuk melihat perubahan global."
      );
      const root = document.documentElement;
      Object.keys(root.style).forEach((key) => {
        if (key.startsWith("--font-size")) {
          root.style.removeProperty(key);
        }
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentConfig = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/config/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentConfig),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert(result.message);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm("Apakah Anda yakin ingin membersihkan seluruh cache aplikasi?")
    )
      return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/maintenance/clear-cache`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert(result.message);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== "RESET") {
      alert("Teks konfirmasi salah. Silakan ketik 'RESET' untuk melanjutkan.");
      return;
    }
    setShowResetModal(false);
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      alert(
        "Proses reset database dimulai. Ini mungkin memakan waktu beberapa saat. Halaman akan dimuat ulang setelah selesai."
      );
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/maintenance/reseed-database`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert(result.message);
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
      setResetConfirmText("");
    }
  };

  const handleResolveRequest = async (requestId, resolution) => {
    const actionText = resolution === "APPROVED" ? "menyetujui" : "menolak";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} permintaan ini?`))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/approval-requests/${requestId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resolution }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal memproses permintaan.");

      showMessage(data.message);
      setApprovalRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error(error);
      showMessage(error.message, "Error");
    }
  };

  const handleFontChange = (selectedOption) => {
    setLocalConfig((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: selectedOption.value,
      },
    }));
  };

  const handlePageSelectionChange = (selectedOptions) => {
    setLocalConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const newPageStatus = { ...newConfig.featureFlags.pageStatus };

      Object.keys(newPageStatus).forEach((page) => {
        newPageStatus[page] = false;
      });

      selectedOptions.forEach((option) => {
        newPageStatus[option.value] = true;
      });

      newConfig.featureFlags.pageStatus = newPageStatus;
      return newConfig;
    });
  };

  if (loading || !config || !localConfig) {
    return <div className="p-4">Memuat konfigurasi global...</div>;
  }

  const pageStatusOptions = localConfig.featureFlags?.pageStatus
    ? Object.keys(localConfig.featureFlags.pageStatus).map((page) => ({
        value: page,
        label: page.charAt(1).toUpperCase() + page.slice(2),
      }))
    : [];

  const selectedPageStatus = pageStatusOptions.filter(
    (option) => localConfig.featureFlags.pageStatus[option.value]
  );

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">SuperUser Control Panel</h2>
          {activeTab === "theming" && (
            <button
              className="btn btn-primary"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan Tema"}
            </button>
          )}
        </div>

        <ul className="nav nav-tabs px-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "theming" ? "active" : ""}`}
              onClick={() => setActiveTab("theming")}
            >
              Theming & Maintenance
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              Security & Monitoring
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "approvals" ? "active" : ""
              }`}
              onClick={() => setActiveTab("approvals")}
            >
              Pusat Persetujuan
              {approvalRequests.length > 0 && (
                <span className="badge bg-danger ms-2">
                  {approvalRequests.length}
                </span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "payment" ? "active" : ""}`}
              onClick={() => setActiveTab("payment")}
            >
              Konfigurasi Pembayaran
            </button>
          </li>
        </ul>

        <div className="tab-content py-3">
          {activeTab === "theming" && (
            <div>
              <div className="row mb-4">
                <div className="col-12">
                  <div className="table-card p-3 shadow-sm">
                    <h5 className="mb-3">Status Kesehatan Platform</h5>
                    {loadingHealth ? (
                      <div className="text-center text-muted p-3">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></div>
                        Memeriksa status layanan...
                      </div>
                    ) : healthStatus ? (
                      <div>
                        <HealthStatusIndicator
                          service="Database (PostgreSQL)"
                          status={healthStatus.database}
                        />
                        <HealthStatusIndicator
                          service="Cache & Antrian (Redis)"
                          status={healthStatus.redis}
                        />
                        <div className="mt-3 text-center">
                          <h6 className="mb-0">Status Keseluruhan:</h6>
                          <p
                            className={`fw-bold fs-5 ${
                              healthStatus.overallStatus.includes("Masalah")
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {healthStatus.overallStatus}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-danger p-3">
                        Gagal memuat status kesehatan. Periksa koneksi ke
                        server.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="table-card p-4 shadow-sm mb-4">
                    <h5 className="mb-4">Branding & Logo</h5>
                    <div className="mb-3">
                      <label className="form-label">Logo Website</label>
                      <div className="d-flex align-items-center">
                        <img
                          src={logoPreview || `${config.branding?.logoUrl}`}
                          alt="Logo"
                          style={{
                            height: "40px",
                            marginRight: "1rem",
                            border: "1px solid #ddd",
                            padding: "5px",
                          }}
                        />
                        <input
                          type="file"
                          className="form-control"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={(e) => handleFileChange(e, "logoUrl")}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Favicon (.ico, .svg, .png)
                      </label>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            faviconPreview || `${config.branding?.faviconUrl}`
                          }
                          alt="Favicon"
                          style={{ height: "32px", marginRight: "1rem" }}
                        />
                        <input
                          type="file"
                          className="form-control"
                          accept="image/x-icon, image/svg+xml, image/png"
                          onChange={(e) => handleFileChange(e, "faviconUrl")}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Gambar Halaman Login</label>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            loginImagePreview ||
                            `${config.branding?.loginImageUrl}`
                          }
                          alt="Login Page Image"
                          style={{
                            height: "40px",
                            marginRight: "1rem",
                            border: "1px solid #ddd",
                            padding: "5px",
                            objectFit: "cover",
                          }}
                        />
                        <input
                          type="file"
                          className="form-control"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={(e) => handleFileChange(e, "loginImageUrl")}
                        />
                      </div>
                    </div>

                    {/* Uploader Gambar Halaman Register */}
                    <div className="mb-3">
                      <label className="form-label">
                        Gambar Halaman Register
                      </label>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            registerImagePreview ||
                            `${config.branding?.registerImageUrl}`
                          }
                          alt="Register Page Image"
                          style={{
                            height: "40px",
                            marginRight: "1rem",
                            border: "1px solid #ddd",
                            padding: "5px",
                            objectFit: "cover",
                          }}
                        />
                        <input
                          type="file"
                          className="form-control"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={(e) =>
                            handleFileChange(e, "registerImageUrl")
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="table-card p-4 shadow-sm">
                    <h5 className="mb-4">Warna & Tampilan</h5>
                    <div className="row">
                      <ColorInput
                        label="Warna Primer"
                        name="colors.primary"
                        value={localConfig.colors?.primary}
                        onChange={handleConfigChange}
                      />
                      <ColorInput
                        label="Warna Sekunder"
                        name="colors.secondary"
                        value={localConfig.colors?.secondary}
                        onChange={handleConfigChange}
                      />
                      <ColorInput
                        label="Warna Aksen (Kartu Profil)"
                        name="colors.accent"
                        value={localConfig.colors?.accent}
                        onChange={handleConfigChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="table-card p-4 shadow-sm mb-4">
                    <h5 className="mb-4">Latar Belakang Website</h5>
                    <div className="mb-3">
                      <label className="form-label">Warna Latar Belakang</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          style={{ maxWidth: "120px" }}
                          name="background.value"
                          value={localConfig.background?.value || ""}
                          onChange={handleConfigChange}
                          placeholder="#RRGGBB"
                        />
                        <input
                          type="color"
                          className="form-control form-control-color"
                          name="background.value"
                          value={localConfig.background?.value || "#f8f9fa"}
                          onChange={handleConfigChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="table-card p-4 shadow-sm">
                    <h5 className="mb-4">Tipografi</h5>
                    <div className="mb-3">
                      <label className="form-label">Pilih Font Global</label>
                      <Select
                        options={fontOptions}
                        isLoading={isLoadingFonts}
                        value={fontOptions.find(
                          (opt) =>
                            opt.value === localConfig.typography?.fontFamily
                        )}
                        onChange={handleFontChange}
                        placeholder="Cari atau pilih font..."
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label
                            htmlFor="displaySizeRange"
                            className="form-label"
                          >
                            Display Title:{" "}
                            <strong>{previewDisplaySize}px</strong>
                          </label>
                          <input
                            type="range"
                            className="form-range"
                            min="40"
                            max="72"
                            step="1"
                            id="displaySizeRange"
                            value={previewDisplaySize}
                            onChange={(e) => handleSizeChange(e, "display")}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="leadSizeRange" className="form-label">
                            Lead Paragraph: <strong>{previewLeadSize}px</strong>
                          </label>
                          <input
                            type="range"
                            className="form-range"
                            min="16"
                            max="24"
                            step="0.5"
                            id="leadSizeRange"
                            value={previewLeadSize}
                            onChange={(e) => handleSizeChange(e, "lead")}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="baseSizeRange" className="form-label">
                            Paragraf (Dasar):{" "}
                            <strong>{previewBaseSize}px</strong>
                          </label>
                          <input
                            type="range"
                            className="form-range"
                            min="14"
                            max="18"
                            step="0.5"
                            id="baseSizeRange"
                            value={previewBaseSize}
                            onChange={(e) => handleSizeChange(e, "base")}
                          />
                        </div>
                        <div className="mb-3">
                          <label
                            htmlFor="btnLgSizeRange"
                            className="form-label"
                          >
                            Tombol Besar: <strong>{previewBtnLgSize}px</strong>
                          </label>
                          <input
                            type="range"
                            className="form-range"
                            min="14"
                            max="20"
                            step="0.5"
                            id="btnLgSizeRange"
                            value={previewBtnLgSize}
                            onChange={(e) => handleSizeChange(e, "btnLg")}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 d-flex flex-column justify-content-around">
                        <div className="p-2 border rounded bg-light text-center">
                          <h1
                            className="display-4"
                            style={{
                              fontSize: `${previewDisplaySize / 16}rem`,
                              margin: 0,
                            }}
                          >
                            Title
                          </h1>
                        </div>
                        <div className="p-2 border rounded bg-light text-center">
                          <p
                            className="lead"
                            style={{
                              fontSize: `${previewLeadSize / 16}rem`,
                              margin: 0,
                            }}
                          >
                            Lead
                          </p>
                        </div>
                        <div className="p-2 border rounded bg-light text-center">
                          <p
                            style={{
                              fontSize: `${previewBaseSize}px`,
                              margin: 0,
                            }}
                          >
                            Paragraf
                          </p>
                        </div>
                        <div className="p-2 border rounded bg-light text-center">
                          <button
                            className="btn btn-lg btn-primary"
                            style={{ fontSize: `${previewBtnLgSize / 16}rem` }}
                          >
                            Button
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-card p-4 shadow-sm mt-4">
                <h5 className="mb-3">Pengaturan Ketersediaan Halaman</h5>
                <p className="small text-muted">
                  Pilih halaman mana saja yang harus aktif dan dapat diakses
                  oleh publik. Halaman yang tidak dipilih akan menampilkan
                  halaman perbaikan.
                </p>
                <Select
                  isMulti
                  name="pageStatus"
                  options={pageStatusOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedPageStatus}
                  onChange={handlePageSelectionChange}
                />
              </div>

              <div className="table-card p-4 shadow-sm mt-4">
                <h5 className="mb-3">Pengaturan Fitur</h5>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="enableTierSystem"
                    name="featureFlags.enableTierSystem"
                    checked={
                      localConfig.featureFlags?.enableTierSystem || false
                    }
                    onChange={handleConfigChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="enableTierSystem"
                  >
                    Aktifkan Sistem Tier (BASIC/PRO)
                  </label>
                  <div className="form-text mt-1">
                    Jika nonaktif, semua fitur terkait Tier (termasuk upgrade)
                    akan disembunyikan.
                  </div>
                </div>
                {localConfig.featureFlags?.enableTierSystem && (
                  <div className="form-check form-switch ms-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="enableProTierUpgrade"
                      name="featureFlags.enableProTierUpgrade"
                      checked={
                        localConfig.featureFlags?.enableProTierUpgrade || false
                      }
                      onChange={handleConfigChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="enableProTierUpgrade"
                    >
                      Aktifkan Fitur "Upgrade ke PRO" untuk Mitra
                    </label>
                    <div className="form-text mt-1">
                      Jika nonaktif, tombol dan halaman upgrade tidak akan
                      muncul di panel mitra.
                    </div>
                  </div>
                )}
              </div>
              <div className="row g-4 mt-2">
                <div className="col-12">
                  <div className="table-card p-4 shadow-sm">
                    <h5 className="mb-4 text-danger">
                      Zona Berbahaya - Alat Maintenance
                    </h5>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">Bersihkan Cache Aplikasi</h6>
                        <p className="small text-muted mb-2">
                          Menghapus semua data cache di Redis. Berguna jika ada
                          data lama yang tidak mau diperbarui.
                        </p>
                        <button
                          className="btn btn-warning"
                          onClick={handleClearCache}
                          disabled={isSaving}
                        >
                          <i className="fas fa-broom me-2"></i>Bersihkan Cache
                        </button>
                      </div>
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">Reset & Seed Ulang Database</h6>
                        <p className="small text-muted mb-2">
                          Menghapus SEMUA data dan mengembalikannya ke kondisi
                          awal sesuai seeder.
                        </p>
                        <button
                          className="btn btn-danger"
                          onClick={() => setShowResetModal(true)}
                          disabled={isSaving}
                        >
                          <i className="fas fa-power-off me-2"></i>Reset
                          Database
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="table-card p-3 shadow-sm">
              <h5 className="mb-3">Log Keamanan (100 Terbaru)</h5>
              <div className="table-responsive" style={{ maxHeight: "60vh" }}>
                <table className="table table-sm table-hover align-middle">
                  <thead
                    className="table-light"
                    style={{ position: "sticky", top: 0 }}
                  >
                    <tr>
                      <th>Waktu</th>
                      <th>Tipe Peristiwa</th>
                      <th>Alamat IP</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr>
                        <td colSpan="4" className="text-center p-5">
                          Memuat log...
                        </td>
                      </tr>
                    ) : securityLogs.length > 0 ? (
                      securityLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <small>
                              {new Date(log.createdAt).toLocaleString("id-ID")}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                log.eventType === "IP_BLOCKED"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {log.eventType}
                            </span>
                          </td>
                          <td>
                            <code>{log.ipAddress}</code>
                          </td>
                          <td>
                            <small>{log.details}</small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-5 text-muted">
                          Belum ada aktivitas keamanan yang tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="table-card p-3 shadow-sm">
              <h5 className="mb-3">Permintaan Persetujuan Tertunda</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>Pemohon</th>
                      <th>Tipe Aksi</th>
                      <th>Detail Permintaan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRequests ? (
                      <tr>
                        <td colSpan="5" className="text-center p-5">
                          Memuat permintaan...
                        </td>
                      </tr>
                    ) : approvalRequests.length > 0 ? (
                      approvalRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <small>
                              {new Date(req.createdAt).toLocaleString("id-ID")}
                            </small>
                          </td>
                          <td>
                            <span className="fw-bold">
                              {req.requestedBy.name}
                            </span>
                            <small className="d-block text-muted">
                              {req.requestedBy.email}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {req.actionType}
                            </span>
                          </td>
                          <td>
                            <pre className="mb-0" style={{ fontSize: "0.8em" }}>
                              <code>
                                {JSON.stringify(req.payload, null, 2)}
                              </code>
                            </pre>
                          </td>
                          <td>
                            <div className="btn-group">
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-5 text-muted">
                          Tidak ada permintaan persetujuan yang tertunda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              {loadingPaymentConfig ? (
                <p>Memuat konfigurasi pembayaran...</p>
              ) : (
                <div className="table-card p-4 shadow-sm">
                  <h5 className="mb-4">Pengaturan Payment Gateway</h5>
                  <div className="alert alert-info small">
                    <i className="fas fa-info-circle me-2"></i>
                    Kunci API (Server Key & Client Key) dikelola secara aman di
                    file <code>.env</code> di server dan tidak akan pernah
                    ditampilkan di sini. Halaman ini hanya untuk mengelola
                    pengaturan operasional.
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Mode Operasional
                    </label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMode"
                        id="modeSandbox"
                        value="sandbox"
                        checked={paymentConfig.mode === "sandbox"}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            mode: e.target.value,
                          })
                        }
                      />
                      <label className="form-check-label" htmlFor="modeSandbox">
                        Sandbox (Untuk Pengujian)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMode"
                        id="modeProduction"
                        value="production"
                        checked={paymentConfig.mode === "production"}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            mode: e.target.value,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="modeProduction"
                      >
                        Production (Live/Nyata)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showResetModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">
                    Konfirmasi Aksi Berbahaya
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowResetModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Anda akan **menghapus seluruh data** di database dan
                    mengembalikannya ke kondisi awal. Aksi ini tidak dapat
                    diurungkan.
                  </p>
                  <p>Untuk melanjutkan, ketik `RESET` di bawah ini:</p>
                  <input
                    type="text"
                    className="form-control"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowResetModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleResetDatabase}
                    disabled={resetConfirmText !== "RESET"}
                  >
                    Saya Mengerti, Reset Database
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default DeveloperDashboardPage;
