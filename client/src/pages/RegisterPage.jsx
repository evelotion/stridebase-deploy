// File: client/src/pages/RegisterPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { registerUser } from "../services/apiService";
import "./HomePageElevate.css"; // Pastikan CSS Elevate terhubung

const RegisterPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage("Password dan konfirmasi password tidak cocok.", "Error");
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      showMessage("Registrasi berhasil! Silakan login.", "Success");
      navigate(`/login?redirect=${redirect}`);
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  return (
    <div className="he-auth-portal-wrapper">
      <Helmet>
        <title>Join Us | StrideBase</title>
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
          Create Account
        </h2>
        <p
          className="he-auth-sub"
          style={{ fontSize: "0.9rem", marginBottom: "2rem" }}
        >
          Join the premium shoe care revolution.
        </p>

        <form onSubmit={submitHandler}>
          <div className="he-auth-field" style={{ marginBottom: "1.2rem" }}>
            <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
              Full Name
            </label>
            <input
              type="text"
              className="he-auth-input-glass"
              style={{ padding: "12px 16px", fontSize: "0.95rem" }}
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="he-auth-field" style={{ marginBottom: "1.2rem" }}>
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

          <div className="he-auth-field" style={{ marginBottom: "1.2rem" }}>
            <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
              Password
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
            {loading ? "Creating Account..." : "Sign Up"}
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
          Already have an account?
          <Link
            to={`/login?redirect=${redirect}`}
            className="he-auth-link-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
