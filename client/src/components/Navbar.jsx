import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

// Terima props baru terkait notifikasi
const Navbar = ({
  theme,
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

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
        const response = await fetch(`${API_BASE_URL}/api/user/notifications/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setUnreadCount(0);
          // Update status notifikasi di state lokal
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, readStatus: true }))
          );
        }
      } catch (error) {
        console.error("Gagal menandai notifikasi sebagai terbaca:", error);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/">
          {theme?.branding?.logoUrl ? (
            <img
              src={`${theme.branding.logoUrl}`}
              alt="StrideBase Logo"
              // --- UBAH BARIS INI ---
              style={{ maxHeight: "32px" }} // Dari "28px" menjadi "32px"
            />
          ) : (
            <span className="fs-4">StrideBase</span>
          )}
        </Link>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="nav-menu collapse navbar-collapse" id="navbarNav">
          <div className="d-lg-none d-flex justify-content-end w-100 p-3 pb-0">
            <button
              type="button"
              className="btn-close"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-label="Close"
            ></button>
          </div>
          <ul className="nav-menu-list list-unstyled d-flex mb-0 ms-auto">
            <li>
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="nav-link">
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/store" className="nav-link">
                Store
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-link">
                Contact
              </NavLink>
            </li>
          </ul>
          <div
            id="navbarAuth"
            className="ms-lg-3 d-flex align-items-center gap-2"
          >
            {user ? (
              <>
                {/* === LONCENG NOTIFIKASI BARU === */}
                <div className="dropdown">
                  <button
                    className="btn btn-light rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={handleOpenNotifications}
                    style={{
                      width: "40px",
                      height: "40px",
                      position: "relative",
                    }}
                  >
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                        <span className="visually-hidden">unread messages</span>
                      </span>
                    )}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end dropdown-menu-custom"
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
                {/* === AKHIR LONCENG NOTIFIKASI === */}

                <div className="dropdown">
                  <button
                    className="btn btn-dark dropdown-toggle btn-user-profile"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src="/user-avatar-placeholder.png"
                      alt="User"
                      className="user-avatar-sm me-2"
                      onError={(e) => {
                        e.currentTarget.src = "https://i.pravatar.cc/32";
                      }}
                    />
                    {user.name.split(" ")[0]}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom">
                    {user.role === "developer" && (
                      <li>
                        <Link
                          to="/developer/dashboard"
                          className="dropdown-item"
                        >
                          <i className="fas fa-crown fa-fw me-2"></i>
                          SuperUser Panel
                        </Link>
                      </li>
                    )}
                    {user.role === "admin" && (
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item">
                          <i className="fas fa-user-shield fa-fw me-2"></i>
                          Panel Admin
                        </Link>
                      </li>
                    )}
                    {user.role === "mitra" && (
                      <li>
                        <Link to="/partner/dashboard" className="dropdown-item">
                          <i className="fas fa-store fa-fw me-2"></i>
                          Panel Toko Saya
                        </Link>
                      </li>
                    )}
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
                        <i className="fas fa-sign-out-alt fa-fw me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-gradient">
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
