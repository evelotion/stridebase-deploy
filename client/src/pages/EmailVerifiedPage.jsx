// File: client/src/pages/EmailVerifiedPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Fade, Zoom } from "react-awesome-reveal";
import "./HomePageElevate.css";

const EmailVerifiedPage = () => {
  return (
    <div className="he-auth-portal-wrapper">
      <Helmet>
        <title>Email Verified | StrideBase</title>
      </Helmet>

      <div className="he-auth-portal-overlay"></div>

      <div
        className="he-auth-card text-center"
        style={{ maxWidth: "400px", padding: "3rem 2rem" }}
      >
        <Zoom triggerOnce>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-lg"
            style={{
              width: 80,
              height: 80,
              background: "var(--sb-accent)",
              color: "#fff",
              fontSize: "2.5rem",
            }}
          >
            <i className="fas fa-envelope-open-text"></i>
          </div>
        </Zoom>

        <Fade direction="up" triggerOnce delay={200}>
          <h2 className="he-auth-heading" style={{ fontSize: "1.75rem" }}>
            Verified!
          </h2>
          <p className="he-auth-sub mb-4">
            Terima kasih telah memverifikasi email Anda. Akun Anda sekarang aktif sepenuhnya.
          </p>

          <Link
            to="/login"
            className="he-auth-submit-btn text-decoration-none d-inline-block"
            style={{ padding: "12px" }}
          >
            Masuk ke Akun
          </Link>
        </Fade>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;