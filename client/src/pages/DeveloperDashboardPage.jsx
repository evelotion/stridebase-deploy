import React, { useState, useEffect } from "react";
import Select from "react-select";
import API_BASE_URL from "../apiConfig";

// Komponen helper
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
  const [previewBaseSize, setPreviewBaseSize] = useState(16);
  const [previewH1Size, setPreviewH1Size] = useState(48);
  const [previewButtonSize, setPreviewButtonSize] = useState(13.6);
  const [previewDisplaySize, setPreviewDisplaySize] = useState(56);
  const [previewLeadSize, setPreviewLeadSize] = useState(20);
  const [previewBtnLgSize, setPreviewBtnLgSize] = useState(16);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);

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

  useEffect(() => {
    const fetchFonts = async () => {
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
    const fetchUnverifiedUsers = async () => {
      setLoadingUnverified(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/superuser/unverified-users`,
          { headers }
        );
        if (!response.ok) throw new Error("Gagal mengambil daftar pengguna.");
        const data = await response.json();
        setUnverifiedUsers(data);
      } catch (err) {
        showMessage(err.message, "Error");
      } finally {
        setLoadingUnverified(false);
      }
    };

    if (activeTab === "theming") fetchHealthStatus();
    if (activeTab === "security") fetchSecurityLogs();
    if (activeTab === "approvals") fetchApprovalRequests();
    if (activeTab === "payment") fetchPaymentConfig();
    if (activeTab === "manualVerification") fetchUnverifiedUsers();
  }, [activeTab]);

  const handleManualVerify = async (userId, userName) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin memverifikasi akun untuk ${userName} secara manual?`
      )
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/superuser/users/${userId}/verify`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      showMessage(data.message);
      setUnverifiedUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      showMessage(err.message, "Error");
    }
  };

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
          {/* Tombol Simpan akan tetap relevan untuk tab Theming */}
          {activeTab === "theming" && (
            <button
              className="btn btn-primary d-none d-md-block" // Sembunyikan di mobile, karena tombol ada di dalam form
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan Tema"}
            </button>
          )}
        </div>

        {/* Tata Letak Baru: 2 Kolom */}
        <div className="row g-4 px-4">
          {/* Kolom Navigasi Kiri (Menu Vertikal) - Tampil di Desktop */}
          <div className="col-md-3 d-none d-md-block">
            <div className="table-card p-3 shadow-sm">
              <h6 className="fw-bold px-3 pt-2">Konfigurasi</h6>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "theming" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("theming")}
                >
                  Tampilan & Tema
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "payment" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("payment")}
                >
                  Pembayaran
                </button>
              </div>
              <hr />
              <h6 className="fw-bold px-3 pt-2">Manajemen</h6>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    activeTab === "approvals" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("approvals")}
                >
                  Pusat Persetujuan
                  {approvalRequests.length > 0 && (
                    <span className="badge bg-danger rounded-pill">
                      {approvalRequests.length}
                    </span>
                  )}
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "manualVerification" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("manualVerification")}
                >
                  Verifikasi Pengguna
                </button>
              </div>
              <hr />
              <h6 className="fw-bold px-3 pt-2">Sistem</h6>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "security" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  Monitoring & Log
                </button>
              </div>
            </div>
          </div>

          {/* Navigasi Dropdown untuk Mobile */}
          <div className="col-12 d-md-none">
            <select
              className="form-select form-select-lg"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <optgroup label="Konfigurasi">
                <option value="theming">Tampilan & Tema</option>
                <option value="payment">Pembayaran</option>
              </optgroup>
              <optgroup label="Manajemen">
                <option value="approvals">
                  Pusat Persetujuan ({approvalRequests.length})
                </option>
                <option value="manualVerification">Verifikasi Pengguna</option>
              </optgroup>
              <optgroup label="Sistem">
                <option value="security">Monitoring & Log</option>
              </optgroup>
            </select>
          </div>

          {/* Kolom Konten Kanan */}
          <div className="col-md-9">
            {/* Semua konten tab Anda yang sudah ada ditempatkan di sini */}
            {/* Contoh untuk satu tab, ulangi untuk tab lainnya */}
            {activeTab === "theming" && (
              // ... (kode untuk konten "Theming & Maintenance" Anda)
              // Letakkan semua div .col-12 dan .col-lg-6 yang berhubungan dengan theming di sini
              <div>Konten Theming & Maintenance...</div>
            )}
            {activeTab === "payment" && (
              // ... (kode untuk konten "Konfigurasi Pembayaran")
              <div>Konten Konfigurasi Pembayaran...</div>
            )}
            {activeTab === "approvals" && (
              // ... (kode untuk konten "Pusat Persetujuan")
              <div>Konten Pusat Persetujuan...</div>
            )}
            {activeTab === "manualVerification" && (
              // ... (kode untuk konten "Verifikasi Manual")
              <div>Konten Verifikasi Manual...</div>
            )}
            {activeTab === "security" && (
              // ... (kode untuk konten "Security & Monitoring")
              <div>Konten Security & Monitoring...</div>
            )}
          </div>
        </div>

        {/* Tombol Simpan untuk Mobile (ditempatkan di bawah agar mudah dijangkau) */}
        {activeTab === "theming" && (
          <div className="d-grid d-md-none p-4">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan Tema"}
            </button>
          </div>
        )}
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
