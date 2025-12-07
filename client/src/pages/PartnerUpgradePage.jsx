// File: client/src/pages/PartnerUpgradePage.jsx

import React from "react";
import { Fade, Slide } from "react-awesome-reveal";
import "./PartnerElevate.css";

const PartnerUpgradePage = () => {
  // Fungsi simulasi upgrade (bisa dihubungkan ke payment gateway nantinya)
  const handleUpgrade = () => {
    alert("Fitur pembayaran upgrade akan segera tersedia via Midtrans.");
  };

  return (
    <div className="pe-dashboard-wrapper">
      {/* Background Atmosphere */}
      <div
        className="pe-blob pe-blob-1"
        style={{ top: "-20%", left: "50%", transform: "translateX(-50%)" }}
      ></div>

      <div className="container-fluid px-4 py-5 position-relative z-1">
        {/* Header */}
        <div className="text-center mb-5">
          <Fade direction="down" triggerOnce>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-2 text-warning">
              Unlock Full Potential
            </h6>
            <h1
              className="display-4 fw-bold text-white mb-3"
              style={{ fontFamily: "Outfit" }}
            >
              Choose Your Tier
            </h1>
            <p className="pe-subtitle mx-auto" style={{ maxWidth: "600px" }}>
              Tingkatkan kapasitas toko Anda dengan fitur premium. Dapatkan
              akses ke manajemen promo tanpa batas dan lencana PRO eksklusif.
            </p>
          </Fade>
        </div>

        {/* Pricing Cards */}
        <div className="row justify-content-center g-4 align-items-center">
          {/* BASIC PLAN (Current) */}
          <div className="col-md-5 col-lg-4">
            <Fade direction="left" triggerOnce>
              <div
                className="pe-card p-4 text-center position-relative opacity-75"
                style={{ borderStyle: "dashed" }}
              >
                <div className="pe-subtitle text-uppercase tracking-widest small mb-3">
                  Current Plan
                </div>
                <h3 className="pe-title mb-0">BASIC</h3>
                <div className="display-2 my-4 fw-bold text-white-50">Free</div>

                <ul
                  className="list-unstyled text-start mx-auto mb-5 d-flex flex-column gap-3"
                  style={{ maxWidth: "250px" }}
                >
                  <li className="text-white">
                    <i className="fas fa-check text-success me-2"></i> Manajemen
                    Pesanan
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check text-success me-2"></i> Laporan
                    Dasar
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check text-success me-2"></i> Maksimal
                    3 Promo
                  </li>
                  <li className="text-muted">
                    <i className="fas fa-times me-2"></i> Tidak Ada Badge PRO
                  </li>
                  <li className="text-muted">
                    <i className="fas fa-times me-2"></i> Prioritas Support
                    Rendah
                  </li>
                </ul>

                <button
                  className="btn btn-outline-secondary w-100 rounded-pill"
                  disabled
                >
                  Your Current Plan
                </button>
              </div>
            </Fade>
          </div>

          {/* PRO PLAN (Target) */}
          <div className="col-md-6 col-lg-4">
            <Slide direction="up" triggerOnce>
              <div
                className="pe-card p-5 text-center position-relative overflow-hidden group-hover-glow"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(20,20,20,0.8), rgba(40,40,40,0.4))",
                  borderColor: "var(--pe-warning)",
                  boxShadow: "0 0 50px rgba(245, 158, 11, 0.15)",
                  transform: "scale(1.05)",
                }}
              >
                {/* Ribbon */}
                <div className="position-absolute top-0 end-0 bg-warning text-black fw-bold x-small px-3 py-1 rounded-bottom-start">
                  RECOMMENDED
                </div>

                <div
                  className="pe-stat-icon pe-icon-gold mx-auto mb-3"
                  style={{ width: "60px", height: "60px", fontSize: "1.8rem" }}
                >
                  <i className="fas fa-crown"></i>
                </div>

                <h3 className="pe-title mb-0 text-warning">PRO PARTNER</h3>
                <div className="display-4 my-4 fw-bold text-white">
                  <span className="fs-4 align-top text-muted">Rp</span> 150k
                  <span className="fs-6 text-muted">/bln</span>
                </div>

                <ul
                  className="list-unstyled text-start mx-auto mb-5 d-flex flex-column gap-3"
                  style={{ maxWidth: "280px" }}
                >
                  <li className="text-white">
                    <i className="fas fa-check-circle text-warning me-2"></i>{" "}
                    <strong>Unlimited Promo</strong>
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check-circle text-warning me-2"></i>{" "}
                    <strong>Badge PRO</strong> di Pencarian
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check-circle text-warning me-2"></i>{" "}
                    Laporan Analitik Lengkap
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check-circle text-warning me-2"></i>{" "}
                    Prioritas Support 24/7
                  </li>
                  <li className="text-white">
                    <i className="fas fa-check-circle text-warning me-2"></i>{" "}
                    Akses Fitur Beta
                  </li>
                </ul>

                <button
                  onClick={handleUpgrade}
                  className="pe-btn-action w-100 py-3 rounded-pill fw-bold text-uppercase bg-warning text-black border-0 hover-scale shadow-lg"
                >
                  Upgrade Now
                </button>
                <div className="mt-3 text-muted x-small">
                  *Bisa dibatalkan kapan saja
                </div>
              </div>
            </Slide>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerUpgradePage;
