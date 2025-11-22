// File: client/src/components/Navbar.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

// --- HELPER AVATAR ---
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return "#6c757d";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#0d6efd",
    "#6f42c1",
    "#d63384",
    "#dc3545",
    "#fd7e14",
    "#198754",
    "#0dcaf0",
    "#20c997",
  ];
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

const UserAvatar = ({ name, size = 32 }) => {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: getAvatarColor(name),
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    color: "white",
    textTransform: "uppercase",
    fontSize: `${size / 2.2}px`,
    marginRight: size > 32 ? "0px" : "8px",
  };

  return (
    <div style={style} title={name}>
      {getInitials(name)}
    </div>
  );
};

const Navbar = ({
  theme,
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
  homePageTheme,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Deteksi Tema Homepage
  const isModernHome = location.pathname === "/" && homePageTheme === "modern";
  const isElevateHome =
    location.pathname === "/" && homePageTheme === "elevate";
  const isDynamicHome = isModernHome || isElevateHome;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (isDynamicHome) {
      handleScroll();
      window.addEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDynamicHome, location.pathname]);

  // --- LOGIKA KELAS CSS ---
  const getNavClassName = () => {
    const baseClasses =
      "navbar navbar-expand-lg d-none d-lg-flex fixed-top transition-all";

    // 1. MODERN THEME (Pink Style)
    if (isModernHome) {
      return `${baseClasses} navbar-dark ${isScrolled ? "shadow-sm" : ""}`;
    }

    // 2. ELEVATE THEME (Premium Dark Glass)
    if (isElevateHome) {
      // Gunakan 'navbar-dark' agar teks selalu putih/terang (cocok untuk background gelap/kaca)
      if (isScrolled) {
        return `${baseClasses} sb-navbar-glass navbar-dark`;
      } else {
        return `${baseClasses} sb-navbar-transparent navbar-dark`;
      }
    }

    // 3. DEFAULT (Halaman Lain - Putih Bersih)
    return `${baseClasses} navbar-light bg-white shadow-sm`;
  };

  const getNavStyle = () => {
    const transitionStyle = {
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    if (isModernHome) {
      if (isScrolled) {
        return {
          backgroundColor: "#e5446a",
          borderColor: "transparent",
          ...transitionStyle,
        };
      } else {
        return {
          backgroundColor: "transparent",
          border: "none",
          ...transitionStyle,
        };
      }
    }

    if (isElevateHome) {
      return { ...transitionStyle }; // Warna diatur via CSS Class (HomePageElevate.css)
    }

    return {};
  };

  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const handleOpenNotifications = async () => {
    if (unreadCount > 0) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/notifications/mark-read`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setUnreadCount(0);
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, readStatus: true }))
          );
        }
      } catch (error) {
        console.error("Gagal menandai notifikasi sebagai terbaca:", error);
      }
    }
  };

  const renderLogo = () => {
    if (theme?.branding?.logoUrl) {
      return (
        <img
          src={theme.branding.logoUrl}
          alt="Logo"
          style={{ maxHeight: "32px" }}
        />
      );
    }
    return <span className="fs-4 fw-bold">StrideBase</span>;
  };

  const renderMobileLogo = () => {
    if (theme?.branding?.logoUrl) {
      return <img src={theme.branding.logoUrl} alt="StrideBase Logo" />;
    }
    return <span>StrideBase</span>;
  };

  return (
    <>
      {/* NAVBAR DESKTOP */}
      <nav className={getNavClassName()} style={getNavStyle()}>
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            {renderLogo()}
          </Link>

          {/* LINKS MENU (Dipindah ke Kanan dengan ms-auto) */}
          <ul className="nav-menu-list list-unstyled d-flex mb-0 gap-4 ms-auto me-4 align-items-center">
            <li>
              <NavLink to="/" className="nav-link fw-500">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="nav-link fw-500">
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/store" className="nav-link fw-500">
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-link fw-500">
                Contact
              </NavLink>
            </li>
          </ul>

          {/* AUTH / USER ACTIONS */}
          <div id="navbarAuth" className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notification */}
                <div className="dropdown">
                  <button
                    className="btn btn-icon-only position-relative"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={handleOpenNotifications}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    <i className="fas fa-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">New alerts</span>
                      </span>
                    )}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end dropdown-menu-custom shadow-lg border-0"
                    style={{ width: "350px" }}
                  >
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

                {/* User Profile */}
                <div className="dropdown">
                  <button
                    className="btn d-flex align-items-center gap-2 p-1 pe-3 rounded-pill border-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "inherit",
                    }}
                  >
                    <UserAvatar name={user.name} size={32} />
                    <span className="fw-bold small d-none d-md-inline">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom shadow-lg border-0 mt-2">
                    {user.role === "developer" && (
                      <li>
                        <Link
                          to="/developer/dashboard"
                          className="dropdown-item"
                        >
                          <i className="fas fa-crown me-2"></i>SuperUser Panel
                        </Link>
                      </li>
                    )}
                    {user.role === "admin" && (
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item">
                          <i className="fas fa-user-shield me-2"></i>Admin Panel
                        </Link>
                      </li>
                    )}
                    {user.role === "mitra" && (
                      <li>
                        <Link to="/partner/dashboard" className="dropdown-item">
                          <i className="fas fa-store me-2"></i>Panel Toko Saya
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to="/dashboard" className="dropdown-item">
                        <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                        Pengguna
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-danger"
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      {!isHomePage && (
        <div className="mobile-header d-lg-none">
          <div className="mobile-logo-container">
            <Link className="navbar-brand" to="/">
              {renderMobileLogo()}
            </Link>
          </div>
          <div className="mobile-user-container">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-user-profile"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <UserAvatar name={user.name} size={40} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  {user.role === "developer" && (
                    <li>
                      <Link to="/developer/dashboard" className="dropdown-item">
                        SuperUser
                      </Link>
                    </li>
                  )}
                  {user.role === "admin" && (
                    <li>
                      <Link to="/admin/dashboard" className="dropdown-item">
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  {user.role === "mitra" && (
                    <li>
                      <Link to="/partner/dashboard" className="dropdown-item">
                        Toko Saya
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm rounded-pill">
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-bottom-nav d-lg-none">
        <NavLink to="/" className="nav-link">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </NavLink>
        <NavLink to="/store" className="nav-link">
          <i className="fas fa-store"></i>
          <span>Store</span>
        </NavLink>
        <NavLink to="/contact" className="nav-link">
          <i className="fas fa-comments"></i>
          <span>Contact</span>
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          <i className="fas fa-user"></i>
          <span>Akun</span>
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
