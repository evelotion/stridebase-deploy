import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <p className="fs-3"> <span className="text-danger">Opps!</span> Halaman tidak ditemukan.</p>
        <p className="lead">
            Halaman yang Anda cari mungkin telah dihapus, diganti namanya, atau sementara tidak tersedia.
        </p>
        <Link to="/" className="btn btn-dark mt-3">
            Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;