// File: client/src/pages/ForgotPasswordPage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { forgotPasswordUser } from "../services/apiService";
import "./HomePageElevate.css"; // Pastikan CSS Elevate terhubung

const ForgotPasswordPage = ({ showMessage }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordUser({ email });
      showMessage(
        "Jika email terdaftar, kami telah mengirimkan link reset password.",
        "Success"
      );
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

      {/* COMPACT CENTERED CARD */}
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
          Forgot Password?
        </h2>
        <p
          className="he-auth-sub"
          style={{ fontSize: "0.9rem", marginBottom: "2rem" }}
        >
          Enter your email to receive reset instructions.
        </p>

        <form onSubmit={submitHandler}>
          <div className="he-auth-field" style={{ marginBottom: "1.5rem" }}>
            <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
              Email Address
            </label>
            <input
              type="email"
              className="he-auth-input-glass"
              style={{ padding: "12px 16px", fontSize: "0.95rem" }}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <div
          className="he-auth-footer"
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            fontSize: "0.85rem",
          }}
        >
          Remember your password?
          <Link to="/login" className="he-auth-link-bold">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
