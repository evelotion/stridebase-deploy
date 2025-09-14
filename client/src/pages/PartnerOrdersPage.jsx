// File: client/src/pages/PartnerOrdersPage.jsx (Perbaikan Final)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPartnerOrders, updateWorkStatus } from "../services/apiService";

const PartnerOrdersPage = ({ showMessage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (bookingId, newWorkStatus) => {
    try {
      await updateWorkStatus(bookingId, newWorkStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === bookingId
            ? { ...order, workStatus: newWorkStatus }
            : order
        )
      );
      if (showMessage) showMessage("Status pengerjaan berhasil diperbarui.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "reviewed":
        return "bg-success";
      case "in_progress":
        return "bg-primary";
      case "confirmed":
        return "bg-info text-dark";
      case "pending":
        return "bg-warning text-dark";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "new") return order.status === "confirmed";
        if (filter === "completed")
          return ["completed", "reviewed"].includes(order.status);
        if (filter === "cancelled") return order.status === "cancelled";
        return true;
      }),
    [orders, filter]
  );

  if (loading) return <div className="p-4">Memuat pesanan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="fs-2 mb-0">Manajemen Pesanan</h2>
        <div className="btn-group mt-2 mt-md-0">
          <button
            className={`btn ${
              filter === "all" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("all")}
          >
            Semua
          </button>
          <button
            className={`btn ${
              filter === "new" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("new")}
          >
            Baru
          </button>
          <button
            className={`btn ${
              filter === "completed" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("completed")}
          >
            Selesai
          </button>
          <button
            className={`btn ${
              filter === "cancelled" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("cancelled")}
          >
            Batal
          </button>
        </div>
      </div>
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID Pesanan</th>
                <th>Pelanggan</th>
                <th>Layanan</th>
                <th>Tanggal</th>
                <th>Status Pembayaran</th>
                <th>Status Pengerjaan</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to="#" className="fw-bold text-decoration-none">
                        #{order.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td>
                      {order.user?.name || "N/A"}
                      <small className="d-block text-muted">
                        {order.user?.email || ""}
                      </small>
                    </td>
                    <td>{order.serviceName}</td>
                    <td>
                      {new Date(order.bookingTime).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-dark`}>
                        {order.workStatus || "not_started"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-dark dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Ubah Status
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "not_started")
                              }
                            >
                              Belum Dikerjakan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "in_progress")
                              }
                            >
                              Sedang Dikerjakan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "completed")
                              }
                            >
                              Selesai
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <p className="text-muted mb-0">
                      Tidak ada pesanan dengan filter ini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerOrdersPage;
