// File: client/src/pages/ResetPasswordPage.jsx (Versi Desain Baru)

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { resetPasswordUser } from "../services/apiService"; // Gunakan apiService

const ResetPasswordPage = ({ showMessage, theme }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const imageUrl =
    theme?.authPageTheme?.sidebarImageUrl ||
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2574&auto=format&fit=crop";

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan konfirmasi tidak cocok.", "Error");
      return;
    }
    if (!token) {
      showMessage("Token tidak valid atau tidak ditemukan.", "Error");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordUser({ token, newPassword: password });
      showMessage(
        "Password berhasil direset! Silakan login dengan password baru Anda.",
        "Success"
      );
      navigate("/login");
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Atur Ulang Password | StrideBase</title>
      </Helmet>
      <div className="row g-0 vh-100">
        {/* Kolom Kiri: Gambar Branding */}
        <div
          className="col-lg-7 d-none d-lg-flex auth-image-panel"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="auth-image-overlay">
            <h1 className="display-4 fw-bold text-white">Satu Langkah Terakhir.</h1>
            <p className="lead text-white-75">
              Buat password baru yang kuat untuk mengamankan akun Anda.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="col-lg-5 d-flex align-items-center justify-content-center auth-form-panel">
          <div className="auth-form-container">
            <div className="text-center mb-5">
              <h3 className="fw-bold">Atur Password Baru</h3>
              <p className="text-muted">Masukkan password baru Anda di bawah ini.</p>
            </div>
            <form onSubmit={submitHandler}>
              <div className="form-floating mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-control"
                  placeholder="Password Baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password">Password Baru</label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              <div className="form-floating mb-4">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="form-control"
                  placeholder="Konfirmasi Password Baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-dark btn-lg"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tambahkan fungsi baru ini ke dalam apiService.js jika belum ada
// export const resetPasswordUser = (data) => apiRequest('/api/auth/reset-password', 'POST', data);

export default ResetPasswordPage;