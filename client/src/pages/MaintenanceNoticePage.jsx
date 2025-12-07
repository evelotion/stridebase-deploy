// File: client/src/pages/MaintenanceNoticePage.jsx

import React from "react";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

const MaintenanceNoticePage = () => {
  return (
    // [FIX] Tambahkan 'he-centered-page-fix'
    <div className="home-elevate-wrapper he-centered-page-fix text-center p-4">
      {/* [FIX] Tambahkan 'he-zoom-out-card' agar kartu lebih compact */}
      <div
        className="he-promo-card he-zoom-out-card p-5 border-0"
        style={{ maxWidth: "500px", background: "rgba(255,255,255,0.03)" }}
      >
        <Fade direction="down" triggerOnce>
          <div className="mb-4 text-warning" style={{ fontSize: "4rem" }}>
            <i className="fas fa-tools"></i>
          </div>
          <h2 className="fw-bold text-white mb-3">Sedang Perbaikan</h2>
          <p className="he-service-desc mb-4">
            Kami sedang melakukan perawatan sistem untuk meningkatkan kualitas
            langkah Anda. Silakan kembali beberapa saat lagi.
          </p>
          <div
            className="progress"
            style={{ height: "6px", background: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
              style={{ width: "75%" }}
            ></div>
          </div>
          <p className="mt-3 text-white-50 small">Estimasi kembali: Segera</p>
        </Fade>
      </div>
    </div>
  );
};

export default MaintenanceNoticePage;
