import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../admin.css";

const DeveloperLayout = ({ children, showMessage }) => {
  const { logout, config } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (showMessage) {
      showMessage("Anda telah berhasil logout.", "Success");
    }
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src={config?.branding?.logoUrl || "/vite.svg"}
            alt="Logo"
            className="sidebar-logo"
          />
        </div>
        {/* PERUBAHAN UTAMA: 
                  Tombol Logout dipindahkan dari 'sidebar-footer' ke dalam 'sidebar-nav' 
                  agar posisinya langsung di bawah menu lain.
                */}
        <nav className="sidebar-nav">
          <NavLink to="/developer/dashboard" className="sidebar-link" end>
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </NavLink>
          {/* Tautan Global Config sengaja dinonaktifkan karena sudah terintegrasi di Dashboard */}
          {/* <NavLink to="/developer/config" className="sidebar-link">
                        <i className="fas fa-cogs"></i>
                        <span>Global Config</span>
                    </NavLink> */}

          {/* Tombol Logout sekarang ada di sini */}
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
        {/* 'sidebar-footer' yang sebelumnya ada di sini, sekarang dihapus */}
      </div>
      <div className="main-content">
        <main>{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default DeveloperLayout;
