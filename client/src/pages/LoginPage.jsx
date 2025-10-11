// File: client/src/pages/LoginPage.jsx (Final dengan Tombol Google)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API_BASE_URL from "../apiConfig";

const LoginPage = ({ showMessage, theme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const brandName = theme?.branding?.brandName || "StrideBase";
  const brandLogo = theme?.branding?.logoUrl;
  const authPageTheme = theme?.authPageTheme || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showMessage("Login berhasil!", "Sukses");
        if (data.user.role === "admin" || data.user.role === "developer") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "mitra") {
          navigate("/partner/dashboard");
        } else {
          navigate("/dashboard");
        }
        window.location.reload();
      } else {
        showMessage(data.message || "Email atau password salah.", "Error");
      }
    } catch (error) {
      showMessage("Terjadi kesalahan pada server. Coba lagi nanti.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Arahkan pengguna ke endpoint backend untuk memulai otentikasi Google
    window.location.href = `${API_BASE_URL}/api/auth/google`;
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
        <title>{`Login - ${brandName}`}</title>
      </Helmet>
      <div className="auth-container">
        <div className="auth-card">
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
              {authPageTheme.title || `Selamat Datang Kembali di ${brandName}`}
            </h3>
            <p>
              {authPageTheme.description ||
                "Platform manajemen terbaik untuk bisnis Anda. Masuk untuk melanjutkan."}
            </p>
          </div>
          <div className="col-12 col-md-7 auth-form-container">
            <div className="text-center text-md-start mb-4">
              <h2>Login</h2>
              <p className="text-muted">
                Masuk untuk melanjutkan ke akun Anda.
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
                  placeholder="contoh@email.com"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password Anda"
                />
              </div>
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Login"}
                </button>
              </div>
            </form>

            {/* --- PEMISAH DAN TOMBOL GOOGLE --- */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted">atau</span>
              <hr className="flex-grow-1" />
            </div>

            <div className="d-grid">
              <button
                onClick={handleGoogleLogin}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-google me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.25C2.898 7.426 2.5 8.95 2.5 10.5c0 1.55.398 3.074 1.008 4.25h.001c.632 1.841 2.405 3.25 4.492 3.25 1.745 0 3.218-.74 4.23-1.927h-.001l.001-.002z" />
                </svg>
                Lanjutkan dengan Google
              </button>
            </div>
            {/* --- AKHIR --- */}

            <div className="text-center mt-4">
              <p>
                <Link to="/forgot-password">Lupa Password?</Link>
              </p>
              <p className="text-muted">
                Belum punya akun? <Link to="/register">Daftar di sini</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
