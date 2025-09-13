import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import React, { useEffect, useState } from "react";
import { registerUser } from "../services/apiService";

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

  // Mengambil gambar registrasi dari theme config
  const registerImageUrl = theme?.branding?.registerImageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2574&auto=format&fit=crop";

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan Konfirmasi Password tidak cocok.", "Error");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      showMessage(data.message, "Success");
      navigate("/login");
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
         <div className="col-lg-5 d-flex align-items-center justify-content-center auth-form-panel">
            <div className="auth-form-container p-4 p-md-5">
                <div className="text-center mb-5">
                    <h3 className="fw-bold fs-2 text-dark">Buat Akun Baru</h3>
                    <p className="text-muted fs-6">Daftar untuk mulai menemukan layanan cuci sepatu terbaik.</p>
                </div>
                <form onSubmit={submitHandler}>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control form-control-lg" id="name" placeholder="Nama Lengkap" required value={name} onChange={(e) => setName(e.target.value)} />
                        <label htmlFor="name">Nama Lengkap</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control form-control-lg" id="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        <label htmlFor="email">Alamat Email</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control form-control-lg" id="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className="form-floating mb-4">
                        <input type="password" className="form-control form-control-lg" id="confirmPassword" placeholder="Konfirmasi Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <label htmlFor="confirmPassword">Konfirmasi Password</label>
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-dark btn-lg fw-bold" disabled={loading}>
                            {loading ? "Memproses..." : "Daftar"}
                        </button>
                    </div>
                    <p className="text-center mt-4 fs-6">
                        Sudah punya akun? <Link to={`/login?redirect=${redirect}`} className="text-decoration-none fw-bold">Masuk di sini</Link>
                    </p>
                </form>
            </div>
        </div>
        <div className="col-lg-7 d-none d-lg-flex auth-image-panel register-image-side" style={{ backgroundImage: `url(${registerImageUrl})` }}>
           <div className="auth-image-overlay">
                <h1 className="display-4 fw-bold text-white">Satu Akun, Ribuan Pilihan Perawatan.</h1>
                <p className="lead text-white-75">Bergabunglah dengan komunitas pecinta sepatu bersih di seluruh Indonesia.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;