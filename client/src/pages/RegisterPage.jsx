import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal.');
      }

      setSuccess('Pendaftaran berhasil! Anda akan diarahkan ke halaman login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Buat Akun Baru</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="form-floating mb-3">
              <input type="text" id="name" className="form-control" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
              <label htmlFor="name">Nama Lengkap</label>
            </div>
            <div className="form-floating mb-3">
              <input type="email" id="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="email">Alamat Email</label>
            </div>
            <div className="form-floating mb-3">
              <input type="password" id="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label htmlFor="password">Password</label>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Daftar</button>
            </div>
            <p className="text-center mt-3">
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;