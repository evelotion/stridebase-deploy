// File: stridebase-app/client/src/pages/AdminReportsPage.jsx

import React, { useState, useEffect } from "react";

const KpiCard = ({ title, value, icon, colorClass }) => (
  <div className="col-lg-3 col-md-6">
    <div className="kpi-card p-3 shadow-sm d-flex justify-content-around align-items-center h-100">
      <div>
        <h3 className="fs-2">{value}</h3>
        <p className="fs-5 text-muted mb-0">{title}</p>
      </div>
      <i
        className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}
      ></i>
    </div>
  </div>
);

// --- KOMPONEN BARU UNTUK GRAFIK ---
const RevenueChart = ({ data }) => {
  // Mengelompokkan pendapatan per hari dari data transaksi
  const dailyRevenue = data.reduce((acc, payment) => {
    if (payment.status === "SUCCESS") {
      const date = new Date(payment.createdAt).toLocaleDateString("id-ID");
      acc[date] = (acc[date] || 0) + payment.amount;
    }
    return acc;
  }, {});

  const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }));
  const maxValue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="table-card p-4 shadow-sm">
      <h5 className="mb-3">Grafik Pendapatan Berdasarkan Filter</h5>
      <div
        className="d-flex justify-content-around align-items-end"
        style={{
          height: "250px",
          borderLeft: "1px solid #ccc",
          borderBottom: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {chartData.length > 0 ? (
          chartData.map((day, index) => (
            <div
              key={index}
              className="text-center d-flex flex-column justify-content-end align-items-center"
              style={{ height: "100%" }}
            >
              <div
                className="bg-success rounded-top"
                style={{
                  height: `${(day.revenue / maxValue) * 100}%`,
                  width: "40px",
                  transition: "height 0.5s ease-out",
                }}
                title={`Rp ${day.revenue.toLocaleString("id-ID")}`}
              ></div>
              <small className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                {day.date.split("/")[0]}/${day.date.split("/")[1]}
              </small>
            </div>
          ))
        ) : (
          <p className="text-muted align-self-center">
            Tidak ada data pendapatan pada rentang tanggal ini.
          </p>
        )}
      </div>
    </div>
  );
};

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BARU UNTUK FILTER TANGGAL ---
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(
    sevenDaysAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  useEffect(() => {
    fetchReportsData();
  }, []); // Hanya dijalankan sekali saat mount

  const fetchReportsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ startDate, endDate });

    try {
      const [statsRes, transactionsRes] = await Promise.all([
        fetch("import.meta.env.VITE_API_BASE_URL + "/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`import.meta.env.VITE_API_BASE_URL + "/api/admin/transactions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!statsRes.ok || !transactionsRes.ok) {
        throw new Error("Gagal mengambil data laporan.");
      }

      const statsData = await statsRes.json();
      const transactionsData = await transactionsRes.json();

      setStats(statsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-success";
      case "PENDING":
        return "bg-warning text-dark";
      case "FAILED":
        return "bg-danger";
      case "CANCELLED":
        return "bg-secondary";
      default:
        return "bg-dark";
    }
  };

  // Fungsi untuk handle klik tombol filter
  const handleFilter = () => {
    fetchReportsData();
  };

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Laporan & Analitik</h2>

      {/* --- KPI Cards tidak berubah, hanya data loading dipindah --- */}
      {!loading && stats && (
        <div className="row g-3 my-2">
          <KpiCard
            title="Gross Volume Transaksi"
            value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
            icon="fa-money-bill-wave"
            colorClass="primary-text"
          />

          {/* ### TAMBAHKAN KARTU BARU INI ### */}
          <KpiCard
            title="Pendapatan Platform"
            value={`Rp ${stats.platformRevenue.toLocaleString("id-ID")}`}
            icon="fa-hand-holding-usd"
            colorClass="secondary-text"
          />
          {/* ################################# */}

          <KpiCard
            title="Total Pengguna"
            value={stats.totalUsers}
            icon="fa-users"
            colorClass="primary-text"
          />
          <KpiCard
            title="Total Toko"
            value={stats.totalStores}
            icon="fa-store-alt"
            colorClass="secondary-text"
          />
        </div>
      )}

      {/* --- BLOK FILTER DIMODIFIKASI --- */}
      <div className="row g-3 my-4">
        <div className="col-12">
          <div className="table-card p-3 shadow-sm">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label htmlFor="startDate" className="form-label">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="endDate" className="form-label">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleFilter}
                  disabled={loading}
                >
                  {loading ? "Memuat..." : "Terapkan Filter"}
                </button>
              </div>
              <div className="col-md-3">
                <a
                  href={`import.meta.env.VITE_API_BASE_URL + "/api/admin/export/transactions?startDate=${startDate}&endDate=${endDate}`}
                  className="btn btn-outline-success w-100"
                  download
                >
                  <i className="fas fa-file-csv me-2"></i>Ekspor ke CSV
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          {loading ? (
            <p>Memuat grafik...</p>
          ) : (
            <RevenueChart data={transactions} />
          )}
        </div>
      </div>
      {/* --- AKHIR BLOK BARU --- */}

      <div className="row g-3 my-4">
        <div className="col-12">
          <div className="table-card p-3 shadow-sm">
            <h5 className="mb-3">
              Riwayat Transaksi Pembayaran (Berdasarkan Filter)
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Pengguna</th>
                    <th>Toko</th>
                    <th>Tanggal</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Memuat transaksi...
                      </td>
                    </tr>
                  ) : (
                    transactions.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <small>{payment.bookingId}</small>
                        </td>
                        <td>{payment.booking.user.name}</td>
                        <td>{payment.booking.store.name}</td>
                        <td>
                          {new Date(payment.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td>Rp {payment.amount.toLocaleString("id-ID")}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadge(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Tidak ada data transaksi ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
