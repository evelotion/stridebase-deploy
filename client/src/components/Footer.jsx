// File: client/src/components/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="pt-5 pb-4 mt-auto position-relative overflow-hidden"
      style={{
        backgroundColor: "var(--pe-sidebar-bg)", // Ikuti warna sidebar/panel
        borderTop: "1px solid var(--pe-card-border)",
      }}
    >
      <div className="container">
        <div className="row g-5 justify-content-between">
          {/* Kolom 1: Brand */}
          <div className="col-lg-4 col-md-6">
            <div className="mb-4">
              <span
                className="h4 fw-bold text-uppercase d-block mb-3"
                style={{ color: "var(--pe-text-main)" }}
              >
                Stride<span style={{ color: "var(--pe-accent)" }}>Base</span>.
              </span>
              <p
                className="small lh-lg mb-4"
                style={{ color: "var(--pe-text-muted)", maxWidth: "300px" }}
              >
                Platform perawatan sepatu premium #1 di Indonesia. Presisi dalam
                setiap langkah.
              </p>
              <div className="d-flex gap-3 social-links">
                {/* Gunakan class pe-btn-action untuk tombol sosial agar konsisten */}
                <a href="#" className="pe-btn-action">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="pe-btn-action">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="pe-btn-action">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 2: Links */}
          <div className="col-lg-2 col-md-6">
            <h6
              className="text-uppercase fw-bold mb-4 ls-2"
              style={{ color: "var(--pe-text-main)" }}
            >
              Menu
            </h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link
                  to="/"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/store"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Services
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contact"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Legal */}
          <div className="col-lg-2 col-md-6">
            <h6
              className="text-uppercase fw-bold mb-4 ls-2"
              style={{ color: "var(--pe-text-main)" }}
            >
              Legal
            </h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link
                  to="/privacy-policy"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/terms-conditions"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Terms
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/faq"
                  className="text-decoration-none"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h6
              className="text-uppercase fw-bold mb-4 ls-2"
              style={{ color: "var(--pe-text-main)" }}
            >
              Updates
            </h6>
            <p className="small mb-3" style={{ color: "var(--pe-text-muted)" }}>
              Dapatkan info promo terbaru.
            </p>
            <form className="footer-form">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Email Address"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--pe-text-main)",
                    borderColor: "var(--pe-card-border)",
                  }}
                />
                <button
                  className="btn btn-sm"
                  type="button"
                  style={{ background: "var(--pe-accent)", color: "#fff" }}
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <hr className="my-5" style={{ borderColor: "var(--pe-card-border)" }} />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="small mb-0" style={{ color: "var(--pe-text-muted)" }}>
              &copy; {new Date().getFullYear()} StrideBase Inc.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="small mb-0" style={{ color: "var(--pe-text-muted)" }}>
              Elevate your{" "}
              <span style={{ color: "var(--pe-text-main)" }}>Steps</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
