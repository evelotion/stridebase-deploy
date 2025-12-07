// File: client/src/pages/PaymentFinishPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

const PaymentFinishPage = () => {
  return (
    // [FIX] Tambahkan 'he-centered-page-fix'
    <div className="home-elevate-wrapper he-centered-page-fix text-center p-4">
      
      {/* [FIX] Tambahkan 'he-zoom-out-card' */}
      <div className="he-zoom-out-card" style={{ maxWidth: '500px' }}>
        <Fade direction="up" triggerOnce>
          <div className="mb-4 text-primary" style={{ fontSize: '4rem' }}>
            <i className="fas fa-hourglass-half"></i>
          </div>
          <h2 className="he-section-title mb-3">Memproses Pembayaran</h2>
          <p className="he-service-desc mb-5">
            Sistem kami sedang memverifikasi transaksi Anda. Mohon tunggu sebentar atau cek status di dashboard.
          </p>
          
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/dashboard" className="he-btn-primary-glow px-4">
              Cek Dashboard
            </Link>
            <Link to="/" className="he-btn-glass px-4">
              Home
            </Link>
          </div>
        </Fade>
      </div>

    </div>
  );
};

export default PaymentFinishPage;