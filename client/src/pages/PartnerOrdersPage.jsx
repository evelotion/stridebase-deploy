import React, { useState, useEffect } from "react";

const PartnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch("/api/partner/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data pesanan.");
      }
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleWorkStatusChange = async (bookingId, newWorkStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `/api/partner/orders/${bookingId}/work-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newWorkStatus }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal mengubah status pengerjaan.");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === bookingId
            ? { ...order, workStatus: newWorkStatus }
            : order
        )
      );
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Reviewed":
        return "bg-success";
      case "Processing":
        return "bg-primary";
      case "Pending Payment":
        return "bg-warning text-dark";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getWorkStatusLabel = (workStatus) => {
    const labels = {
      RECEIVED: "Diterima",
      WASHING: "Pencucian",
      DRYING: "Pengeringan",
      QUALITY_CHECK: "Pengecekan Kualitas",
      READY_FOR_PICKUP: "Siap Diambil",
    };
    return labels[workStatus] || "N/A";
  };

  if (loading) return <div className="p-4">Memuat data pesanan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Manajemen Pesanan</h2>
      </div>

      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Pelanggan</th>
                <th>Detail Pesanan</th>
                <th>Jadwal</th>
                <th>Status Pembayaran</th>
                <th>Status Pengerjaan</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="fw-bold">{order.user.name}</span>
                    <small className="d-block text-muted">
                      {order.user.email}
                    </small>
                  </td>
                  <td>
                    <span className="fw-bold">{order.serviceName}</span>
                    <small className="d-block text-muted">ID: {order.id}</small>
                  </td>
                  <td>
                    {new Date(order.scheduleDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.workStatus || "RECEIVED"}
                      onChange={(e) =>
                        handleWorkStatusChange(order.id, e.target.value)
                      }
                      disabled={
                        order.status !== "Processing" &&
                        order.status !== "Completed" &&
                        order.status !== "Reviewed"
                      }
                    >
                      <option value="RECEIVED">Diterima</option>
                      <option value="WASHING">Pencucian</option>
                      <option value="DRYING">Pengeringan</option>
                      <option value="QUALITY_CHECK">Pengecekan Kualitas</option>
                      <option value="READY_FOR_PICKUP">Siap Diambil</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerOrdersPage;
