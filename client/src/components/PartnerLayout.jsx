// File: client/src/components/PartnerLayout.jsx

import React, { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import PartnerMobileBottomNav from "./PartnerMobileBottomNav"; // Import komponen baru
import "../styles/ElevateDashboard.css";
import "../pages/PartnerElevate.css";

const PartnerLayout = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // --- LOGIC TEMA ---
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("partnerTheme");
    return saved === "light";
  });

  useEffect(() => {
    const wrapper = document.getElementById("partner-elevate-wrapper");
    if (wrapper) {
      wrapper.setAttribute("data-theme", isLightMode ? "light" : "dark");
    }
    localStorage.setItem("partnerTheme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const showUpgradeMenu =
    theme?.featureFlags?.enableTierSystem &&
    theme?.featureFlags?.enableProTierUpgrade;

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  };

  // Helper: Judul Halaman Mobile Dinamis
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "Dashboard Mitra";
    if (path.includes("/orders")) return "Pesanan Masuk";
    if (path.includes("/services")) return "Layanan & Harga";
    if (path.includes("/wallet")) return "Saldo Dompet";
    if (path.includes("/settings")) return "Pengaturan Toko";
    if (path.includes("/reviews")) return "Ulasan Pelanggan";
    return "Partner Area";
  };

  const getInitials = (name) =>
    name ? name.substring(0, 2).toUpperCase() : "P";

  return (
    <div id="partner-elevate-wrapper" className="pe-layout-wrapper">
      {/* --- DESKTOP SIDEBAR (TETAP SAMA) --- */}
      <aside className="pe-sidebar">
        <NavLink className="pe-sidebar-brand" to="/partner/dashboard">
          <i className="fas fa-cube text-primary"></i>
          <span>
            StrideBase
            <span
              className="pe-subtitle ms-1 fw-normal"
              style={{ fontSize: "0.8rem" }}
            >
              Partner
            </span>
          </span>
        </NavLink>

        <div className="pe-sidebar-menu">
          <NavLink to="/" className="pe-nav-link mb-3" style={{ opacity: 0.7 }}>
            <i className="fas fa-arrow-left"></i> Back to Site
          </NavLink>

          <NavLink
            to="/partner/dashboard"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </NavLink>

          {showUpgradeMenu && (
            <NavLink
              to="/partner/upgrade"
              className={({ isActive }) =>
                `pe-nav-link upgrade-link ${isActive ? "active" : ""}`
              }
            >
              <i className="fas fa-crown"></i> Upgrade PRO
            </NavLink>
          )}

          <NavLink
            to="/partner/orders"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-receipt"></i> Orders
          </NavLink>

          <NavLink
            to="/partner/wallet"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-wallet"></i> Wallet
          </NavLink>

          <NavLink
            to="/partner/reviews"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-star"></i> Reviews
          </NavLink>

          <NavLink
            to="/partner/reports"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-chart-line"></i> Reports
          </NavLink>

          <NavLink
            to="/partner/promos"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-tags"></i> Promos
          </NavLink>

          <NavLink
            to="/partner/services"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-concierge-bell"></i> Services
          </NavLink>

          <NavLink
            to="/partner/settings"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-cog"></i> Settings
          </NavLink>

          <a
            href="#"
            onClick={handleLogout}
            className="pe-nav-link logout-link mt-auto"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="pe-main-content">
        {/* MOBILE HEADER BARU (APP STYLE) */}
        <nav className="pe-mobile-header d-lg-none">
          <div className="d-flex align-items-center gap-2">
            {/* Logo/Icon Kecil */}
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--pe-accent)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <i className="fas fa-store" style={{ fontSize: "0.9rem" }}></i>
            </div>
            {/* Judul Halaman Dinamis */}
            <span className="pe-title fs-6 fw-bold">{getPageTitle()}</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Mini */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm border-0 p-0"
              style={{ color: "var(--pe-text-muted)", fontSize: "1.1rem" }}
            >
              {isLightMode ? (
                <i className="fas fa-moon"></i>
              ) : (
                <i className="fas fa-sun"></i>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <div
                className="d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg, var(--pe-warning), #f59e0b)",
                  color: "#000",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
                data-bs-toggle="dropdown"
              >
                {getInitials(user?.name)}
              </div>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-adaptive mt-2">
                <li>
                  <h6 className="dropdown-header">Mitra: {user?.name}</h6>
                </li>
                <li>
                  <hr className="dropdown-divider opacity-25" />
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-danger"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div style={{ minHeight: "100vh", position: "relative" }}>
          <Outlet />
        </div>

        {/* FLOATING BOTTOM NAV (MOBILE) */}
        <PartnerMobileBottomNav />

        {/* FLOATING THEME BUTTON (DESKTOP) */}
        <button
          className="pe-theme-fab d-none d-lg-flex"
          onClick={toggleTheme}
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? (
            <i className="fas fa-moon"></i>
          ) : (
            <i className="fas fa-sun"></i>
          )}
        </button>
      </main>
    </div>
  );
};

export default PartnerLayout;
