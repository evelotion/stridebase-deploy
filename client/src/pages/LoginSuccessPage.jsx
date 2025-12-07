// File: client/src/pages/LoginSuccessPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./HomePageElevate.css";

const LoginSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userString = params.get("user");

    if (token && userString) {
      const user = JSON.parse(decodeURIComponent(userString));

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect berdasarkan role
      const target =
        user.role === "admin" || user.role === "developer"
          ? "/admin/dashboard"
          : user.role === "mitra"
          ? "/partner/dashboard"
          : "/dashboard";

      // Delay sedikit agar transisi terasa halus
      setTimeout(() => {
        navigate(target);
        window.location.reload();
      }, 800);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div
      className="home-elevate-wrapper d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#050505" }}
    >
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h5 className="text-white fw-light" style={{ letterSpacing: "1px" }}>
        Memproses Login...
      </h5>
    </div>
  );
};

export default LoginSuccessPage;