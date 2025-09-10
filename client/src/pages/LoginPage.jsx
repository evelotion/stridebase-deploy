import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loginUser } from "../services/apiService"; // <-- PERUBAHAN 1

const LoginPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // --- PERUBAHAN 2: Ganti fetch dengan apiService ---
      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showMessage("Login berhasil!", "Success");

      // Arahkan pengguna berdasarkan peran setelah login
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
    <div className="auth-page-container">
      <Helmet>
        <title>Masuk ke Akun Anda | StrideBase</title>
      </Helmet>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="fw-bold">Selamat Datang Kembali</h2>
          <p className="text-muted">Masuk untuk melanjutkan ke StrideBase</p>
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingInput">Alamat Email</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="floatingPassword"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <div className="text-end mt-2">
            <Link to="/forgot-password">Lupa Password?</Link>
          </div>
          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn btn-dark btn-lg"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>
        <div className="auth-footer mt-4 text-center">
          <p>
            Belum punya akun?{" "}
            <Link to={`/register?redirect=${redirect}`}>Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
