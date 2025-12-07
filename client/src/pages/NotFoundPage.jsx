// File: client/src/pages/NotFoundPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Fade, Zoom } from "react-awesome-reveal";
import "./HomePageElevate.css";

const NotFoundPage = () => {
  return (
    // [FIX] Gunakan 'he-centered-page-fix' agar tidak ketutupan navbar
    <div className="home-elevate-wrapper he-centered-page-fix position-relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="he-glow-blob"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          opacity: 0.2,
          background: "radial-gradient(circle, #ef4444 0%, transparent 70%)",
        }}
      ></div>

      <div className="position-relative z-2 p-4 text-center">
        <Zoom triggerOnce>
          <h1
            className="fw-bold text-white"
            style={{
              fontSize: "10rem",
              lineHeight: 0.8,
              textShadow: "0 0 50px rgba(239, 68, 68, 0.5)",
            }}
          >
            404
          </h1>
        </Zoom>

        <Fade direction="up" delay={200} triggerOnce>
          <h3 className="fw-bold text-white mb-3 mt-4">
            Langkah Anda Tersesat?
          </h3>
          <p
            className="he-service-desc mx-auto mb-5"
            style={{ maxWidth: "400px" }}
          >
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau sol
            sepatunya lepas.
          </p>

          <Link to="/" className="he-btn-primary-glow px-5">
            Kembali ke Home
          </Link>
        </Fade>
      </div>
    </div>
  );
};

export default NotFoundPage;
