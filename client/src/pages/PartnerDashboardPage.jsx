import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Komponen KPI Card untuk menampilkan statistik
const KpiCard = ({ title, value, icon, colorClass, linkTo }) => (
  <div className="col-lg-3 col-md-6">
    <Link to={linkTo} className="text-decoration-none">
      <div className="kpi-card p-3 shadow-sm d-flex justify-content-around align-items-center h-100">
        <div>
          <h3 className="fs-2">{value}</h3>
          <p className="fs-5 text-muted mb-0">{title}</p>
        </div>
        <i
          className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}
        ></i>
      </div>
    </Link>
  </div>
);

const PartnerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartnerStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/partner/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil data statistik toko."
          );
        }
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerStats();
  }, []);

  if (loading) return <div className="p-4">Memuat statistik toko...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Dashboard: {stats?.storeName || "Toko Anda"}</h2>
      <div className="row g-3 my-2">
        <KpiCard
          title="Total Pendapatan"
          value={`Rp ${stats?.totalRevenue.toLocaleString("id-ID") || 0}`}
          icon="fa-money-bill-wave"
          colorClass="primary-text"
          linkTo="/partner/orders"
        />
        <KpiCard
          title="Pesanan Baru"
          value={stats?.newOrders || 0}
          icon="fa-receipt"
          colorClass="secondary-text"
          linkTo="/partner/orders"
        />
        <KpiCard
          title="Pesanan Selesai"
          value={stats?.completedOrders || 0}
          icon="fa-check-circle"
          colorClass="primary-text"
          linkTo="/partner/orders"
        />
        <KpiCard
          title="Total Pelanggan"
          value={stats?.totalCustomers || 0}
          icon="fa-users"
          colorClass="secondary-text"
          linkTo="#"
        />
      </div>
      {/* Di sini nanti bisa kita tambahkan grafik atau daftar pesanan terbaru */}
    </div>
  );
};

export default PartnerDashboardPage;