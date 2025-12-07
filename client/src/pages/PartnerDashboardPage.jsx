// File: client/src/pages/PartnerDashboardPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
// PERBAIKAN: Gunakan updatePartnerStoreStatus agar tidak bentrok dengan fungsi admin
import {
  getPartnerStats,
  updatePartnerStoreStatus,
} from "../services/apiService";
import "../pages/PartnerElevate.css"; // Gunakan CSS Partner

// Swiper untuk Mobile Cards
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const PartnerDashboardPage = ({ showMessage }) => {
  const [stats, setStats] = useState(null);
  const [storeStatus, setStoreStatus] = useState("open"); // open/closed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const user = JSON.parse(localStorage.getItem("user")); // (Optional jika butuh data user)

  useEffect(() => {
    // Fetch Data Real dari API
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPartnerStats();
        if (data) {
          setStats(data);
          // Mapping status dari backend (active/inactive) ke UI (open/closed)
          setStoreStatus(data.storeStatus === "active" ? "open" : "closed");
        }
      } catch (err) {
        console.error("Gagal memuat statistik:", err);
        // Jika gagal, set default stats agar tidak crash
        setStats({
          todayRevenue: 0,
          todayOrders: 0,
          totalRevenue: 0,
          completedOrders: 0,
          activeOrders: 0,
          rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleStore = async () => {
    // 1. Simpan status lama untuk rollback jika gagal
    const oldStatus = storeStatus;
    // 2. Tentukan status baru
    const newStatus = storeStatus === "open" ? "closed" : "open";

    // 3. Optimistic Update (Ubah UI duluan agar terasa cepat)
    setStoreStatus(newStatus);

    try {
      // 4. Panggil API dengan status yang sesuai backend (active/inactive)
      await updatePartnerStoreStatus(
        newStatus === "open" ? "active" : "inactive"
      );

      if (showMessage) {
        showMessage(
          `Toko sekarang ${newStatus === "open" ? "BUKA" : "TUTUP"}`,
          "Success"
        );
      }
    } catch (err) {
      console.error("Gagal update status toko:", err);
      // 5. Rollback jika error
      setStoreStatus(oldStatus);
      if (showMessage)
        showMessage("Gagal mengubah status toko. Coba lagi.", "Error");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (MERCHANT APP STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. STORE STATUS CARD (CRITICAL) */}
      <div className="px-3 pt-3 mb-3">
        <div className="pe-store-status-card">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                storeStatus === "open" ? "bg-success" : "bg-secondary"
              }`}
              style={{ width: 40, height: 40 }}
            >
              <i
                className={`fas ${
                  storeStatus === "open" ? "fa-store" : "fa-store-slash"
                } text-white`}
              ></i>
            </div>
            <div>
              <h6 className="text-white fw-bold mb-0">
                {storeStatus === "open" ? "Toko Buka" : "Toko Tutup"}
              </h6>
              <small className="text-white-50" style={{ fontSize: "0.7rem" }}>
                {storeStatus === "open"
                  ? "Menerima pesanan"
                  : "Tidak menerima pesanan"}
              </small>
            </div>
          </div>

          {/* Custom Toggle Switch */}
          <div
            className={`pe-toggle-switch ${
              storeStatus === "open" ? "active" : ""
            }`}
            onClick={handleToggleStore}
            style={{ cursor: "pointer" }}
          >
            <div className="pe-toggle-thumb"></div>
          </div>
        </div>
      </div>

      {/* 2. REVENUE CARD (TODAY) */}
      <div className="px-3 mb-4">
        <div className="pe-card p-4 text-center">
          <small
            className="text-muted text-uppercase tracking-widest"
            style={{ fontSize: "0.7rem" }}
          >
            Pendapatan Hari Ini
          </small>
          <h2 className="pe-title my-2 fs-1">
            {formatCurrency(stats?.todayRevenue)}
          </h2>
          <div className="d-flex justify-content-center gap-2 align-items-center">
            <span className="badge bg-success bg-opacity-20 text-success rounded-pill">
              <i className="fas fa-arrow-up me-1"></i> {stats?.todayOrders || 0}{" "}
              Order
            </span>
          </div>
        </div>
      </div>

      {/* 3. MENU GRID SHORTCUTS */}
      <div className="px-3 mb-4">
        <h6 className="text-muted small fw-bold mb-3 ps-1">Menu Cepat</h6>
        <div className="row g-2">
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/partner/orders")}
              style={{ cursor: "pointer" }}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center p-0"
                style={{ width: 56, height: 56, borderRadius: "16px" }}
              >
                <i className="fas fa-receipt text-primary fs-5"></i>
              </div>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Pesanan
              </small>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/partner/services")}
              style={{ cursor: "pointer" }}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center p-0"
                style={{ width: 56, height: 56, borderRadius: "16px" }}
              >
                <i className="fas fa-box text-warning fs-5"></i>
              </div>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Produk
              </small>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/partner/promos")}
              style={{ cursor: "pointer" }}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center p-0"
                style={{ width: 56, height: 56, borderRadius: "16px" }}
              >
                <i className="fas fa-tags text-danger fs-5"></i>
              </div>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Promo
              </small>
            </div>
          </div>
          <div className="col-3">
            <div
              className="d-flex flex-column align-items-center gap-2"
              onClick={() => navigate("/partner/reports")}
              style={{ cursor: "pointer" }}
            >
              <div
                className="pe-card d-flex align-items-center justify-content-center p-0"
                style={{ width: 56, height: 56, borderRadius: "16px" }}
              >
                <i className="fas fa-chart-pie text-success fs-5"></i>
              </div>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Laporan
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ORDERS LIST */}
      <div className="px-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted small fw-bold mb-0 ps-1">
            Pesanan Terbaru
          </h6>
          <Link
            to="/partner/orders"
            className="text-primary small text-decoration-none fw-bold"
          >
            Lihat Semua
          </Link>
        </div>

        {/* List Pesanan (Bisa diambil dari stats.recentOrders jika ada, atau dummy fallback) */}
        <div className="d-flex flex-column gap-2">
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="text-center text-muted py-3 small">
              Belum ada pesanan terbaru.
            </div>
          ) : (
            stats.recentOrders.map((order, i) => (
              <div
                className="pe-card p-3 d-flex justify-content-between align-items-center"
                key={order.id || i}
                onClick={() => navigate(`/partner/orders`)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40 }}
                  >
                    <i className="fas fa-shoe-prints"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold fs-6">
                      {order.serviceName || "Layanan Sepatu"}
                    </h6>
                    <small className="text-muted">
                      Order #{order.id ? order.id.slice(-6) : `ORD-${100 + i}`}
                    </small>
                  </div>
                </div>
                <div className="text-end">
                  <span className="pe-badge pe-badge-warning mb-1">
                    {order.status || "Baru"}
                  </span>
                  <small className="d-block text-white fw-bold">
                    {formatCurrency(order.totalPrice || 0)}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (DASHBOARD GRID)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Overview
            </h6>
            <h2 className="pe-title display-6 mb-0">Dashboard Mitra</h2>
          </div>
        </Fade>

        <div className="d-flex gap-3 align-items-center">
          <span
            className={`pe-badge ${
              storeStatus === "open" ? "pe-badge-success" : "pe-badge-danger"
            } px-3 py-2 fs-6`}
          >
            {storeStatus === "open" ? "TOKO BUKA" : "TOKO TUTUP"}
          </span>
          <button className="pe-btn-action" onClick={handleToggleStore}>
            <i className="fas fa-power-off me-2"></i> Ubah Status
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        {[
          {
            title: "Total Pendapatan",
            val: formatCurrency(stats?.totalRevenue),
            icon: "fa-wallet",
            color: "pe-icon-green",
          },
          {
            title: "Pesanan Selesai",
            val: stats?.completedOrders || 0,
            icon: "fa-check-circle",
            color: "pe-icon-blue",
          },
          {
            title: "Pesanan Aktif",
            val: stats?.activeOrders || 0,
            icon: "fa-clock",
            color: "pe-icon-gold",
          },
          {
            title: "Rating Toko",
            val: stats?.rating ? Number(stats.rating).toFixed(1) : "0.0",
            icon: "fa-star",
            color: "pe-icon-red",
          },
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <Fade delay={idx * 100} triggerOnce>
              <div className="pe-card h-100">
                <div className={`pe-stat-icon ${item.color}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3 className="pe-title mb-1">{item.val}</h3>
                <p className="pe-subtitle small mb-0">{item.title}</p>
              </div>
            </Fade>
          </div>
        ))}
      </div>

      {/* Tambahan: Grafik atau Tabel Singkat Desktop bisa ditambahkan di sini jika ada */}
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-1"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default PartnerDashboardPage;
