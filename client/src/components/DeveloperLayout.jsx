import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin.css";

const DeveloperLayout = () => {
  const navigate = useNavigate();

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
      {/* --- Sidebar untuk Desktop --- */}
      <aside id="sidebar-wrapper" className="d-none d-lg-flex">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/developer/dashboard">
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
        {/* --- Header Mobile Baru --- */}
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
                  <NavLink className="dropdown-item" to="/developer/dashboard">
                    Global Config
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
            <span className="navbar-brand mb-0 h1">SuperUser</span>
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

export default DeveloperLayout;
