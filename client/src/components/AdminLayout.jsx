import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
    <div className="d-flex" id="wrapper">
      {/* --- Sidebar untuk Desktop (d-none d-lg-flex) --- */}
      <aside id="sidebar-wrapper" className="d-none d-lg-flex">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/admin/dashboard">
            <span className="fs-5">StrideBase Admin</span>
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
            <NavLink to="/admin/dashboard" className="nav-link-admin">
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/stores" className="nav-link-admin">
              <i className="fas fa-store me-2"></i>Manajemen Toko
            </NavLink>
          </li>
          {/* 👇 BARIS BARU DITAMBAHKAN DI SINI 👇 */}
          <li className="list-group-item">
            <NavLink to="/admin/payouts" className="nav-link-admin">
              <i className="fas fa-hand-holding-usd me-2"></i>Penarikan Dana
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/users" className="nav-link-admin">
              <i className="fas fa-users me-2"></i>Manajemen Pengguna
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/reviews" className="nav-link-admin">
              <i className="fas fa-star me-2"></i>Manajemen Ulasan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/bookings" className="nav-link-admin">
              <i className="fas fa-receipt me-2"></i>Semua Pesanan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/promos" className="nav-link-admin">
              <i className="fas fa-tags me-2"></i>Manajemen Promo
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/banners" className="nav-link-admin">
              <i className="fas fa-images me-2"></i>Manajemen Banner
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/reports" className="nav-link-admin">
              <i className="fas fa-chart-line me-2"></i>Laporan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/admin/settings" className="nav-link-admin">
              <i className="fas fa-cogs me-2"></i>Pengaturan
            </NavLink>
          </li>
          {user && user.role === "developer" && (
            <li className="list-group-item">
              <NavLink
                to="/developer/dashboard"
                className="nav-link-admin text-info"
              >
                <i className="fas fa-code me-2"></i>Developer Panel
              </NavLink>
            </li>
          )}
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
        {/* --- Header Mobile Baru (d-lg-none) --- */}
        <nav className="navbar navbar-light bg-light border-bottom d-lg-none admin-mobile-nav">
          <div className="container-fluid">
            <div className="dropdown">
              <button
                className="btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-bars"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <NavLink className="dropdown-item" to="/admin/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/stores">
                    Manajemen Toko
                  </NavLink>
                </li>
                {/* 👇 BARIS BARU DITAMBAHKAN DI SINI 👇 */}
                <li>
                  <NavLink className="dropdown-item" to="/admin/payouts">
                    Penarikan Dana
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/users">
                    Manajemen Pengguna
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/reviews">
                    Manajemen Ulasan
                  </NavLink>
                </li>
                 <li>
                  <NavLink className="dropdown-item" to="/admin/bookings">
                    Semua Pesanan
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/promos">
                    Manajemen Promo
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/banners">
                    Manajemen Banner
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/reports">
                    Laporan
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/admin/settings">
                    Pengaturan
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/">
                    Kembali ke Situs
                  </NavLink>
                </li>
              </ul>
            </div>
            <span className="navbar-brand mb-0 h1">Admin Panel</span>
            <a href="#" onClick={handleLogout} className="btn text-danger">
              <i className="fas fa-sign-out-alt"></i>
            </a>
          </div>
        </nav>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;