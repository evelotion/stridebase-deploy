// File: client/src/pages/LoginPage.jsx (Perbaikan Final)

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loginUser } from "../services/apiService"; 

const LoginPage = ({ showMessage, theme }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Mengambil gambar login dari theme config
  const loginImageUrl = theme?.branding?.loginImageUrl || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2574&auto=format&fit=crop";

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      showMessage("Login berhasil!", "Success");
      
      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "mitra":
          navigate("/partner/dashboard");
          break;
        case "developer":
          navigate("/developer/dashboard");
          break;
        default:
          navigate(redirect || "/dashboard");
      }
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
        <title>Masuk ke Akun Anda | StrideBase</title>
      </Helmet>
      <div className="row g-0 vh-100">
        <div className="col-lg-7 d-none d-lg-flex auth-image-panel login-image-side" style={{ backgroundImage: `url(${loginImageUrl})` }}>
           <div className="auth-image-overlay">
                <h1 className="display-4 fw-bold text-white">Langkah Bersih, Awal Penuh Gaya.</h1>
                <p className="lead text-white-75">Temukan kembali kesempurnaan sepatu Anda bersama kami.</p>
            </div>
        </div>
        <div className="col-lg-5 d-flex align-items-center justify-content-center auth-form-panel">
            <div className="auth-form-container">
                <div className="text-center mb-5">
                    <h3 className="fw-bold">Selamat Datang Kembali</h3>
                    <p className="text-muted">Masuk untuk melanjutkan ke StrideBase</p>
                </div>
                <form onSubmit={submitHandler}>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" id="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        <label htmlFor="email">Alamat Email</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" id="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className="text-end mb-4">
                        <Link to="/forgot-password">Lupa Password?</Link>
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-dark btn-lg" disabled={loading}>
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </div>
                    <p className="text-center mt-4">
                        Belum punya akun? <Link to={`/register?redirect=${redirect}`}>Daftar Sekarang</Link>
                    </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;