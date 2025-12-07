// File: client/src/pages/AdminSettingsPage.jsx

import React, { useState } from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../styles/ElevateDashboard.css";

const AdminSettingsPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Ambil fungsi toggleTheme & status isLightMode dari AdminLayout
  const { isLightMode, toggleTheme } = useOutletContext() || {};

  // State Lokal untuk Toggle
  const [settings, setSettings] = useState({
    pushNotif: true,
    emailNotif: false,
    biometric: false,
  });

  const toggleLocalSetting = (key) => {
    setSettings((prev) => {
      const newVal = !prev[key];
      if (showMessage)
        showMessage(
          `Pengaturan ${key} diubah: ${newVal ? "Aktif" : "Non-Aktif"}`,
          "Info"
        );
      return { ...prev, [key]: newVal };
    });
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi admin?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  /* --- KOMPONEN ITEM MENU (iOS Style Helper - Mobile) --- */
  const IOSMenuItem = ({
    icon,
    color,
    label,
    value,
    onClick,
    isToggle,
    toggleKey,
    toggleValue,
    isLast,
    isDestructive,
  }) => (
    <div
      className={`d-flex align-items-center px-3 py-3 ${
        !isLast ? "border-bottom" : ""
      }`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        backgroundColor: "var(--pe-card-bg)",
        borderColor: "var(--pe-card-border)",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center text-white me-3 flex-shrink-0"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: color,
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
        }}
      >
        <i className={`fas ${icon}`} style={{ fontSize: "0.9rem" }}></i>
      </div>
      <div className="flex-grow-1">
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 500,
            color: isDestructive ? "var(--pe-danger)" : "var(--pe-text-main)",
          }}
        >
          {label}
        </span>
      </div>
      <div>
        {isToggle ? (
          <div className="form-check form-switch m-0 min-h-0 d-flex align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              style={{ cursor: "pointer", width: "45px", height: "24px" }}
              checked={toggleValue}
              readOnly
            />
          </div>
        ) : (
          <div className="d-flex align-items-center">
            {value && (
              <span
                style={{
                  color: "var(--pe-text-muted)",
                  fontSize: "0.9rem",
                  marginRight: "8px",
                }}
              >
                {value}
              </span>
            )}
            <i
              className="fas fa-chevron-right"
              style={{
                color: "var(--pe-text-muted)",
                opacity: 0.5,
                fontSize: "0.8rem",
              }}
            ></i>
          </div>
        )}
      </div>
    </div>
  );

  /* =========================================
     RENDER: MOBILE VIEW (Refined iOS Style)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      <div
        className="sticky-top px-3 py-3"
        style={{ background: "var(--pe-bg)", zIndex: 1020 }}
      >
        <h2 className="pe-title mb-0 fs-4 fw-bold">Pengaturan</h2>
      </div>

      <div className="px-3 pt-1">
        {/* Profile Card */}
        <div
          className="pe-card p-3 mb-4 d-flex align-items-center gap-3 shadow-sm"
          style={{
            borderRadius: "16px",
            border: "1px solid var(--pe-card-border)",
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{
              width: 64,
              height: 64,
              fontSize: "1.5rem",
              background: "linear-gradient(135deg, var(--pe-accent), #4f46e5)",
            }}
          >
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <h5
              className="mb-0 fw-bold text-truncate"
              style={{ color: "var(--pe-text-main)" }}
            >
              {user?.name}
            </h5>
            <small
              className="d-block text-truncate"
              style={{ color: "var(--pe-text-muted)" }}
            >
              {user?.email}
            </small>
            <span
              className="badge mt-1"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                color: "var(--pe-accent)",
                fontSize: "0.65rem",
              }}
            >
              SUPER ADMIN
            </span>
          </div>
        </div>

        {/* Group: TAMPILAN */}
        <div className="mb-4">
          <small
            className="fw-bold ps-3 mb-2 d-block text-uppercase tracking-widest"
            style={{ fontSize: "0.7rem", color: "var(--pe-text-muted)" }}
          >
            Tampilan
          </small>
          <div
            className="overflow-hidden shadow-sm"
            style={{
              borderRadius: "14px",
              border: "1px solid var(--pe-card-border)",
            }}
          >
            <IOSMenuItem
              icon="fa-moon"
              color="#1f2937"
              label="Mode Gelap"
              isToggle={true}
              toggleValue={!isLightMode}
              onClick={toggleTheme}
            />
            <IOSMenuItem
              icon="fa-language"
              color="#3b82f6"
              label="Bahasa"
              value="Indonesia"
              isLast={true}
            />
          </div>
        </div>

        {/* Group: SISTEM */}
        <div className="mb-4">
          <small
            className="fw-bold ps-3 mb-2 d-block text-uppercase tracking-widest"
            style={{ fontSize: "0.7rem", color: "var(--pe-text-muted)" }}
          >
            Sistem
          </small>
          <div
            className="overflow-hidden shadow-sm"
            style={{
              borderRadius: "14px",
              border: "1px solid var(--pe-card-border)",
            }}
          >
            <IOSMenuItem
              icon="fa-bell"
              color="#ef4444"
              label="Notifikasi Push"
              isToggle={true}
              toggleValue={settings.pushNotif}
              onClick={() => toggleLocalSetting("pushNotif")}
            />
            <IOSMenuItem
              icon="fa-fingerprint"
              color="#8b5cf6"
              label="Biometrik / PIN"
              isToggle={true}
              toggleValue={settings.biometric}
              onClick={() => toggleLocalSetting("biometric")}
            />
            <IOSMenuItem
              icon="fa-users-cog"
              color="#10b981"
              label="Kelola Staf Admin"
              onClick={() => navigate("/admin/users")}
            />
            <IOSMenuItem
              icon="fa-store"
              color="#f59e0b"
              label="Konfigurasi Toko"
              onClick={() => navigate("/admin/stores")}
              isLast={true}
            />
          </div>
        </div>

        {/* Group: AKUN */}
        <div className="mb-4">
          <div
            className="overflow-hidden shadow-sm"
            style={{
              borderRadius: "14px",
              border: "1px solid var(--pe-card-border)",
            }}
          >
            <IOSMenuItem
              icon="fa-sign-out-alt"
              color="#ef4444"
              label="Keluar Aplikasi"
              isDestructive={true}
              onClick={handleLogout}
              isLast={true}
            />
          </div>
        </div>

        <div className="text-center pb-3">
          <small
            style={{
              color: "var(--pe-text-muted)",
              fontSize: "0.7rem",
              opacity: 0.7,
            }}
          >
            StrideBase Admin v1.0.3
          </small>
        </div>
      </div>
      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (FULL DASHBOARD STYLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <Fade direction="down" triggerOnce>
        <div className="mb-4">
          <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
            Konfigurasi
          </h6>
          <h2 className="pe-title mb-0">Pengaturan Sistem</h2>
        </div>
      </Fade>
      <Fade triggerOnce>
        <div className="row g-4">
          {/* Kolom Kiri: Pengaturan Umum */}
          <div className="col-md-6">
            <div className="pe-card p-4 h-100">
              <h5 className="mb-4 d-flex align-items-center gap-2">
                <div
                  className="bg-primary bg-opacity-10 text-primary rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                >
                  <i className="fas fa-sliders-h"></i>
                </div>
                Pengaturan Aplikasi
              </h5>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  className="form-control bg-transparent text-white border-secondary"
                  defaultValue="StrideBase"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">
                  Email Support
                </label>
                <input
                  type="email"
                  className="form-control bg-transparent text-white border-secondary"
                  defaultValue="admin@stridebase.com"
                />
              </div>

              <div className="d-flex align-items-center justify-content-between p-3 border border-secondary border-opacity-25 rounded-3 mb-3">
                <div>
                  <h6 className="mb-0 fw-bold">Mode Gelap</h6>
                  <small className="text-muted">
                    Aktifkan tema gelap untuk dashboard
                  </small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!isLightMode}
                    onChange={toggleTheme}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              <button className="pe-btn-action bg-primary text-white border-primary mt-2">
                Simpan Perubahan
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Keamanan & Akun */}
          <div className="col-md-6">
            <div className="pe-card p-4 h-100">
              <h5 className="mb-4 d-flex align-items-center gap-2">
                <div
                  className="bg-danger bg-opacity-10 text-danger rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                >
                  <i className="fas fa-shield-alt"></i>
                </div>
                Keamanan & Akses
              </h5>

              <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <small>
                  Tindakan di bawah ini bersifat sensitif dan akan mempengaruhi
                  seluruh pengguna.
                </small>
              </div>

              <div className="d-grid gap-3">
                <button className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center p-3">
                  <span>
                    <i className="fas fa-key me-2 text-warning"></i> Ganti
                    Password Global
                  </span>
                  <i className="fas fa-chevron-right small"></i>
                </button>
                <button className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center p-3">
                  <span>
                    <i className="fas fa-sign-out-alt me-2 text-danger"></i>{" "}
                    Force Logout All Users
                  </span>
                  <i className="fas fa-chevron-right small"></i>
                </button>
                <button className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center p-3">
                  <span>
                    <i className="fas fa-database me-2 text-info"></i> Backup
                    Database
                  </span>
                  <i className="fas fa-chevron-right small"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-0 py-0 position-relative z-1">
      <div className="pe-blob pe-blob-2"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default AdminSettingsPage;
