
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/ElevateDashboard.css";

const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
 
  const user = JSON.parse(localStorage.getItem("user"));

  const isActive = (path) => currentPath === path ? "active" : "";

 
  let profileLink = "/login";
  if (user) {
    if (user.role === "mitra") profileLink = "/partner/dashboard";
    else if (user.role === "admin") profileLink = "/admin/dashboard";
    else profileLink = "/dashboard";
  }

  return (
    <div className="pe-mobile-bottom-nav d-lg-none">
      <Link to="/" className={`pe-nav-item ${isActive("/")}`}>
        <div className="pe-nav-icon"><i className="fas fa-home"></i></div>
        <span className="pe-nav-label">Home</span>
      </Link>

      <Link to="/store" className={`pe-nav-item ${isActive("/store")}`}>
        <div className="pe-nav-icon"><i className="fas fa-search"></i></div>
        <span className="pe-nav-label">Explore</span>
      </Link>

      {}
      <Link to={user ? "/dashboard" : "/login"} className={`pe-nav-item highlight`}>
        <div className="pe-nav-icon-float">
          <i className="fas fa-cube"></i>
        </div>
      </Link>

      <Link to="/notifications" className={`pe-nav-item ${isActive("/notifications")}`}>
        <div className="pe-nav-icon"><i className="fas fa-bell"></i></div>
        <span className="pe-nav-label">Notif</span>
      </Link>

      {}
      <Link to={profileLink} className={`pe-nav-item ${isActive(profileLink)}`}>
        <div className="pe-nav-icon">
          {}
          {user ? <i className="fas fa-user-circle"></i> : <i className="fas fa-user"></i>}
        </div>
        <span className="pe-nav-label">{user ? "Me" : "Login"}</span>
      </Link>
    </div>
  );
};

export default MobileBottomNav;