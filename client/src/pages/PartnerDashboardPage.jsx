import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="table-card p-3 shadow-sm">
      <h5 className="mb-3">Pendapatan 7 Hari Terakhir</h5>
      <div
        className="d-flex justify-content-around align-items-end"
        style={{ height: "200px" }}
      >
        {data.map((day, index) => (
          <div key={index} className="text-center">
            <div
              className="bg-primary rounded-top"
              style={{
                height: `${(day.revenue / maxValue) * 100}%`,
                width: "30px",
                transition: "height 0.5s ease-out",
              }}
              title={`Rp ${day.revenue.toLocaleString("id-ID")}`}
            ></div>
            <small className="text-muted">{day.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

const PartnerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchPartnerStats = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const [statsRes, invoicesRes, storeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/partner/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/partner/invoices/outstanding`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/partner/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !invoicesRes.ok || !storeRes.ok) {
          throw new Error("Gagal mengambil data dasbor.");
        }

        const statsData = await statsRes.json();
        const invoicesData = await invoicesRes.json();
        const storeData = await storeRes.json();

        setStats(statsData);
        setOutstandingInvoices(invoicesData);
        setStore(storeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Reviewed":
        return "bg-success";
      case "Processing":
        return "bg-warning text-dark";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  if (loading) return <div className="p-4">Memuat statistik toko...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex align-items-center m-4">
        <h2 className="fs-2 mb-0 me-3">
          Dashboard: {stats?.storeName || "Toko Anda"}
        </h2>
        {store?.tier === "PRO" && (
          <span className="badge bg-warning text-dark fs-6">
            <i className="fas fa-crown me-1"></i> PRO
          </span>
        )}
        {store?.tier === "BASIC" && (
          <span className="badge bg-light text-dark fs-6">BASIC</span>
        )}
      </div>

      {outstandingInvoices.length > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <span>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Anda memiliki <strong>{outstandingInvoices.length}</strong> tagihan
            yang belum dibayar.
          </span>
          <Link
            to={`/partner/invoices/${outstandingInvoices[0].id}`}
            className="btn btn-sm btn-dark"
          >
            Lihat & Bayar
          </Link>
        </div>
      )}
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

      <div className="row g-3 my-4">
        <div className="col-md-7">
          {stats?.revenueLast7Days && (
            <RevenueChart data={stats.revenueLast7Days} />
          )}
        </div>
        <div className="col-md-5">
          <div className="table-card p-3 shadow-sm h-100">
            <h5 className="mb-3">Pesanan Terbaru</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <tbody>
                  {stats?.recentOrders?.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="fw-bold">{order.customerName}</span>
                        <small className="d-block text-muted">
                          {order.serviceName}
                        </small>
                      </td>
                      <td className="text-end">
                        <span
                          className={`badge ${getStatusBadge(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-center text-muted small mt-3">
                  Belum ada pesanan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;