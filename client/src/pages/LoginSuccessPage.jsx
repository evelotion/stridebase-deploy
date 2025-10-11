// File: client/src/pages/LoginSuccessPage.jsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userString = params.get('user');

    if (token && userString) {
      const user = JSON.parse(decodeURIComponent(userString));
      
      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Arahkan ke halaman yang sesuai berdasarkan peran
      if (user.role === 'admin' || user.role === 'developer') {
        navigate('/admin/dashboard');
      } else if (user.role === 'mitra') {
        navigate('/partner/dashboard');
      } else {
        navigate('/dashboard');
      }
      // Reload halaman untuk memastikan semua state terupdate
      window.location.reload(); 
    } else {
      // Jika tidak ada token, arahkan kembali ke halaman login
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="ms-3">Finalizing login...</p>
    </div>
  );
};

export default LoginSuccessPage;