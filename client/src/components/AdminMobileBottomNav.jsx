// File: client/src/components/AdminMobileBottomNav.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/ElevateDashboard.css"; // Pastikan CSS terimport

const AdminMobileBottomNav = () => {
  return (
    <div className="pe-mobile-dock d-lg-none">
      {/* 1. DASHBOARD (HOME) */}
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-compass pe-dock-icon"></i>
        <span className="pe-dock-label">Home</span>
      </NavLink>

      {/* 2. ORDERS (BOOKINGS) */}
      <NavLink
        to="/admin/bookings"
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-receipt pe-dock-icon"></i>
        <span className="pe-dock-label">Orders</span>
      </NavLink>

      {/* 3. CENTER FAB: STORES (Pusat Aksi) */}
      <div className="pe-dock-fab-wrapper">
        <NavLink to="/admin/stores" className="pe-dock-fab">
          <i className="fas fa-store"></i>
        </NavLink>
      </div>

      {/* 4. USERS */}
      <NavLink
        to="/admin/users"
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-user-friends pe-dock-icon"></i>
        <span className="pe-dock-label">Users</span>
      </NavLink>

      {/* 5. SETTINGS (MORE) */}
      <NavLink
        to="/admin/settings"
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-sliders-h pe-dock-icon"></i>
        <span className="pe-dock-label">Menu</span>
      </NavLink>
    </div>
  );
};

export default AdminMobileBottomNav;
