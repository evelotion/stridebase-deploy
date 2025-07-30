import React, { useState, useEffect } from "react";
import API_BASE_URL from '../apiConfig.js';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data statistik.");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const KpiCard = ({ title, value, icon, colorClass }) => (
    <div className="col-md-3">
      <div className="kpi-card p-3 shadow-sm d-flex justify-content-around align-items-center">
        <div>
          <h3 className="fs-2">{value}</h3>
          <p className="fs-5 text-muted">{title}</p>
        </div>
        <i
          className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}
        ></i>
      </div>
    </div>
  );

  if (loading) return <div className="p-4">Memuat statistik...</div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Dashboard</h2>
      <div className="row g-3 my-2">
        <KpiCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon="fa-receipt"
          colorClass="primary-text"
        />
        <KpiCard
          title="Total Revenue"
          value={`Rp ${stats?.totalRevenue.toLocaleString("id-ID") || 0}`}
          icon="fa-money-bill-wave"
          colorClass="secondary-text"
        />
        <KpiCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="fa-users"
          colorClass="primary-text"
        />
        <KpiCard
          title="Total Stores"
          value={stats?.totalStores || 0}
          icon="fa-store-alt"
          colorClass="secondary-text"
        />
      </div>
      {/* Area untuk chart dan tabel lainnya bisa ditambahkan di sini */}
    </div>
  );
};

export default AdminDashboardPage;
