import React, { useState, useEffect } from "react";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
<<<<<<< HEAD
      const response = await fetch("/api/admin/bookings", {
=======
      const response = await fetch("import.meta.env.VITE_API_BASE_URL + "/api/admin/bookings", {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data booking.");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      alert(error.message);
=======
      showMessage(error.message);
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const token = localStorage.getItem("token");

    const originalBookings = [...bookings];
    const updatedBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    setBookings(updatedBookings);

    try {
<<<<<<< HEAD
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
=======
      const response = await fetch(`import.meta.env.VITE_API_BASE_URL + "/api/admin/bookings/${bookingId}/status`, {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });

      if (!response.ok) {
        setBookings(originalBookings);
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengubah status.");
      }
      console.log(`Status untuk booking ${bookingId} berhasil diubah.`);
    } catch (error) {
      setBookings(originalBookings);
<<<<<<< HEAD
      alert(error.message);
=======
      showMessage(error.message);
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
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

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.store?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-4">Memuat semua data booking...</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Manajemen Booking</h2>
        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Cari berdasarkan ID, nama pelanggan, atau toko..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID Booking</th>
                <th>Pelanggan</th>
                <th>Toko</th>
                <th>Layanan</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <small>{booking.id}</small>
                  </td>
                  <td>{booking.user?.name || "N/A"}</td>
                  <td>{booking.store?.name || "N/A"}</td>
                  <td>{booking.serviceName}</td>
                  <td>
                    {new Date(booking.scheduleDate).toLocaleDateString("id-ID")}
                  </td>
                  <td>Rp {booking.totalPrice.toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {/* --- INI ADALAH KOMPONEN DROPDOWN YANG DISEMPURNAKAN --- */}
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light"
                        type="button"
                        id={`dropdownMenuButton-${booking.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        disabled={
                          booking.status === "Reviewed" ||
                          booking.status === "Pending Payment"
                        }
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={`dropdownMenuButton-${booking.id}`}
                      >
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "Processing")
                            }
                            disabled={booking.status === "Processing"}
                          >
                            <i className="fas fa-sync-alt fa-fw me-2 text-warning"></i>
                            Processing
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "Completed")
                            }
                            disabled={booking.status === "Completed"}
                          >
                            <i className="fas fa-check-circle fa-fw me-2 text-success"></i>
                            Completed
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "Cancelled")
                            }
                            disabled={booking.status === "Cancelled"}
                          >
                            <i className="fas fa-times-circle fa-fw me-2 text-danger"></i>
                            Cancelled
                          </button>
                        </li>
                      </ul>
                    </div>
                    {/* --- AKHIR KOMPONEN DROPDOWN --- */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && !loading && (
            <div className="text-center p-4 text-muted">
              Data booking tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
