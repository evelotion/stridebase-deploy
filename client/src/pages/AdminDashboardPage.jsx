import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../services/apiService"; // <-- PERUBAHAN 1

const KpiCard = ({ title, value, icon, colorClass, linkTo }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <Link to={linkTo} className="text-decoration-none">
      <div className="kpi-card p-3 shadow-sm h-100">
        <div className="kpi-card-content">
          <div className="kpi-card-text">
            <h3 className="fs-2">{value}</h3>
            <p className="fs-5 text-muted mb-0">{title}</p>
          </div>
          <i className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}></i>
        </div>
      </div>
    </Link>
  </div>
);


const AdminDashboardPage = ({ showMessage }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- PERUBAHAN 2: Ganti fetch dengan apiService ---
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

  if (loading) return <div className="p-4">Memuat statistik admin...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Admin Dashboard</h2>
      <div className="row">
        <KpiCard
          title="Total Pengguna"
          value={stats?.totalUsers || 0}
          icon="fa-users"
          colorClass="primary-text"
          linkTo="/admin/users"
        />
        <KpiCard
          title="Total Toko"
          value={stats?.totalStores || 0}
          icon="fa-store"
          colorClass="secondary-text"
          linkTo="/admin/stores"
        />
        <KpiCard
          title="Total Pesanan"
          value={stats?.totalBookings || 0}
          icon="fa-receipt"
          colorClass="primary-text"
          linkTo="/admin/bookings"
        />
        <KpiCard
          title="Total Pendapatan"
          value={`Rp ${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`}
          icon="fa-money-bill-wave"
          colorClass="secondary-text"
          linkTo="/admin/reports"
        />
      </div>
      <div className="row mt-4">
        <div className="col-12">
            <div className="table-card p-3 shadow-sm">
                <h5 className="mb-3">Aktivitas Terbaru</h5>
                <p className="text-muted">Widget untuk aktivitas terbaru akan ditampilkan di sini.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;