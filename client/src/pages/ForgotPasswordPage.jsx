// File: client/src/pages/ForgotPasswordPage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API_BASE_URL from "../apiConfig";

const ForgotPasswordPage = ({ showMessage, theme }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const brandName = theme?.branding?.brandName || "StrideBase";
  const brandLogo = theme?.branding?.logoUrl;
  const authPageTheme = theme?.authPageTheme || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(
          "Jika email terdaftar, kami telah mengirimkan link reset password.",
          "Info"
        );
      } else {
        showMessage(data.message || "Gagal mengirim email.", "Error");
      }
    } catch (error) {
      showMessage("Terjadi kesalahan pada server.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarStyle = {
    backgroundColor: authPageTheme.sidebarColor || "var(--primary-color)",
    ...(authPageTheme.sidebarImageUrl && {
      backgroundImage: `url(${authPageTheme.sidebarImageUrl})`,
    }),
  };

  return (
    <>
      <Helmet>
        <title>{`Lupa Password - ${brandName}`}</title>
      </Helmet>
      <div className="auth-container">
        <div className="auth-card">
          {/* Kolom Kiri: Branding */}
          <div
            className="col-md-5 d-none d-md-flex auth-sidebar"
            style={sidebarStyle}
          >
            {brandLogo && (
              <img
                src={brandLogo}
                alt={`${brandName} Logo`}
                className="auth-sidebar-logo"
              />
            )}
            <h3>
              {authPageTheme.title || `Ada Kendala? ${brandName} Membantu`}
            </h3>
            <p>
              {authPageTheme.description ||
                "Masukkan email Anda untuk memulai proses reset password."}
            </p>
          </div>

          {/* Kolom Kanan: Form */}
          <div className="col-12 col-md-7 auth-form-container">
            <div className="text-center text-md-start mb-4">
              <h2>Reset Password</h2>
              <p className="text-muted">
                Masukkan email yang terhubung dengan akun Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Alamat Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                <Link to="/login">Kembali ke Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
