// File: client/src/pages/AdminReportsPage.jsx

import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { Line } from "react-chartjs-2";
import { getAdminStats } from "../services/apiService";
import "../styles/ElevateDashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminReportsPage = ({ showMessage }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        if (showMessage) showMessage("Gagal memuat laporan", "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [showMessage]);

  const mobileChartData = {
    labels: ["M", "S", "S", "R", "K", "J", "S"],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      <div
        className="sticky-top px-3 py-3"
        style={{ background: "var(--pe-bg)", zIndex: 1020 }}
      >
        <h2 className="pe-title mb-0 fs-4">Laporan</h2>
        <p className="small" style={{ color: "var(--pe-text-muted)" }}>
          Ringkasan performa minggu ini
        </p>
      </div>

      <div className="px-3">
        <div className="pe-card p-3 mb-4">
          <h6 className="fw-bold mb-3">Tren Pendapatan</h6>
          <div style={{ height: "150px" }}>
            <Line
              data={mobileChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-6">
            <div className="pe-card p-3 text-center">
              <small
                className="d-block mb-1"
                style={{ color: "var(--pe-text-muted)" }}
              >
                Total Order
              </small>
              <h4
                className="fw-bold mb-0"
                style={{ color: "var(--pe-text-main)" }}
              >
                {stats?.totalBookings}
              </h4>
            </div>
          </div>
          <div className="col-6">
            <div className="pe-card p-3 text-center">
              <small
                className="d-block mb-1"
                style={{ color: "var(--pe-text-muted)" }}
              >
                Total Revenue
              </small>
              <h4 className="fw-bold text-success mb-0">
                {new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
                  stats?.totalRevenue || 0
                )}
              </h4>
            </div>
          </div>
          <div className="col-6">
            <div className="pe-card p-3 text-center">
              <small
                className="d-block mb-1"
                style={{ color: "var(--pe-text-muted)" }}
              >
                Users
              </small>
              <h4 className="fw-bold text-info mb-0">{stats?.totalUsers}</h4>
            </div>
          </div>
          <div className="col-6">
            <div className="pe-card p-3 text-center">
              <small
                className="d-block mb-1"
                style={{ color: "var(--pe-text-muted)" }}
              >
                Mitra
              </small>
              <h4 className="fw-bold text-warning mb-0">
                {stats?.totalStores}
              </h4>
            </div>
          </div>
        </div>

        <button className="btn btn-outline-secondary w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2">
          <i className="fas fa-file-download"></i> Unduh Laporan PDF
        </button>
      </div>
      <div style={{ height: "80px" }}></div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="d-none d-lg-block">
      <Fade direction="down" triggerOnce>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Analitik
            </h6>
            <h2 className="pe-title mb-0">Laporan Keuangan & Performa</h2>
          </div>
          <button className="pe-btn-action">
            <i className="fas fa-download me-2"></i> Export Data
          </button>
        </div>
      </Fade>
      <Fade triggerOnce>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="pe-card h-100">
              <h5 className="mb-4">Grafik Pendapatan Bulanan</h5>
              <div
                style={{ height: "300px", color: "var(--pe-text-muted)" }}
                className="d-flex align-items-center justify-content-center border border-dashed rounded-3"
              >
                [Chart Placeholder - Full Version]
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="pe-card h-100">
              <h5 className="mb-4">Top Performing Stores</h5>
              <ul className="list-group list-group-flush">
                {/* FIX: List Item Text Color */}
                <li
                  className="list-group-item bg-transparent d-flex justify-content-between"
                  style={{ color: "var(--pe-text-main)" }}
                >
                  <span>Sneakers Clean JKT</span>
                  <span className="fw-bold text-success">Rp 15jt</span>
                </li>
                <li
                  className="list-group-item bg-transparent d-flex justify-content-between"
                  style={{ color: "var(--pe-text-main)" }}
                >
                  <span>Shoes Care BDG</span>
                  <span className="fw-bold text-success">Rp 12jt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-2"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default AdminReportsPage;
