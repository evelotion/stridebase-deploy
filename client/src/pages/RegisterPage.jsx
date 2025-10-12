// File: client/src/pages/RegisterPage.jsx (Versi Desain Baru)

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { registerUser } from "../services/apiService"; // Menggunakan service yang sudah ada

const RegisterPage = ({ showMessage, theme }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Menggunakan gambar dari tema atau fallback yang berbeda dari login
  const registerImageUrl =
    theme?.authPageTheme?.sidebarImageUrl ||
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2612&auto=format&fit=crop";

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan konfirmasi password tidak cocok.", "Error");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      showMessage(
        "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
        "Success"
      );
      navigate(`/login?redirect=${redirect}`);
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  return (
    <div className="auth-container">
      <Helmet>
        <title>Buat Akun Baru | StrideBase</title>
      </Helmet>
      <div className="row g-0 vh-100">
        {/* Kolom Kiri: Gambar Branding */}
        <div
          className="col-lg-7 d-none d-lg-flex auth-image-panel"
          style={{ backgroundImage: `url(${registerImageUrl})` }}
        >
          <div className="auth-image-overlay">
            <h1 className="display-4 fw-bold text-white">
              Bergabunglah dengan Revolusi Perawatan Sepatu.
            </h1>
            <p className="lead text-white-75">
              Daftar sekarang dan jadilah bagian dari komunitas kami.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form Register */}
        <div className="col-lg-5 d-flex align-items-center justify-content-center auth-form-panel">
          <div className="auth-form-container">
            <div className="text-center mb-5">
              <h3 className="fw-bold">Buat Akun Baru</h3>
              <p className="text-muted">Gratis dan hanya butuh satu menit.</p>
            </div>
            <form onSubmit={submitHandler}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Nama Lengkap Anda"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="name">Nama Lengkap</label>
              </div>
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
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Konfirmasi Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label htmlFor="confirmPassword">Konfirmasi Password</label>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-dark btn-lg"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar"}
                </button>
              </div>
              <p className="text-center mt-4">
                Sudah punya akun?{" "}
                <Link to={`/login?redirect=${redirect}`}>Masuk di sini</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
