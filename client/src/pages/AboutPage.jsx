import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Tentang StrideBase</h1>
        <p className="lead text-muted">
          Platform modern yang memudahkan Anda menemukan dan memesan layanan
          cuci sepatu profesional di seluruh Indonesia.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Card Kiri: Misi Kami */}
        <div className="col-lg-6 d-flex">
          <div className="card p-4 h-100 w-100">
            <div className="card-body text-center">
              <div
                className="feature-icon-sm bg-primary bg-gradient text-white rounded-3 mb-4 fs-1 mx-auto d-inline-flex align-items-center justify-content-center"
                style={{ width: "5rem", height: "5rem" }}
              >
                <i className="fas fa-bullseye"></i>
              </div>
              <h4 className="fw-semibold">Misi Kami</h4>
              <p className="text-muted mt-3">
                Kami berkomitmen untuk memberikan layanan berkualitas tinggi
                dengan teknologi pembersih terkini dan bahan yang ramah
                lingkungan.
              </p>
            </div>
          </div>
        </div>

        {/* Card Kanan: Kenapa Memilih Kami */}
        <div className="col-lg-6 d-flex">
          <div className="card p-4 h-100 w-100">
            <div className="card-body">
              <div className="text-center mb-4">
                <div
                  className="feature-icon-sm bg-success bg-gradient text-white rounded-3 mb-3 fs-1 mx-auto d-inline-flex align-items-center justify-content-center"
                  style={{ width: "5rem", height: "5rem" }}
                >
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4 className="fw-semibold">Kenapa Memilih StrideBase?</h4>
              </div>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex">
                  <i className="fas fa-check text-success mt-1 me-2"></i>
                  <span>Layanan dari toko terpercaya & terdekat</span>
                </li>
                <li className="mb-3 d-flex">
                  <i className="fas fa-check text-success mt-1 me-2"></i>
                  <span>Proses booking cepat dan transparan</span>
                </li>
                <li className="mb-3 d-flex">
                  <i className="fas fa-check text-success mt-1 me-2"></i>
                  <span>Customer support responsif</span>
                </li>
                <li className="d-flex">
                  <i className="fas fa-check text-success mt-1 me-2"></i>
                  <span>Update status layanan secara real-time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
