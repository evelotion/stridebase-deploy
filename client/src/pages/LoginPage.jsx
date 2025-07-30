import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const LoginPage = ({ showMessage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format email tidak valid.";
    }
    if (!password) {
      errors.password = "Password tidak boleh kosong.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showMessage("Login berhasil!");

      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="row g-0 vh-100">
        <div className="col-lg-7 d-none d-lg-block">
          <div className="auth-image-panel login-image-side">
            <div className="auth-image-overlay">
              <h1 className="display-4 fw-bold">
                Solusi Perawatan Sepatu, <br />
                Tepat di Ujung Jari Anda.
              </h1>
            </div>
          </div>
        </div>

        <div className="col-lg-5 d-flex align-items-center justify-content-center">
          <div className="auth-form-container">
            <div className="text-center">
              <h3 className="fw-bold mb-2">Sign In</h3>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${
                    formErrors.email ? "is-invalid" : ""
                  }`}
                  placeholder="e.g., evelyne@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {formErrors.email && (
                  <div className="invalid-feedback">{formErrors.email}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${
                    formErrors.password ? "is-invalid" : ""
                  }`}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {formErrors.password && (
                  <div className="invalid-feedback">{formErrors.password}</div>
                )}
              </div>
              <div className="d-flex justify-content-end mb-4">
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="d-grid mb-4">
                <button type="submit" className="btn btn-dark">
                  Sign In
                </button>
              </div>
              <p className="text-center text-muted">
                Don't have an account yet?{" "}
                <Link to="/register" style={{ textDecoration: "none" }}>
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
