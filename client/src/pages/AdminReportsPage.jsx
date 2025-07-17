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

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]); // State baru untuk transaksi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        // Ambil data statistik dan data transaksi secara bersamaan
        const [statsRes, transactionsRes] = await Promise.all([
          fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/transactions", {
            // Panggil API baru
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
    fetchReportsData();
  }, []);

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

  if (loading) return <div className="p-4">Memuat laporan...</div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Laporan & Analitik</h2>

      <div className="row g-3 my-2">
        <KpiCard
          title="Total Pendapatan"
          value={`Rp ${stats?.totalRevenue.toLocaleString("id-ID") || 0}`}
          icon="fa-money-bill-wave"
          colorClass="primary-text"
        />
        <KpiCard
          title="Total Transaksi"
          value={stats?.totalBookings || 0}
          icon="fa-receipt"
          colorClass="secondary-text"
        />
        <KpiCard
          title="Total Pengguna"
          value={stats?.totalUsers || 0}
          icon="fa-users"
          colorClass="primary-text"
        />
        <KpiCard
          title="Total Toko"
          value={stats?.totalStores || 0}
          icon="fa-store-alt"
          colorClass="secondary-text"
        />
      </div>

      {/* --- TABEL TRANSAKSI BARU --- */}
      <div className="row g-3 my-4">
        <div className="col-12">
          <div className="table-card p-3 shadow-sm">
            <h5 className="mb-3">Riwayat Transaksi Pembayaran</h5>
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
                  {transactions.map((payment) => (
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
                          className={`badge ${getStatusBadge(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
