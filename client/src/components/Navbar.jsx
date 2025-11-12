// File: client/src/components/Navbar.jsx (LENGKAP dengan deteksi scroll)

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { formatRupiah } from "../utils/formatRupiah";

const Navbar = ({ user, handleLogout, theme, notifications, unreadCount }) => {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const navigate = useNavigate();

  // 1. State & Effect untuk Scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set 'isScrolled' true jika scroll lebih dari 10px
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Tambah event listener saat komponen di-mount
    window.addEventListener("scroll", handleScroll);

    // Cleanup function untuk remove listener saat komponen di-unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Array dependensi kosong agar effect ini hanya berjalan sekali (saat mount)
  // --- AKHIR TAMBAHAN BARU ---

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleLogoutAndClose = () => {
    handleLogout();
    closeOffcanvas();
  };

  // Logika untuk tombol kanan
  const renderRightSideButton = () => {
    if (!user) {
      return (
        <Link
          to="/login"
          className="btn btn-primary btn-sm ms-2" // Ini akan ikut tema
          onClick={closeOffcanvas}
        >
          Login
        </Link>
      );
    }
    if (user.role === "developer") {
      return (
        <Link
          to="/developer/dashboard"
          className="btn btn-primary btn-sm ms-2" // Ini akan ikut tema
          onClick={closeOffcanvas}
        >
          <i className="fas fa-crown me-2"></i>DS Developer
        </Link>
      );
    }
    if (user.role === "admin") {
      return (
        <Link
          to="/admin/dashboard"
          className="btn btn-primary btn-sm ms-2" // Ini akan ikut tema
          onClick={closeOffcanvas}
        >
          <i className="fas fa-user-shield me-2"></i>Admin
        </Link>
      );
    }
    if (user.role === "mitra") {
      return (
        <Link
          to="/partner/dashboard"
          className="btn btn-primary btn-sm ms-2" // Ini akan ikut tema
          onClick={closeOffcanvas}
        >
          <i className="fas fa-store me-2"></i>Toko Saya
        </Link>
      );
    }
    // Default untuk 'user'
    return (
      <Link
        to="/dashboard"
        className="btn btn-primary btn-sm ms-2" // Ini akan ikut tema
        onClick={closeOffcanvas}
      >
        <i className="fas fa-tachometer-alt me-2"></i>Dashboard
      </Link>
    );
  };

  return (
    // 2. MODIFIKASI className
    <nav
      className={`navbar navbar-expand-lg sticky-top ${
        isScrolled ? "navbar-scrolled" : "navbar-top"
      }`}
      style={{
        "--primary-color": theme?.primaryColor || "#e5446a",
        "--secondary-color": theme?.secondaryColor || "#f0f0f0",
      }}
    >
      <div className="container">
        <Link
          className="navbar-brand"
          to="/"
          style={{
            fontFamily: theme?.fontFamily || "Inter, sans-serif",
            fontSize: theme?.fontSize || "1.5rem",
          }}
        >
          {theme?.branding?.logoUrl ? (
            <img
              src={theme.branding.logoUrl}
              alt="Logo"
              style={{ maxHeight: "40px" }}
            />
          ) : (
            <span>{theme?.branding?.siteName || "StrideBase"}</span>
          )}
        </Link>

        {/* Tombol Toggler untuk Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOffcanvasOpen(!isOffcanvasOpen)}
          aria-controls="offcanvasNavbar"
          aria-expanded={isOffcanvasOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Konten Offcanvas untuk Mobile */}
        <div
          className={`offcanvas offcanvas-end ${isOffcanvasOpen ? "show" : ""}`}
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          style={{ visibility: isOffcanvasOpen ? "visible" : "hidden" }}
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              {theme?.branding?.siteName || "StrideBase"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeOffcanvas}
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" onClick={closeOffcanvas}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/store"
                  onClick={closeOffcanvas}
                >
                  Store
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/about"
                  onClick={closeOffcanvas}
                >
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/contact"
                  onClick={closeOffcanvas}
                >
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* Bagian Kanan Navbar (di dalam offcanvas) */}
            <hr className="d-lg-none" />
            <div className="d-flex align-items-center">
              {user && (
                <>
                  {/* ... (Notifikasi dan Avatar untuk Offcanvas) ... */}
                  {/* Jika Anda memiliki notifikasi/avatar di sini, salin dari 
                      bagian "d-none d-lg-flex" di bawah */}
                </>
              )}
              {renderRightSideButton()}
            </div>
          </div>
        </div>

        {/* Bagian Kanan Navbar (hanya Desktop) */}
        <div className="d-none d-lg-flex align-items-center">
          {user && (
            <>
              {/* Notifikasi Bell */}
              <div className="dropdown">
                <button
                  className="btn btn-icon" // (Akan di-style oleh CSS baru)
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-custom"
                  style={{ width: "300px" }}
                >
                  {/* Konten dropdown notifikasi (pastikan Anda punya isinya) */}
                  <li className="p-2 border-bottom">
                    <h6 className="mb-0">Notifikasi</h6>
                  </li>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <li key={notif.id}>
                          <Link
                            to={notif.linkUrl || "#"}
                            className="dropdown-item text-wrap"
                          >
                            <small>{notif.message}</small>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {new Date(notif.createdAt).toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-center text-muted small">
                        Tidak ada notifikasi baru.
                      </li>
                    )}
                  </div>
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>
                  <li>
                    <Link
                      to="/notifications"
                      className="dropdown-item text-center small"
                    >
                      Lihat Semua Notifikasi
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Avatar Pengguna */}
              <div className="dropdown">
                <button
                  className="btn btn-icon"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={
                      user.profilePictureUrl || "/user-avatar-placeholder.png"
                    }
                    alt="User"
                    className="user-avatar-sm"
                    onError={(e) => {
                      e.currentTarget.src = "https://i.pravatar.cc/40";
                    }}
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom">
                  {/* Konten dropdown pengguna (pastikan Anda punya isinya) */}
                  {user.role === "developer" && (
                    <li>
                      <Link to="/developer/dashboard" className="dropdown-item">
                        <i className="fas fa-crown fa-fw me-2"></i>SuperUser
                        Panel
                      </Link>
                    </li>
                  )}
                  {/* ... (Role lainnya jika ada) ... */}
                  <li>
                    <Link to="/dashboard" className="dropdown-item">
                      <i className="fas fa-tachometer-alt fa-fw me-2"></i>
                      Dashboard Pengguna
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item dropdown-item-danger"
                    >
                      <i className="fas fa-sign-out-alt fa-fw me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Tombol Dinamis Kanan */}
          {renderRightSideButton()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
