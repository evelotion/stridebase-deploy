// File: client/src/pages/TrackOrderPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../apiConfig";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

let socket;

const TrackOrderPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const workStages = useMemo(
    () => [
      {
        status: "not_started",
        icon: "fa-receipt",
        title: "Pesanan Diterima",
        desc: "Menunggu konfirmasi toko",
      },
      {
        status: "in_progress",
        icon: "fa-soap",
        title: "Sedang Dikerjakan",
        desc: "Sepatu sedang dicuci/dirawat",
      },
      {
        status: "completed",
        icon: "fa-check-circle",
        title: "Selesai",
        desc: "Perawatan selesai dilakukan",
      },
      {
        status: "pending_verification",
        icon: "fa-box-open",
        title: "Siap Diambil",
        desc: "Menunggu pengambilan/pengiriman",
      },
    ],
    []
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
      setError("Silakan login untuk melihat detail pesanan.");
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Pesanan tidak ditemukan.");
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();

    socket = io(
      import.meta.env.PROD
        ? "https://stridebase-server-wqdw.onrender.com"
        : "http://localhost:5000",
      { query: { userId: user.id } }
    );
    const handleBookingUpdate = (updated) => {
      if (updated.id === bookingId) {
        setBooking((prev) => ({ ...prev, ...updated }));
      }
    };
    socket.on("bookingUpdated", handleBookingUpdate);

    return () => {
      socket.off("bookingUpdated", handleBookingUpdate);
      socket.disconnect();
    };
  }, [bookingId]);

  const currentStageIndex = useMemo(() => {
    if (!booking) return -1;
    return workStages.findIndex((stage) => stage.status === booking.workStatus);
  }, [booking, workStages]);

  if (loading)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (error)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center text-danger"
        style={{ minHeight: "100vh", background: "var(--pe-bg)" }}
      >
        {error}
      </div>
    );

  /* --- RENDER DESKTOP (HORIZONTAL) --- */
  const renderDesktop = () => (
    <div className="d-none d-lg-block container pt-5 mt-5">
      <Fade direction="up" triggerOnce>
        <div className="text-center mb-5">
          <span
            className="he-section-label mb-2 d-block"
            style={{ color: "var(--sb-accent, #3b82f6)" }}
          >
            LIVE TRACKING
          </span>
          <h2
            className="he-section-title"
            style={{ color: "var(--sb-text-main, #ffffff)" }}
          >
            Status Pesanan
          </h2>
          <p style={{ color: "var(--sb-text-muted, #a3a3a3)" }}>
            Order ID:{" "}
            <span className="font-monospace text-white">
              #{booking.id.substring(0, 8)}
            </span>
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div
              className="p-5 rounded-5 position-relative overflow-hidden"
              style={{
                background: "var(--sb-card-bg, rgba(20,20,20,0.8))",
                border:
                  "1px solid var(--sb-card-border, rgba(255,255,255,0.1))",
                boxShadow: "var(--sb-card-shadow)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="text-center mb-5">
                <h4
                  className="fw-bold mb-1"
                  style={{ color: "var(--sb-text-main, #ffffff)" }}
                >
                  {booking.serviceName}
                </h4>
                <p
                  className="mb-0"
                  style={{ color: "var(--sb-text-muted, #a3a3a3)" }}
                >
                  di <span className="text-primary">{booking.store.name}</span>
                </p>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="position-relative px-4 py-4 my-5">
                {/* Background Line */}
                <div
                  className="position-absolute top-50 start-0 w-100 translate-middle-y"
                  style={{
                    height: "4px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.1)", // Ganti opacity bootstrap dengan explicit rgba
                  }}
                ></div>
                {/* Active Line */}
                <div
                  className="position-absolute top-50 start-0 translate-middle-y"
                  style={{
                    height: "4px",
                    borderRadius: "10px",
                    width: `${
                      (currentStageIndex / (workStages.length - 1)) * 100
                    }%`,
                    background:
                      "linear-gradient(90deg, var(--sb-accent, #3b82f6), #60a5fa)",
                    boxShadow: "0 0 15px var(--sb-accent, #3b82f6)",
                    transition: "width 1s ease-in-out",
                  }}
                ></div>

                <div className="d-flex justify-content-between position-relative">
                  {workStages.map((stage, index) => {
                    const isActive = index <= currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    return (
                      <div
                        key={stage.status}
                        className="text-center"
                        style={{ width: "80px" }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 transition-all"
                          style={{
                            width: "50px",
                            height: "50px",
                            background: isActive
                              ? "var(--sb-accent, #3b82f6)"
                              : "var(--sb-bg-secondary, rgba(255,255,255,0.05))",
                            border: isActive
                              ? "none"
                              : "2px solid var(--sb-card-border, rgba(255,255,255,0.1))",
                            boxShadow: isActive
                              ? "0 0 20px rgba(59, 130, 246, 0.5)"
                              : "none",
                            color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                            transform: isCurrent ? "scale(1.2)" : "scale(1)",
                          }}
                        >
                          <i className={`fas ${stage.icon}`}></i>
                        </div>
                        <span
                          className="small fw-bold d-block"
                          style={{
                            color: isActive
                              ? "var(--sb-text-main, #ffffff)"
                              : "var(--sb-text-muted, rgba(255,255,255,0.4))",
                            opacity: isActive ? 1 : 0.6,
                            transition: "color 0.3s ease",
                          }}
                        >
                          {stage.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center mt-5">
                <Link
                  to="/dashboard"
                  className="btn btn-outline-light rounded-pill px-4"
                  style={{
                    borderColor: "var(--sb-card-border, rgba(255,255,255,0.2))",
                    color: "var(--sb-text-main, #ffffff)",
                  }}
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );

  /* --- RENDER MOBILE (VERTICAL TIMELINE) --- */
  const renderMobile = () => (
    <div className="he-mobile-track-wrapper d-lg-none">
      {/* Header Compact */}
      <div className="he-mobile-header-sticky">
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/dashboard"
            className="text-decoration-none"
            style={{ color: "var(--sb-text-main, #ffffff)" }}
          >
            <i className="fas fa-arrow-left fs-5"></i>
          </Link>
          <h5
            className="mb-0 fw-bold flex-grow-1 text-center"
            style={{ color: "var(--sb-text-main, #ffffff)" }}
          >
            Lacak Pesanan
          </h5>
          <div style={{ width: "24px" }}></div> {/* Spacer */}
        </div>
      </div>

      <div className="container pt-4 pb-5">
        {/* Info Card */}
        <div
          className="he-mobile-track-info-card mb-4"
          style={{
            background: "var(--sb-card-bg, rgba(25,25,25,0.9))",
            border: "1px solid var(--sb-card-border, rgba(255,255,255,0.1))",
          }}
        >
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{ color: "var(--sb-text-main, #ffffff)" }}
              >
                {booking.serviceName}
              </h2>
              <p
                className="small mb-0"
                style={{ color: "var(--sb-text-muted, #a3a3a3)" }}
              >
                Order ID: #{booking.id.slice(-6)}
              </p>
            </div>
            <div
              className="he-track-store-icon"
              style={{
                color: "var(--sb-accent, #3b82f6)",
                background: "rgba(59, 130, 246, 0.1)",
              }}
            >
              <i className="fas fa-store"></i>
            </div>
          </div>
          <div
            className="he-track-divider"
            style={{
              borderColor: "var(--sb-card-border, rgba(255,255,255,0.1))",
            }}
          ></div>
          <div className="row mt-3">
            <div className="col-6">
              <small
                className="d-block text-uppercase"
                style={{
                  color: "var(--sb-text-muted, #a3a3a3)",
                  fontSize: "0.65rem",
                }}
              >
                Store
              </small>
              <span
                className="fw-bold"
                style={{
                  color: "var(--sb-text-main, #ffffff)",
                  fontSize: "0.9rem",
                }}
              >
                {booking.store.name}
              </span>
            </div>
            <div className="col-6 text-end">
              <small
                className="d-block text-uppercase"
                style={{
                  color: "var(--sb-text-muted, #a3a3a3)",
                  fontSize: "0.65rem",
                }}
              >
                Est. Selesai
              </small>
              <span
                className="fw-bold"
                style={{
                  color: "var(--sb-success, #10b981)",
                  fontSize: "0.9rem",
                }}
              >
                2 Hari
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="he-mobile-timeline px-2">
          {workStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stage.status}
                className={`he-timeline-item ${isCurrent ? "current" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                style={{ position: "relative" }}
              >
                {/* Garis Penghubung */}
                {index !== workStages.length - 1 && (
                  <div
                    className="he-timeline-line"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--sb-accent, #3b82f6)"
                        : "var(--sb-card-border, rgba(255,255,255,0.1))",
                      width: "2px",
                    }}
                  ></div>
                )}

                {/* Dot / Icon */}
                <div
                  className="he-timeline-dot"
                  style={{
                    background:
                      isCompleted || isCurrent
                        ? "var(--sb-accent, #3b82f6)"
                        : "var(--sb-bg-secondary, #2a2a2a)",
                    border:
                      isCompleted || isCurrent
                        ? "none"
                        : "2px solid var(--sb-card-border, #444)",
                    color: "#fff",
                    boxShadow: isCurrent
                      ? "0 0 15px rgba(59, 130, 246, 0.5)"
                      : "none",
                  }}
                >
                  {isCompleted ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={`fas ${stage.icon}`}></i>
                  )}
                </div>

                {/* Content */}
                <div className="he-timeline-content ps-3">
                  <h6
                    className="mb-1 fw-bold"
                    style={{
                      color: isPending
                        ? "var(--sb-text-muted, #a3a3a3)"
                        : "var(--sb-text-main, #ffffff)",
                      opacity: isPending ? 0.6 : 1,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {stage.title}
                  </h6>
                  <p
                    className="small mb-0"
                    style={{ color: "var(--sb-text-muted, #a3a3a3)" }}
                  >
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {booking.workStatus === "pending_verification" && (
          <div
            className="fixed-bottom p-3"
            style={{
              background: "var(--sb-card-bg, #1a1a1a)",
              borderTop: "1px solid var(--sb-card-border, #333)",
            }}
          >
            <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg">
              Konfirmasi Penerimaan
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="home-elevate-wrapper"
      style={{
        minHeight: "100vh",
        background: "var(--pe-bg, #050505)", // Paksa background gelap utama
      }}
    >
      {renderDesktop()}
      {renderMobile()}
    </div>
  );
};

export default TrackOrderPage;
