import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import React, { useEffect, useState } from "react";
import { registerUser } from "../services/apiService"; // <-- PERUBAHAN 1

const RegisterPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan Konfirmasi Password tidak cocok.", "Error");
      return;
    }
    setLoading(true);
    try {
      // --- PERUBAHAN 2: Ganti fetch dengan apiService ---
      const data = await registerUser({ name, email, password });
      showMessage(data.message, "Success");
      navigate("/login"); // Arahkan ke halaman login setelah registrasi berhasil
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
        <title>Buat Akun Baru | StrideBase</title>
      </Helmet>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="fw-bold">Buat Akun Baru</h2>
          <p className="text-muted">
            Daftar untuk mulai menemukan layanan cuci sepatu terbaik.
          </p>
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="floatingName"
              placeholder="Nama Lengkap"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="floatingName">Nama Lengkap</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="floatingEmail"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingEmail">Alamat Email</label>
          </div>
          <div className="form-floating mb-3">
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
          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="floatingConfirmPassword"
              placeholder="Konfirmasi Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="floatingConfirmPassword">Konfirmasi Password</label>
          </div>

          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn btn-dark btn-lg"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>
        <div className="auth-footer mt-4 text-center">
          <p>
            Sudah punya akun?{" "}
            <Link to={`/login?redirect=${redirect}`}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
