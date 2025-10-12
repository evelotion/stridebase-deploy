// File: client/src/pages/ForgotPasswordPage.jsx (Versi Desain Baru)

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { forgotPasswordUser } from "../services/apiService"; // Gunakan apiService

const ForgotPasswordPage = ({ showMessage, theme }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const imageUrl =
    theme?.authPageTheme?.sidebarImageUrl ||
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2612&auto=format&fit=crop";

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordUser({ email });
      showMessage(
        "Jika email terdaftar, kami telah mengirimkan link untuk reset password.",
        "Success"
      );
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Lupa Password | StrideBase</title>
      </Helmet>
      <div className="row g-0 vh-100">
        {/* Kolom Kiri: Gambar Branding */}
        <div
          className="col-lg-7 d-none d-lg-flex auth-image-panel"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="auth-image-overlay">
            <h1 className="display-4 fw-bold text-white">Jangan Panik.</h1>
            <p className="lead text-white-75">
              Kami akan membantu Anda mendapatkan kembali akses ke akun Anda.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="col-lg-5 d-flex align-items-center justify-content-center auth-form-panel">
          <div className="auth-form-container">
            <div className="text-center mb-5">
              <h3 className="fw-bold">Lupa Password Anda?</h3>
              <p className="text-muted">
                Masukkan email Anda, kami akan kirimkan tautan untuk mengatur
                ulang password.
              </p>
            </div>
            <form onSubmit={submitHandler}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Alamat Email</label>
              </div>

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-dark btn-lg"
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Tautan Reset"}
                </button>
              </div>
              <p className="text-center mt-4">
                Ingat password Anda? <Link to="/login">Kembali ke Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tambahkan fungsi baru ini ke dalam apiService.js jika belum ada
// export const forgotPasswordUser = (data) => apiRequest('/api/auth/forgot-password', 'POST', data);

export default ForgotPasswordPage;