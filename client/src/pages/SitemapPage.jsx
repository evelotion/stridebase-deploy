// File: stridebase-app-render/client/src/pages/SitemapPage.jsx

import React from "react";
import { Link } from "react-router-dom";

const SitemapPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Peta Situs</h1>
        <p className="lead text-muted">Navigasi utama situs StrideBase.</p>
      </div>

      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card">
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <Link to="/">Beranda</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/about">Tentang Kami</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/store">Cari Toko</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/contact">Hubungi Kami</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/faq">Pertanyaan Umum (FAQ)</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/login">Login</Link> / <Link to="/register">Register</Link>
                </li>
                <li className="list-group-item">
                  <strong>Halaman Legal</strong>
                  <ul className="list-unstyled ps-4 mt-2">
                    <li><Link to="/privacy-policy">Kebijakan Privasi</Link></li>
                    <li><Link to="/terms-conditions">Syarat & Ketentuan</Link></li>
                    <li><Link to="/legal">Hukum</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;