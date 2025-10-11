// File: client/src/pages/RegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API_BASE_URL from "../apiConfig";

const RegisterPage = ({ theme, showMessage }) => {
  const [name, setName] = useState("");
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        showMessage("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.", "Sukses");
        navigate("/login");
      } else {
        showMessage(data.message || "Registrasi gagal.", "Error");
      }
    } catch (error) {
      showMessage("Terjadi kesalahan pada server.", "Error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const sidebarStyle = {
    backgroundColor: authPageTheme.sidebarColor || 'var(--primary-color)',
    ...(authPageTheme.sidebarImageUrl && { backgroundImage: `url(${authPageTheme.sidebarImageUrl})` })
  };

  return (
    <>
      <Helmet>
        <title>{`Daftar - ${brandName}`}</title>
      </Helmet>
      <div className="auth-container">
        <div className="auth-card">
          {/* Kolom Kiri: Branding */}
          <div className="col-md-5 d-none d-md-flex auth-sidebar" style={sidebarStyle}>
            {brandLogo && <img src={brandLogo} alt={`${brandName} Logo`} className="auth-sidebar-logo"/>}
            <h3>{authPageTheme.title || `Bergabunglah dengan ${brandName}`}</h3>
            <p>{authPageTheme.description || 'Daftarkan diri Anda dan mulailah mengelola bisnis dengan lebih efisien.'}</p>
          </div>

          {/* Kolom Kanan: Form Register */}
          <div className="col-12 col-md-7 auth-form-container">
            <div className="text-center text-md-start mb-4">
              <h2>Buat Akun Baru</h2>
              <p className="text-muted">Isi form di bawah ini untuk mendaftar.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Alamat Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? "Mendaftar..." : "Daftar"}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Sudah punya akun? <Link to="/login">Login di sini</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;