// File: client/src/components/PartnerMobileBottomNav.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import "../pages/PartnerElevate.css";

const PartnerMobileBottomNav = () => {
  return (
    <div className="pe-mobile-dock d-lg-none">
      {/* 1. DASHBOARD */}
      <NavLink 
        to="/partner/dashboard" 
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-home pe-dock-icon"></i>
        <span className="pe-dock-label">Home</span>
      </NavLink>
      
      {/* 2. SERVICES */}
      <NavLink 
        to="/partner/services" 
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-box pe-dock-icon"></i>
        <span className="pe-dock-label">Layanan</span>
      </NavLink>

      {/* 3. CENTER FAB: ORDERS (Jantung Operasional) */}
      <div className="pe-dock-fab-wrapper">
         <NavLink to="/partner/orders" className="pe-dock-fab">
             <i className="fas fa-receipt"></i>
         </NavLink>
      </div>

      {/* 4. WALLET */}
      <NavLink 
        to="/partner/wallet" 
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-wallet pe-dock-icon"></i>
        <span className="pe-dock-label">Dompet</span>
      </NavLink>

      {/* 5. MENU (Settings) */}
      <NavLink 
        to="/partner/settings" 
        className={({ isActive }) => `pe-dock-item ${isActive ? "active" : ""}`}
      >
        <i className="fas fa-bars pe-dock-icon"></i>
        <span className="pe-dock-label">Menu</span>
      </NavLink>
    </div>
  );
};

export default PartnerMobileBottomNav;