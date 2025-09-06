import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin.css"; // Menggunakan CSS yang sama dengan admin untuk konsistensi

const PartnerLayout = ({ theme }) => {
  const navigate = useNavigate();

  // Menentukan apakah menu upgrade harus ditampilkan berdasarkan theme config
  const showUpgradeMenu =
    theme?.featureFlags?.enableTierSystem &&
    theme?.featureFlags?.enableProTierUpgrade;

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
          <NavLink className="navbar-brand" to="/partner/dashboard">
            <span className="fs-5">StrideBase Partner</span>
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
            <NavLink to="/partner/dashboard" className="nav-link-admin">
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </NavLink>
          </li>
          {showUpgradeMenu && (
            <li className="list-group-item">
              <NavLink
                to="/partner/upgrade"
                className="nav-link-admin text-info"
              >
                <i className="fas fa-crown me-2"></i>Upgrade ke PRO
              </NavLink>
            </li>
          )}
          <li className="list-group-item">
            <NavLink to="/partner/orders" className="nav-link-admin">
              <i className="fas fa-receipt me-2"></i>Pesanan Masuk
            </NavLink>
          </li>
          {/* 👇 BARIS BARU DITAMBAHKAN DI SINI 👇 */}
          <li className="list-group-item">
            <NavLink to="/partner/wallet" className="nav-link-admin">
              <i className="fas fa-wallet me-2"></i>Dompet & Penarikan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/reviews" className="nav-link-admin">
              <i className="fas fa-star me-2"></i>Ulasan Pelanggan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/promos" className="nav-link-admin">
              <i className="fas fa-tags me-2"></i>Manajemen Promo
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/services" className="nav-link-admin">
              <i className="fas fa-concierge-bell me-2"></i>Layanan Saya
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/settings" className="nav-link-admin">
              <i className="fas fa-cog me-2"></i>Pengaturan Toko
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
                  <NavLink className="dropdown-item" to="/partner/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                {showUpgradeMenu && (
                  <li>
                    <NavLink className="dropdown-item" to="/partner/upgrade">
                      Upgrade ke PRO
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink className="dropdown-item" to="/partner/orders">
                    Pesanan Masuk
                  </NavLink>
                </li>
                {/* 👇 BARIS BARU DITAMBAHKAN DI SINI 👇 */}
                <li>
                  <NavLink className="dropdown-item" to="/partner/wallet">
                    Dompet & Penarikan
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/partner/reviews">
                    Ulasan
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/partner/promos">
                    Promo
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/partner/services">
                    Layanan
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/partner/settings">
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
            <span className="navbar-brand mb-0 h1">Partner Panel</span>
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

export default PartnerLayout;
