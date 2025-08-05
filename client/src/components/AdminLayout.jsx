import React, { useState } from "react"; // Import useState
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  // State untuk mengontrol visibilitas sidebar di mobile
  const [isToggled, setIsToggled] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  };

  const handleToggleSidebar = () => {
    setIsToggled(!isToggled);
  };

  return (
    // Tambahkan class 'toggled' secara dinamis
    <div className={`d-flex ${isToggled ? "toggled" : ""}`} id="wrapper">
      <aside id="sidebar-wrapper">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/admin/dashboard">
            <span className="fs-5">StrideBase Admin</span>
          </NavLink>
        </div>
        {/* ... Isi ul (menu) tetap sama ... */}
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <NavLink to="/" className="nav-link-admin">
              <i className="fas fa-home me-2"></i>Kembali ke Situs
            </NavLink>
          </li>
          <hr className="m-0" />
          <li className="list-group-item">
            <NavLink to="/admin/dashboard" className="nav-link-admin">
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/bookings" className="nav-link-admin">
              <i className="fas fa-receipt me-2"></i>Bookings
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
            <NavLink to="/admin/reviews" className="nav-link-admin">
              <i className="fas fa-star me-2"></i>Reviews
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/banners" className="nav-link-admin">
              <i className="fas fa-images me-2"></i>Banners
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/promos" className="nav-link-admin">
              <i className="fas fa-tags me-2"></i>Promos
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/reports" className="nav-link-admin">
              <i className="fas fa-chart-line me-2"></i>Reports
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/settings" className="nav-link-admin">
              <i className="fas fa-cog me-2"></i>Settings
            </NavLink>
          </li>
          <li className="list-group-item logout mt-auto">
            <a
              href="#"
              onClick={handleLogout}
              className="nav-link-admin text-danger"
            >
              <i className="fas fa-sign-out-alt me-2"></i>Logout
            </a>
          </li>
        </ul>
      </aside>
      <main id="page-content-wrapper">
        {/* === HEADER MOBILE BARU DITAMBAHKAN DI SINI === */}
        <nav className="navbar navbar-light bg-light border-bottom d-lg-none admin-mobile-nav">
          <div className="container-fluid">
            <button className="btn" type="button" onClick={handleToggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <span className="navbar-brand mb-0 h1">Admin Panel</span>
          </div>
        </nav>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
