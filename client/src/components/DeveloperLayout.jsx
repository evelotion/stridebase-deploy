import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../admin.css"; // Kita gunakan CSS yang sama dengan admin

const DeveloperLayout = () => {
  return (
    <div className="d-flex" id="wrapper">
      <aside id="sidebar-wrapper">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/developer/dashboard">
            {/* Beri judul yang berbeda */}
            <span className="fs-5">👑 SuperUser Panel</span>
          </NavLink>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <NavLink to="/" className="nav-link-admin">
              <i className="fas fa-home me-2"></i>Kembali ke Situs
            </NavLink>
          </li>
          <hr className="m-0" />
          <li className="list-group-item">
            <NavLink to="/developer/dashboard" className="nav-link-admin">
              <i className="fas fa-cogs me-2"></i>Global Config
            </NavLink>
          </li>
          {/* Tambahkan menu lain di sini jika dibutuhkan nanti */}
        </ul>
      </aside>
      <main id="page-content-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default DeveloperLayout;
