import React, { useState, useEffect, useMemo } from "react";
import API_BASE_URL from "../apiConfig";

const AdminBookingsPage = ({ showMessage }) => {
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
      const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data booking.");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error(error);
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const token = localStorage.getItem("token");

    // Simpan state awal untuk rollback jika terjadi error
    const originalBookings = [...bookings];

    try {
      // Tidak melakukan optimistic update untuk alur approval
      const response = await fetch(
        `${API_BASE_URL}/api/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newStatus }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status.");
      }
      
      // Tampilkan pesan dari server
      showMessage(data.message);
      
      // Jika statusnya bukan 202 (Accepted), berarti update berhasil dan kita refresh data
      if (response.status !== 202) {
          fetchBookings(); 
      }
      
    } catch (error) {
      // Kembalikan ke state semula jika error
      setBookings(originalBookings);
      showMessage(error.message);
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
        <div className="table-responsive d-none d-lg-block">
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
                    {booking.status === "Pending Payment" ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleStatusChange(booking.id, "Processing")}
                        title="Ajukan konfirmasi pembayaran manual ke Developer"
                      >
                        <i className="fas fa-check-double me-1"></i> Konfirmasi Bayar
                      </button>
                    ) : (
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          id={`dropdownMenuButton-${booking.id}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          disabled={
                            booking.status === "Reviewed"
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
                    )}
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

        <div className="mobile-card-list d-lg-none">
          {filteredBookings.map((booking) => (
            <div className="mobile-card" key={booking.id}>
              <div className="mobile-card-header">
                <div>
                  <span className="fw-bold">{booking.user?.name || "N/A"}</span>
                  <small className="d-block text-muted">{booking.id}</small>
                </div>
                <span className={`badge ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <small>Toko</small>
                  <span>{booking.store?.name || "N/A"}</span>
                </div>
                <div className="mobile-card-row">
                  <small>Layanan</small>
                  <span>{booking.serviceName}</span>
                </div>
                <div className="mobile-card-row">
                  <small>Total</small>
                  <span>Rp {booking.totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="mobile-card-footer">
                {/* Aksi mobile bisa ditambahkan di sini jika perlu */}
                <small>
                  Tanggal:{" "}
                  {new Date(booking.scheduleDate).toLocaleDateString("id-ID")}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;