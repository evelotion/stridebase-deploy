import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../admin.css";

const AdminLayout = () => {
  return (
    <div className="d-flex" id="wrapper">
      <aside id="sidebar-wrapper">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/admin/dashboard">
            <span className="fs-5">StrideBase Admin</span>
          </NavLink>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <NavLink to="/admin/dashboard" className="nav-link-admin">
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/reports" className="nav-link-admin">
              <i className="fas fa-chart-line me-2"></i>Reports
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/stores" className="nav-link-admin">
              <i className="fas fa-store me-2"></i>Stores
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/users" className="nav-link-admin">
              <i className="fas fa-users me-2"></i>Users
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/promos" className="nav-link-admin">
              <i className="fas fa-tags me-2"></i>Promos
            </NavLink>
          </li>
          {/* --- TAMBAHKAN LINK BANNER DI SINI --- */}
          <li className="list-group-item">
            <NavLink to="/admin/banners" className="nav-link-admin">
              <i className="fas fa-images me-2"></i>Banners
            </NavLink>
          </li>
          {/* ------------------------------------- */}
          <li className="list-group-item logout mt-auto">
            <NavLink to="/" className="nav-link-admin">
              <i className="fas fa-sign-out-alt me-2"></i>Kembali ke Situs
            </NavLink>
          </li>
        </ul>
      </aside>
      <main id="page-content-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
