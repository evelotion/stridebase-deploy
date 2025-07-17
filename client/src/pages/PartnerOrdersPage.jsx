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

  const handleStatusChange = async (bookingId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal mengubah status pesanan.");

      alert("Status pesanan berhasil diperbarui.");
      // Muat ulang data untuk melihat perubahan
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === bookingId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

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
                <th>ID Booking</th>
                <th>Pelanggan</th>
                <th>Layanan</th>
                <th>Jadwal</th>
                <th>Total</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <small>{order.id}</small>
                  </td>
                  <td>
                    <span className="fw-bold">{order.user.name}</span>
                    <small className="d-block text-muted">
                      {order.user.email}
                    </small>
                  </td>
                  <td>{order.serviceName}</td>
                  <td>
                    {new Date(order.scheduleDate).toLocaleDateString("id-ID")}
                  </td>
                  <td>Rp {order.totalPrice.toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      disabled={
                        order.status === "Reviewed" ||
                        order.status === "Cancelled"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
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
