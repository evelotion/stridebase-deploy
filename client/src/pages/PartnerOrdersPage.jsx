import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPartnerOrders, updateWorkStatus } from "../services/apiService";

const PartnerOrdersPage = ({ showMessage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

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
      // Optimistic update: langsung ubah state tanpa fetch ulang
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
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
      case "Completed":
      case "Reviewed":
        return "bg-success";
      case "Processing":
        return "bg-primary";
      case "Cancelled":
        return "bg-danger";
      case "Pending Payment":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  const getWorkStatusBadge = (status) => {
    switch (status) {
      case "RECEIVED":
        return "bg-info text-dark";
      case "WASHING":
        return "bg-primary";
      case "DRYING":
        return "bg-warning text-dark";
      case "READY_FOR_PICKUP":
        return "bg-success";
      default:
        return "bg-light text-dark";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    if (filter === "New") return order.status === "Processing";
    if (filter === "Completed")
      return order.status === "Completed" || order.status === "Reviewed";
    if (filter === "Cancelled") return order.status === "Cancelled";
    return true;
  });

  if (loading) return <div className="p-4">Memuat pesanan...</div>;
  if (error && orders.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="fs-2 mb-0">Manajemen Pesanan</h2>
        <div className="btn-group mt-2 mt-md-0">
          <button
            className={`btn ${
              filter === "All" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("All")}
          >
            Semua
          </button>
          <button
            className={`btn ${
              filter === "New" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("New")}
          >
            Baru
          </button>
          <button
            className={`btn ${
              filter === "Completed" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("Completed")}
          >
            Selesai
          </button>
          <button
            className={`btn ${
              filter === "Cancelled" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setFilter("Cancelled")}
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
                      <Link
                        to={`/partner/orders/${order.id}`}
                        className="fw-bold text-decoration-none"
                      >
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
                      {new Date(order.scheduleDate).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getWorkStatusBadge(
                          order.workStatus
                        )}`}
                      >
                        {order.workStatus || "Belum Diterima"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-dark dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Ubah Status
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "RECEIVED")
                              }
                            >
                              Diterima
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "WASHING")
                              }
                            >
                              Dicuci
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "DRYING")
                              }
                            >
                              Dikeringkan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(order.id, "READY_FOR_PICKUP")
                              }
                            >
                              Siap Diambil
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
