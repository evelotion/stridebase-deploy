import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="fs-4">StrideBase</span>
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
          <div id="navbarAuth" className="ms-lg-3">
            {user ? (
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
