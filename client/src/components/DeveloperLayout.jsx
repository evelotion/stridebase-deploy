// File: client/src/components/DeveloperLayout.jsx

import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin.css";
import "../styles/ElevateDashboard.css";

const DeveloperLayout = () => {
  const navigate = useNavigate();

  // --- LOGIC TEMA (LIGHT/DARK) ---
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("devTheme");
    return saved === "light";
  });

  useEffect(() => {
    const wrapper = document.getElementById("dev-elevate-wrapper");
    if (wrapper) {
      wrapper.setAttribute("data-theme", isLightMode ? "light" : "dark");
    }
    localStorage.setItem("devTheme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div id="dev-elevate-wrapper" className="pe-layout-wrapper">
      {/* --- SIDEBAR DEVELOPER --- */}
      <aside
        className="pe-sidebar"
        style={{ borderRightColor: "var(--pe-accent-dev)" }}
      >
        <NavLink className="pe-sidebar-brand" to="/developer/dashboard">
          <i
            className="fas fa-crown me-2"
            style={{ color: "var(--pe-accent-dev)" }}
          ></i>
          <span>
            SuperUser
            <span
              className="pe-subtitle ms-1 fw-normal"
              style={{ fontSize: "0.7rem" }}
            >
              PANEL
            </span>
          </span>
        </NavLink>

        <div className="pe-sidebar-menu">
          <NavLink to="/" className="pe-nav-link mb-3" style={{ opacity: 0.7 }}>
            <i className="fas fa-arrow-left"></i> Back to Site
          </NavLink>

          <NavLink
            to="/developer/dashboard"
            className={({ isActive }) =>
              `pe-nav-link ${isActive ? "active" : ""}`
            }
          >
            <i className="fas fa-cogs"></i> Global Config
          </NavLink>

          {/* Anda bisa menambahkan menu developer lain di sini nanti */}

          <NavLink
            to="/admin/dashboard"
            className="pe-nav-link mt-3"
            style={{ color: "var(--pe-info)" }}
          >
            <i className="fas fa-user-shield"></i> Switch to Admin
          </NavLink>

          <a
            href="#"
            onClick={handleLogout}
            className="pe-nav-link mt-auto text-danger"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="pe-main-content">
        <nav className="pe-mobile-header d-lg-none">
          <NavLink className="pe-mobile-brand fs-5" to="/developer/dashboard">
            SuperUser Panel
          </NavLink>
          <div className="dropdown">
            <button
              className="btn btn-sm border-secondary pe-btn-action"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-bars"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-dark border-secondary">
              <li>
                <NavLink className="dropdown-item" to="/developer/dashboard">
                  Global Config
                </NavLink>
              </li>
              <li>
                <hr className="dropdown-divider border-secondary" />
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
        </nav>

        <Outlet />

        <button
          className="pe-theme-fab"
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{ borderColor: "var(--pe-accent-dev)" }}
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

export default DeveloperLayout;
