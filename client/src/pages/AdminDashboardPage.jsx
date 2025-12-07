// File: client/src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminStats } from "../services/apiService";
import { Fade, Slide } from "react-awesome-reveal";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// --- IMPORT SWIPER (KHUSUS MOBILE) ---
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

// Registrasi Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardPage = ({ showMessage }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
        if (showMessage) showMessage(err.message, "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [showMessage]);

  // Konfigurasi Chart (Desktop)
  const chartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: "Traffic",
        data: [50, 100, 150, 120, 200, 300, 250],
        fill: true,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderColor: "#8b5cf6",
        tension: 0.4,
        pointBackgroundColor: "#050505",
        pointBorderColor: "#8b5cf6",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255,255,255,0.5)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.5)" },
      },
    },
  };

  if (loading)
    return (
      <div className="pe-dashboard-wrapper d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  // Data KPI Stats (Digunakan di kedua view)
  const kpiItems = [
    {
      title: "Total Pengguna",
      value: stats?.totalUsers || 0,
      icon: "fa-users",
      color: "pe-icon-blue",
      link: "/admin/users",
      trend: "+5%",
    },
    {
      title: "Total Toko",
      value: stats?.totalStores || 0,
      icon: "fa-store",
      color: "pe-icon-purple",
      link: "/admin/stores",
      trend: "+2%",
    },
    {
      title: "Total Pesanan",
      value: stats?.totalBookings || 0,
      icon: "fa-receipt",
      color: "pe-icon-gold",
      link: "/admin/bookings",
      trend: "+12%",
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`,
      icon: "fa-wallet",
      color: "pe-icon-green",
      link: "/admin/reports",
      trend: "+8%",
    },
  ];

  /* =========================================
     RENDER: MOBILE VIEW (NATIVE APP STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. GREETING CARD (Pengganti Header Lama) */}
      <div className="mb-4 pt-3 px-1">
        <div
          className="pe-card p-3 d-flex align-items-center justify-content-between"
          style={{
            background:
              "linear-gradient(to right, var(--pe-card-bg), rgba(59, 130, 246, 0.1))",
            borderLeft: "4px solid var(--pe-accent)",
          }}
        >
          <div>
            <small
              className="text-muted d-block"
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Overview
            </small>
            <h5 className="pe-title mb-0 fs-5">
              Halo, {user?.name?.split(" ")[0] || "Admin"} 👋
            </h5>
          </div>
          <div
            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
          >
            <i className="fas fa-chart-pie"></i>
          </div>
        </div>
      </div>

      {/* 2. KPI SWIPER (HORIZONTAL SCROLL) */}
      <div className="mb-4">
        <Swiper
          slidesPerView={1.25}
          spaceBetween={15}
          freeMode={true}
          modules={[FreeMode]}
          className="px-1 py-1"
          style={{ overflow: "visible" }}
        >
          {kpiItems.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="pe-card h-100 d-flex flex-column justify-content-between shadow-sm"
                onClick={() => navigate(item.link)}
                style={{ minHeight: "130px" }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div
                    className={`pe-stat-icon ${item.color} mb-0`}
                    style={{
                      width: 32,
                      height: 32,
                      fontSize: "0.9rem",
                      borderRadius: "8px",
                    }}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span
                    className="badge bg-success bg-opacity-10 text-success rounded-pill border border-success border-opacity-25"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {item.trend}
                  </span>
                </div>
                <div>
                  <h3 className="pe-title mb-0 fs-3 fw-bold">{item.value}</h3>
                  <p
                    className="pe-subtitle small mb-0 mt-1 opacity-75"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 3. LIVE ACTIVITY WIDGET */}
      <div className="mb-4 px-1">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span
            className="pe-subtitle fw-bold"
            style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
          >
            NEED ATTENTION
          </span>
        </div>

        {/* Task Card: Toko Pending */}
        <div
          className="pe-card p-3 mb-2 d-flex align-items-center gap-3"
          style={{ border: "1px solid rgba(59,130,246,0.3)" }}
          onClick={() => navigate("/admin/stores?status=pending")}
        >
          <div
            className="pe-icon-blue rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 42, height: 42, borderRadius: "10px" }}
          >
            <i className="fas fa-store-alt"></i>
          </div>
          <div className="flex-grow-1">
            <h6
              className="mb-0 fw-bold fs-6"
              style={{ color: "var(--pe-text-main)" }}
            >
              Verifikasi Toko
            </h6>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Tinjau pendaftaran baru
            </small>
          </div>
          <i className="fas fa-chevron-right text-muted opacity-50 small"></i>
        </div>

        {/* Task Card: Payout Pending */}
        <div
          className="pe-card p-3 d-flex align-items-center gap-3"
          style={{ border: "1px solid rgba(245,158,11,0.3)" }}
          onClick={() => navigate("/admin/payouts")}
        >
          <div
            className="pe-icon-gold rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 42, height: 42, borderRadius: "10px" }}
          >
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="flex-grow-1">
            <h6
              className="mb-0 fw-bold fs-6"
              style={{ color: "var(--pe-text-main)" }}
            >
              Permintaan Payout
            </h6>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Cek penarikan dana mitra
            </small>
          </div>
          <i className="fas fa-chevron-right text-muted opacity-50 small"></i>
        </div>
      </div>

      {/* 4. QUICK ACTIONS GRID */}
      <div className="px-1 mb-5">
        <h6
          className="pe-subtitle fw-bold mb-3"
          style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
        >
          SHORTCUTS
        </h6>
        <div className="row g-2">
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/admin/users")}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  marginBottom: 0,
                }}
              >
                <i className="fas fa-user-plus text-info fs-5"></i>
              </div>
              <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
                User
              </span>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/admin/promos")}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  marginBottom: 0,
                }}
              >
                <i className="fas fa-tags text-danger fs-5"></i>
              </div>
              <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
                Promo
              </span>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/admin/reports")}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  marginBottom: 0,
                }}
              >
                <i className="fas fa-chart-line text-success fs-5"></i>
              </div>
              <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
                Laporan
              </span>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/admin/settings")}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  marginBottom: 0,
                }}
              >
                <i className="fas fa-sliders-h text-secondary fs-5"></i>
              </div>
              <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
                Config
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer Extra untuk Floating Dock */}
      <div style={{ height: "100px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (CLASSIC)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <Fade direction="down" triggerOnce>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Super Admin
            </h6>
            <h2 className="pe-title display-6 mb-0">Dashboard Overview</h2>
          </Fade>
        </div>

        <div className="d-flex gap-3">
          {user && user.role === "developer" && (
            <button
              className="pe-btn-action"
              onClick={() => navigate("/developer/dashboard")}
              style={{
                borderColor: "var(--pe-accent-dev)",
                color: "var(--pe-accent-dev)",
              }}
            >
              <i className="fas fa-code me-2"></i> Switch to Dev
            </button>
          )}

          <button
            className="pe-btn-action"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS (GRID) */}
      <div className="row g-4 mb-5">
        {kpiItems.map((item, idx) => (
          <div className="col-md-6 col-xl-3" key={idx}>
            <Fade delay={idx * 100} triggerOnce>
              <Link to={item.link} className="text-decoration-none">
                <div className="pe-card h-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="pe-subtitle mb-1">{item.title}</p>
                      <h3 className="pe-title mb-0">{item.value}</h3>
                    </div>
                    <div className={`pe-stat-icon ${item.color}`}>
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                  </div>
                </div>
              </Link>
            </Fade>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="row g-4">
        <div className="col-lg-8">
          <Slide direction="left" triggerOnce>
            <div className="pe-card h-100">
              <h5 className="pe-title mb-4">Analitik Platform</h5>
              <div style={{ height: "350px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </Slide>
        </div>
        <div className="col-lg-4">
          <Slide direction="right" triggerOnce>
            <div className="pe-card h-100">
              <h5 className="pe-title mb-4">Aksi Cepat</h5>
              <div className="d-grid gap-3">
                <Link
                  to="/admin/stores"
                  className="pe-btn-action justify-content-between"
                >
                  <span>
                    <i className="fas fa-store me-2 text-info"></i>Verifikasi
                    Toko
                  </span>
                  <i className="fas fa-chevron-right small"></i>
                </Link>
                <Link
                  to="/admin/payouts"
                  className="pe-btn-action justify-content-between"
                >
                  <span>
                    <i className="fas fa-money-check-alt me-2 text-warning"></i>
                    Proses Payout
                  </span>
                  <i className="fas fa-chevron-right small"></i>
                </Link>
              </div>
            </div>
          </Slide>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-admin"></div>
      <div className="pe-blob pe-blob-2"></div>

      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default AdminDashboardPage;
