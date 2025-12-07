// File: client/src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loginUser } from "../services/apiService";
import "./HomePageElevate.css";

const LoginPage = ({ showMessage }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW STATE: Toggle Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (showMessage) showMessage("Login berhasil!", "Success");

      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "mitra":
          navigate("/partner/dashboard");
          break;
        case "developer":
          navigate("/developer/dashboard");
          break;
        default:
          navigate(redirect || "/dashboard");
      }
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  return (
    <div className="he-auth-portal-wrapper">
      <Helmet>
        <title>Sign In | StrideBase</title>
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
          Welcome Back
        </h2>
        <p
          className="he-auth-sub"
          style={{ fontSize: "0.9rem", marginBottom: "2rem" }}
        >
          Enter your credentials to access your account.
        </p>

        <form onSubmit={submitHandler}>
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

          <div className="he-auth-field" style={{ marginBottom: "1.5rem" }}>
            <div className="d-flex justify-content-between align-items-center">
              <label className="he-auth-label" style={{ fontSize: "0.75rem" }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                Forgot?
              </Link>
            </div>

            {/* WRAPPER INPUT PASSWORD (RELATIVE POSITION) */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} // Logic Toggle Type
                className="he-auth-input-glass"
                style={{
                  padding: "12px 40px 12px 16px", // Padding kanan lebih besar untuk ikon
                  fontSize: "0.95rem",
                  width: "100%",
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* EYE ICON BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
                tabIndex="-1" // Agar tidak bisa difokuskan lewat tab keyboard
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
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
            {loading ? "Verifying..." : "Sign In"}
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
          Don't have an account?
          <Link
            to={`/register?redirect=${redirect}`}
            className="he-auth-link-bold"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
