import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Nama lengkap tidak boleh kosong.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format email tidak valid.";
    }
    if (password.length < 8) {
      errors.password = "Password minimal harus 8 karakter.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal.");
      }

      setSuccess("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="row g-0 vh-100">
        <div className="col-lg-7 d-none d-lg-block">
          <div className="auth-image-panel register-image-side">
            <div className="auth-image-overlay">
              <h1 className="display-4 fw-bold">
                Bergabunglah dengan Komunitas Perawatan Sepatu Terbaik.
              </h1>
            </div>
          </div>
        </div>

        <div className="col-lg-5 d-flex align-items-center justify-content-center">
          <div className="auth-form-container">
            <div className="text-center">
              <h3 className="fw-bold mb-2">Create Account</h3>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={`form-control ${
                    formErrors.name ? "is-invalid" : ""
                  }`}
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {formErrors.name && (
                  <div className="invalid-feedback">{formErrors.name}</div>
                )}
              </div>
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
                  placeholder="e.g., johndoe@gmail.com"
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
              <div className="d-grid my-4">
                <button type="submit" className="btn btn-dark">
                  Register
                </button>
              </div>
              <p className="text-center text-muted">
                Already have an account?{" "}
                <Link to="/login" style={{ textDecoration: "none" }}>
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
