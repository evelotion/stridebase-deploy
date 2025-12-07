// File: client/src/pages/PartnerSettingsPage.jsx

import React from "react";
import { Fade } from "react-awesome-reveal";
import { useNavigate } from "react-router-dom";
import "../pages/PartnerElevate.css";

const PartnerSettingsPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi mitra?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  /* =========================================
     RENDER: MOBILE VIEW (PARTNER SETTINGS)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      <div
        className="sticky-top px-3 py-3"
        style={{ background: "var(--pe-bg)", zIndex: 1020 }}
      >
        <h2 className="pe-title mb-0 fs-4">Pengaturan</h2>
      </div>

      <div className="px-3">
        {/* 1. Store Profile */}
        <div className="pe-card p-3 mb-4 d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center bg-dark border border-secondary"
            style={{ width: 60, height: 60 }}
          >
            <i className="fas fa-store text-white fs-3"></i>
          </div>
          <div className="flex-grow-1">
            <h5 className="mb-0 fw-bold">Toko {user?.name}</h5>
            <small className="text-muted">Mitra Resmi</small>
          </div>
          <button className="btn btn-sm btn-outline-secondary rounded-circle">
            <i className="fas fa-camera small"></i>
          </button>
        </div>

        {/* 2. Operational Settings */}
        <h6 className="text-muted small fw-bold mb-2 ps-2 text-uppercase tracking-widest">
          Operasional
        </h6>
        <div
          className="pe-card p-0 mb-4 overflow-hidden"
          style={{ borderRadius: "16px" }}
        >
          <div className="list-group list-group-flush">
            <button className="list-group-item bg-transparent text-white border-bottom border-secondary border-opacity-10 py-3 d-flex justify-content-between align-items-center w-100 text-start">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(59, 130, 246, 0.15)",
                  }}
                >
                  <i className="fas fa-clock text-info small"></i>
                </div>
                <span style={{ fontSize: "0.95rem" }}>Jam Operasional</span>
              </div>
              <i className="fas fa-chevron-right text-muted small opacity-50"></i>
            </button>
            <button className="list-group-item bg-transparent text-white border-0 py-3 d-flex justify-content-between align-items-center w-100 text-start">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(245, 158, 11, 0.15)",
                  }}
                >
                  <i className="fas fa-map-marker-alt text-warning small"></i>
                </div>
                <span style={{ fontSize: "0.95rem" }}>Alamat Toko</span>
              </div>
              <i className="fas fa-chevron-right text-muted small opacity-50"></i>
            </button>
          </div>
        </div>

        {/* 3. Financial Settings */}
        <h6 className="text-muted small fw-bold mb-2 ps-2 text-uppercase tracking-widest">
          Keuangan
        </h6>
        <div
          className="pe-card p-0 mb-4 overflow-hidden"
          style={{ borderRadius: "16px" }}
        >
          <div className="list-group list-group-flush">
            <button className="list-group-item bg-transparent text-white border-0 py-3 d-flex justify-content-between align-items-center w-100 text-start">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(16, 185, 129, 0.15)",
                  }}
                >
                  <i className="fas fa-university text-success small"></i>
                </div>
                <span style={{ fontSize: "0.95rem" }}>Rekening Bank</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">BCA •••889</span>
                <i className="fas fa-chevron-right text-muted small opacity-50"></i>
              </div>
            </button>
          </div>
        </div>

        <button
          className="btn btn-outline-danger w-100 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2 mb-4"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i> Keluar Aplikasi
        </button>
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <Fade direction="down" triggerOnce>
        <div className="mb-4">
          <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
            Konfigurasi
          </h6>
          <h2 className="pe-title mb-0">Pengaturan Toko</h2>
        </div>
      </Fade>
      <div className="pe-card p-5 text-center">
        <i className="fas fa-cogs fa-3x text-muted mb-3"></i>
        <h5>Pengaturan Desktop</h5>
        <p className="text-muted">
          Silakan gunakan aplikasi mobile untuk pengaturan yang lebih lengkap.
        </p>
      </div>
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-1"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default PartnerSettingsPage;
