// File: client/src/pages/ResetPasswordPage.jsx

import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { resetPasswordUser } from "../services/apiService";
import "./HomePageElevate.css";

const ResetPasswordPage = ({ showMessage }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan konfirmasi tidak cocok.", "Error");
      return;
    }
    if (!token) {
      showMessage("Token tidak valid atau tidak ditemukan.", "Error");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordUser({ token, newPassword: password });
      showMessage(
        "Password berhasil direset! Silakan login dengan password baru Anda.",
        "Success"
      );
      navigate("/login");
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="he-auth-portal-wrapper">
      <Helmet>
        <title>Reset Password | StrideBase</title>
      </Helmet>

      <div className="he-auth-portal-overlay"></div>

      <div
        className="he-auth-card"
        style={{ maxWidth: "400px", padding: "2.5rem 2rem" }}
      >
        <Link
          to="/"
          className="he-auth-logo-text"
          style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}
        >
          StrideBase.
        </Link>

        <h2 className="he-auth-heading" style={{ fontSize: "1.75rem" }}>
          New Password
        </h2>
        <p
          className="he-auth-sub"
          style={{ fontSize: "0.9rem", marginBottom: "2rem" }}
        >
          Secure your account with a new strong password.
        </p>

        <form onSubmit={submitHandler}>
          <div className="he-auth-field" style={{ marginBottom: "1.2rem" }}>
            <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
              New Password
            </label>
            <input
              type="password"
              className="he-auth-input-glass"
              style={{ padding: "12px 16px", fontSize: "0.95rem" }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="he-auth-field" style={{ marginBottom: "1.5rem" }}>
            <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="he-auth-input-glass"
              style={{ padding: "12px 16px", fontSize: "0.95rem" }}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="he-auth-submit-btn"
            style={{
              padding: "12px",
              fontSize: "0.95rem",
              marginTop: "0.5rem",
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;