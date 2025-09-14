// File: client/src/pages/PartnerDashboardPage.jsx (Perbaikan Final)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getPartnerDashboard,
  getOutstandingInvoices,
  getPartnerSettings,
} from "../services/apiService";

const KpiCard = ({ title, value, icon, colorClass, linkTo }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    {" "}
    {/* Diubah menjadi 4 kolom */}
    <Link to={linkTo} className="text-decoration-none">
      <div className="kpi-card p-3 shadow-sm h-100">
        <div className="kpi-card-content">
          <div className="kpi-card-text">
            <h3 className="fs-2">{value}</h3>
            <p className="fs-5 text-muted mb-0">{title}</p>
          </div>
          <i
            className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}
          ></i>
        </div>
      </div>
    </Link>
  </div>
);

const PartnerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      setLoading(true);
      try {
        const [statsData, invoicesData, storeData] = await Promise.all([
          getPartnerDashboard(),
          getOutstandingInvoices(),
          getPartnerSettings(),
        ]);
        setStats(statsData);
        setOutstandingInvoices(invoicesData);
        setStore(storeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "bg-success";
      case "in_progress":
        return "bg-primary";
      case "confirmed":
        return "bg-info text-dark";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  if (loading) return <div className="p-4">Memuat statistik toko...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center mb-4">
        <h2 className="fs-2 mb-0 me-3">
          Dashboard: {stats?.storeName || "Toko Anda"}
        </h2>
        {store?.tier === "PRO" && (
          <span className="badge bg-warning text-dark fs-6">
            <i className="fas fa-crown me-1"></i> PRO
          </span>
        )}
      </div>

      {outstandingInvoices.length > 0 && (
        <div className="alert alert-danger">
          Anda memiliki <strong>{outstandingInvoices.length}</strong> tagihan
          yang belum dibayar.
        </div>
      )}

      <div className="row">
        <KpiCard
          title="Total Pendapatan"
          value={`Rp ${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`}
          icon="fa-money-bill-wave"
          colorClass="text-success"
          linkTo="/partner/reports"
        />
        <KpiCard
          title="Pesanan Baru"
          value={stats?.newOrders || 0}
          icon="fa-receipt"
          colorClass="text-info"
          linkTo="/partner/orders"
        />
        <KpiCard
          title="Pesanan Selesai"
          value={stats?.completedOrders || 0}
          icon="fa-check-circle"
          colorClass="text-primary"
          linkTo="/partner/orders"
        />
        <KpiCard
          title="Total Pelanggan"
          value={stats?.totalCustomers || 0}
          icon="fa-users"
          colorClass="text-secondary"
          linkTo="#"
        />
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="table-card p-3 shadow-sm">
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
