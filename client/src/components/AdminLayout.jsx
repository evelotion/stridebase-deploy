// File: client/src/components/AdminLayout.jsx

import React, { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import AdminMobileBottomNav from "./AdminMobileBottomNav";
import "../admin.css";
import "../styles/ElevateDashboard.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // --- LOGIC TEMA ---
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("adminTheme");
    return saved === "light";
  });

  useEffect(() => {
    const wrapper = document.getElementById("admin-elevate-wrapper");
    if (wrapper) {
      wrapper.setAttribute("data-theme", isLightMode ? "light" : "dark");
    }
    localStorage.setItem("adminTheme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.substring(0, 2).toUpperCase();
  };

  // Helper: Menentukan Judul Halaman Mobile secara Dinamis
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/stores")) return "Store Manager";
    if (path.includes("/bookings")) return "Orders";
    if (path.includes("/users")) return "User Data";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/payouts")) return "Finance";
    if (path.includes("/reviews")) return "Reviews";
    if (path.includes("/reports")) return "Analytics";
    return "Admin Panel";
  };

  return (
    <div id="admin-elevate-wrapper" className="pe-layout-wrapper">
      {/* =======================
          DESKTOP SIDEBAR 
          (JANGAN DIUBAH - DESKTOP ONLY)
         ======================= */}
      <aside className="pe-sidebar">
        <NavLink className="pe-sidebar-brand" to="/admin/dashboard">
          <i className="fas fa-shield-alt text-primary me-2"></i>
          <span>
            StrideBase
            <span
              className="pe-subtitle ms-1 fw-normal"
              style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
            >
              ADMIN
            </span>
          </span>
        </NavLink>

        <div className="pe-sidebar-menu">
          <NavLink to="/" className="pe-nav-link mb-3" style={{ opacity: 0.7 }}>
            <i className="fas fa-arrow-left"></i> Back to Site
          </NavLink>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </NavLink>

          <NavLink
            to="/admin/stores"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-store"></i> Manajemen Toko
          </NavLink>

          <NavLink
            to="/admin/payouts"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-hand-holding-usd"></i> Penarikan Dana
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-users"></i> Pengguna
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-receipt"></i> Pesanan
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-star"></i> Ulasan
          </NavLink>

          <NavLink
            to="/admin/promos"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-tags"></i> Promo
          </NavLink>

          <NavLink
            to="/admin/banners"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-images"></i> Banner
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-chart-line"></i> Laporan
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-cogs"></i> Pengaturan
          </NavLink>

          {user && user.role === "developer" && (
            <NavLink
              to="/developer/dashboard"
              className={({ isActive }) =>
                `pe-nav-link ${isActive ? "active" : ""}`
              }
              style={{ color: "var(--pe-accent-dev)" }}
            >
              <i className="fas fa-code"></i> Developer Panel
            </NavLink>
          )}

          <a
            href="#"
            onClick={handleLogout}
            className="pe-nav-link mt-auto text-danger"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </aside>

      {/* =======================
          MAIN CONTENT AREA
         ======================= */}
      <main className="pe-main-content">
        {/* --- MOBILE HEADER BARU (APP STYLE) --- */}
        <nav className="pe-mobile-header d-lg-none">
          <div className="d-flex align-items-center gap-2">
            {/* Logo Kecil */}
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
              <i
                className="fas fa-shield-alt"
                style={{ fontSize: "0.9rem" }}
              ></i>
            </div>
            {/* Judul Halaman Dinamis */}
            <span className="pe-mobile-header-title">{getPageTitle()}</span>
          </div>

          <div className="d-flex align-items-center gap-3">
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

            {/* Avatar Profile (Dropdown) */}
            <div className="dropdown">
              <div
                className="d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg, var(--pe-accent), #8b5cf6)",
                  color: "#fff",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
                data-bs-toggle="dropdown"
              >
                {getInitials(user?.name)}
              </div>
              <ul
                className="dropdown-menu dropdown-menu-end dropdown-menu-custom border-0 shadow-lg mt-2"
                style={{
                  background: "var(--pe-card-bg)",
                  borderColor: "var(--pe-card-border)",
                }}
              >
                <li>
                  <h6 className="dropdown-header text-muted">
                    Admin: {user?.name}
                  </h6>
                </li>
                <li>
                  <Link className="dropdown-item" to="/">
                    Open Website
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider opacity-25" />
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-danger"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* --- DYNAMIC CONTENT --- */}
        <div style={{ minHeight: "100vh", position: "relative" }}>
<Outlet context={{ isLightMode, toggleTheme }} />
        </div>

        {/* --- MOBILE BOTTOM NAV (FLOATING DOCK) --- */}
        <AdminMobileBottomNav />

        {/* --- DESKTOP FLOATING THEME TOGGLE --- */}
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

export default AdminLayout;
