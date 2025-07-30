import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- BAGIAN 1: TAMBAHKAN STATE BARU UNTUK MENAMPUNG ERROR FORM ---
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  // --- BAGIAN 2: TAMBAHKAN FUNGSI VALIDASI ---
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Nama lengkap tidak boleh kosong.";
    }
    // Regex sederhana untuk validasi email
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format email tidak valid.";
    }
    if (password.length < 8) {
      errors.password = "Password minimal harus 8 karakter.";
    }

    setFormErrors(errors);
    // Return true jika tidak ada error
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- BAGIAN 3: PANGGIL FUNGSI VALIDASI SEBELUM SUBMIT ---
    if (!validateForm()) {
      return; // Hentikan proses submit jika validasi gagal
    }

    try {
      const response = await fetch("process.env.API_BASE_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika error dari server, prioritaskan untuk ditampilkan
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
              {" "}
              {/* Tambahkan noValidate */}
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
                {/* --- BAGIAN 4: TAMPILKAN PESAN ERROR UNTUK NAMA --- */}
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
                {/* --- BAGIAN 5: TAMPILKAN PESAN ERROR UNTUK EMAIL --- */}
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
                {/* --- BAGIAN 6: TAMPILKAN PESAN ERROR UNTUK PASSWORD --- */}
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
