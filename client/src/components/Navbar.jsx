// File: client/src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"; // <--- TAMBAH useLocation
import API_BASE_URL from "../apiConfig";

// --- Helper Avatar ---
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
  ];
  return colors[Math.abs(hash % colors.length)];
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
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation(); // <--- INISIALISASI LOCATION
  const [isScrolled, setIsScrolled] = useState(false);

  // State Desktop
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // State Mobile
  const [showMobileProfileMenu, setShowMobileProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const mobileProfileRef = useRef(null);

  // Logika Scroll Global
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle klik di luar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotifMenu(false);
      if (
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target)
      )
        setShowMobileProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const handleOpenNotifications = async () => {
    setShowNotifMenu(!showNotifMenu);
    setShowProfileMenu(false);
    if (unreadCount > 0 && !showNotifMenu) {
      const token = localStorage.getItem("token");
      try {
        await fetch(`${API_BASE_URL}/api/users/notifications/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Gagal update notifikasi:", error);
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
    // FIX: Gunakan variabel warna teks navbar agar terlihat di Light Mode
    return (
      <span className="fs-4 fw-bold" style={{ color: "var(--nav-text-color)" }}>
        StrideBase
      </span>
    );
  };

  // --- KOMPONEN DROPDOWN MENU ---
  const UserDropdownMenu = ({ isMobile = false }) => (
    <ul
      className={`dropdown-menu dropdown-menu-end dropdown-menu-custom border-0 ${
        isMobile ? "mt-2" : "mt-2"
      } show`}
      style={{
        right: 0,
        backgroundColor: "var(--sb-card-bg)",
        borderColor: "var(--sb-card-border)",
        boxShadow: "var(--sb-card-shadow)",
        position: "absolute",
        minWidth: "200px",
        zIndex: 1050,
      }}
    >
      <li className="px-3 py-2 border-bottom border-secondary border-opacity-10">
        <span
          className="d-block fw-bold"
          style={{ color: "var(--sb-text-main)" }}
        >
          {user?.name}
        </span>
        <small
          className="text-muted"
          style={{ fontSize: "0.7rem", color: "var(--sb-text-muted)" }}
        >
          {user?.email}
        </small>
      </li>

      {user.role === "developer" && (
        <li>
          <Link
            to="/developer/dashboard"
            className="dropdown-item py-2"
            style={{ color: "var(--sb-text-main)" }}
          >
            <i className="fas fa-crown me-2 text-warning"></i>
            SuperUser Panel
          </Link>
        </li>
      )}

      {user.role === "admin" && (
        <li>
          <Link
            to="/admin/dashboard"
            className="dropdown-item py-2"
            style={{ color: "var(--sb-text-main)" }}
          >
            <i className="fas fa-user-shield me-2 text-primary"></i>
            Admin Panel
          </Link>
        </li>
      )}

      {user.role === "mitra" && (
        <li>
          <Link
            to="/partner/dashboard"
            className="dropdown-item py-2"
            style={{ color: "var(--sb-text-main)" }}
          >
            <i className="fas fa-store me-2 text-success"></i>
            Panel Toko
          </Link>
        </li>
      )}

      <li>
        <Link
          to="/dashboard"
          className="dropdown-item py-2"
          style={{ color: "var(--sb-text-main)" }}
        >
          <i className="fas fa-tachometer-alt me-2 text-secondary"></i>
          Dashboard User
        </Link>
      </li>

      <li>
        <hr
          className="dropdown-divider my-1"
          style={{ borderColor: "var(--sb-card-border)" }}
        />
      </li>

      <li>
        <button
          onClick={handleLogout}
          className="dropdown-item fw-bold py-2"
          style={{ color: "var(--sb-accent, #dc3545)" }}
        >
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </li>
    </ul>
  );

  // LOGIKA UTAMA PERBAIKAN:
  // 1. Cek apakah ini Homepage ("/")
  // 2. Jika Homepage DAN belum discroll, gunakan 'sb-navbar-transparent'
  // 3. Jika BUKAN Homepage, SELALU gunakan 'sb-navbar-glass' (agar aman di halaman putih)

  const isHomePage = location.pathname === "/";

  const navbarClass =
    isHomePage && !isScrolled
      ? "navbar navbar-expand-lg d-none d-lg-flex fixed-top transition-all sb-navbar-transparent"
      : "navbar navbar-expand-lg d-none d-lg-flex fixed-top transition-all sb-navbar-glass";

  // Helper style untuk link agar warnanya dinamis
  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "var(--pe-accent)" : "inherit", // Inherit agar mengikuti aturan CSS parent (Navbar)
    fontWeight: "500",
  });

  return (
    <>
      {/* NAVBAR DESKTOP */}
      <nav className={navbarClass}>
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            {renderLogo()}
          </Link>

          <ul className="nav-menu-list list-unstyled d-flex mb-0 gap-4 ms-auto me-4 align-items-center">
            <li>
              <NavLink to="/" className="nav-link" style={navLinkStyle}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="nav-link" style={navLinkStyle}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/store" className="nav-link" style={navLinkStyle}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-link" style={navLinkStyle}>
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notifikasi Dropdown */}
                <div className="dropdown" ref={notifRef}>
                  <button
                    className={`sb-btn-icon position-relative ${
                      showNotifMenu ? "show" : ""
                    }`}
                    type="button"
                    onClick={handleOpenNotifications}
                    style={{
                      color: "inherit", // Ikuti parent
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <i className="fas fa-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="sb-notification-badge"></span>
                    )}
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end dropdown-menu-custom border-0 ${
                      showNotifMenu ? "show" : ""
                    }`}
                    style={{
                      width: "350px",
                      right: 0,
                      backgroundColor: "var(--sb-card-bg)",
                      borderColor: "var(--sb-card-border)",
                      boxShadow: "var(--sb-card-shadow)",
                    }}
                  >
                    <li
                      className="p-2 border-bottom"
                      style={{ borderColor: "var(--sb-card-border)" }}
                    >
                      <h6
                        className="mb-0 ps-2"
                        style={{ color: "var(--sb-text-main)" }}
                      >
                        Notifikasi
                      </h6>
                    </li>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif) => (
                          <li key={notif.id}>
                            <Link
                              to={notif.linkUrl || "#"}
                              className="dropdown-item text-wrap py-2"
                              style={{
                                borderBottom: "1px solid var(--sb-card-border)",
                              }}
                            >
                              <small
                                className="d-block fw-bold"
                                style={{ color: "var(--sb-text-main)" }}
                              >
                                {notif.title || "Pesan Baru"}
                              </small>
                              <small
                                className="d-block"
                                style={{ color: "var(--sb-text-muted)" }}
                              >
                                {notif.message}
                              </small>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li
                          className="p-3 text-center small"
                          style={{ color: "var(--sb-text-muted)" }}
                        >
                          Tidak ada notifikasi baru.
                        </li>
                      )}
                    </div>
                    <li>
                      <hr
                        className="dropdown-divider my-1"
                        style={{ borderColor: "var(--sb-card-border)" }}
                      />
                    </li>
                    <li>
                      <Link
                        to="/notifications"
                        className="dropdown-item text-center small py-2"
                        style={{ color: "var(--sb-accent)", fontWeight: "600" }}
                      >
                        Lihat Semua
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Profile Dropdown Desktop */}
                <div className="dropdown" ref={profileRef}>
                  <button
                    className={`sb-btn-profile ${
                      showProfileMenu ? "show" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    style={{
                      color: "inherit", // Ikuti parent
                      display: "flex",
                      alignItems: "center",
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <UserAvatar name={user.name} size={32} />
                    <span className="sb-profile-name d-none d-md-inline ms-2">
                      {user.name.split(" ")[0]}
                    </span>
                    <i
                      className="fas fa-chevron-down ms-1"
                      style={{ fontSize: "0.7rem", opacity: 0.7 }}
                    ></i>
                  </button>
                  {showProfileMenu && <UserDropdownMenu />}
                </div>
              </>
            ) : (
              <Link to="/login" className="he-btn-navbar">
                <span>Login / Signup</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            )}

            <button
              className="navbar-toggler d-lg-none ms-2"
              type="button"
              data-bs-toggle="collapse"
              style={{ border: "none", color: "var(--nav-text-color)" }}
            >
              <i className="fas fa-bars fs-3"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER (FIXED) */}
      <div
        className="mobile-header d-lg-none"
        style={{
          backgroundColor: "var(--sb-card-bg)",
          borderBottom: "1px solid var(--sb-card-border)",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Link
          className="navbar-brand"
          to="/"
          style={{ color: "var(--sb-text-main)" }}
        >
          {renderLogo()}
        </Link>

        {user ? (
          <div className="position-relative" ref={mobileProfileRef}>
            <div
              onClick={() => setShowMobileProfileMenu(!showMobileProfileMenu)}
              style={{ cursor: "pointer" }}
            >
              <UserAvatar name={user.name} size={36} />
            </div>
            {showMobileProfileMenu && <UserDropdownMenu isMobile={true} />}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm rounded-pill">
            Login
          </Link>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div
        className="mobile-bottom-nav d-lg-none"
        style={{
          backgroundColor: "var(--sb-card-bg)",
          borderTop: "1px solid var(--sb-card-border)",
          position: "fixed",
          bottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0",
          zIndex: 1000,
        }}
      >
        <NavLink
          to="/"
          className="nav-link d-flex flex-column align-items-center"
          style={({ isActive }) => ({
            color: isActive ? "var(--sb-accent)" : "var(--sb-text-muted)",
            fontSize: "0.8rem",
          })}
        >
          <i className="fas fa-home mb-1" style={{ fontSize: "1.2rem" }}></i>
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/store"
          className="nav-link d-flex flex-column align-items-center"
          style={({ isActive }) => ({
            color: isActive ? "var(--sb-accent)" : "var(--sb-text-muted)",
            fontSize: "0.8rem",
          })}
        >
          <i className="fas fa-store mb-1" style={{ fontSize: "1.2rem" }}></i>
          <span>Services</span>
        </NavLink>

        <NavLink
          to={user ? "/dashboard" : "/login"}
          className="nav-link d-flex flex-column align-items-center"
          style={({ isActive }) => ({
            color: isActive ? "var(--sb-accent)" : "var(--sb-text-muted)",
            fontSize: "0.8rem",
          })}
        >
          <i
            className={`fas ${user ? "fa-user" : "fa-sign-in-alt"} mb-1`}
            style={{ fontSize: "1.2rem" }}
          ></i>
          <span>{user ? "Account" : "Login"}</span>
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
