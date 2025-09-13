// File: client/src/pages/AdminBookingsPage.jsx (Versi Lengkap & Fungsional)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllBookingsForAdmin,
  updateBookingStatusByAdmin,
} from "../services/apiService";

const AdminBookingsPage = ({ showMessage }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookingsForAdmin();
      setBookings(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const result = await updateBookingStatusByAdmin(bookingId, newStatus);
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      if (showMessage)
        showMessage(result.message || "Status berhasil diperbarui.");
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

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        booking.id.toLowerCase().includes(searchLower) ||
        (booking.user?.name || "").toLowerCase().includes(searchLower) ||
        (booking.store?.name || "").toLowerCase().includes(searchLower);

      const matchesStatus =
        filterStatus === "all" || booking.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, filterStatus]);

  if (loading) return <div className="p-4">Memuat semua data pesanan...</div>;
  if (error && bookings.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Semua Pesanan</h2>

      <div className="card card-account p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Cari berdasarkan ID, nama pelanggan, atau toko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card p-3 shadow-sm">
        {/* Tampilan Desktop */}
        <div className="table-responsive d-none d-lg-block">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID Pesanan</th>
                <th>Pelanggan</th>
                <th>Toko</th>
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
                    <small className="text-muted">
                      #{booking.id.substring(0, 8)}
                    </small>
                  </td>
                  <td>{booking.user?.name || "N/A"}</td>
                  <td>{booking.store?.name || "N/A"}</td>
                  <td>
                    {new Date(booking.bookingTime).toLocaleDateString("id-ID")}
                  </td>
                  <td>Rp {booking.totalPrice.toLocaleString("id-ID")}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        disabled={booking.status === "reviewed"}
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "confirmed")
                            }
                          >
                            <i className="fas fa-check fa-fw me-2 text-info"></i>
                            Konfirmasi
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "in_progress")
                            }
                          >
                            <i className="fas fa-sync-alt fa-fw me-2 text-primary"></i>
                            Sedang Dikerjakan
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "completed")
                            }
                          >
                            <i className="fas fa-check-circle fa-fw me-2 text-success"></i>
                            Selesai
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleStatusChange(booking.id, "cancelled")
                            }
                          >
                            <i className="fas fa-times-circle fa-fw me-2 text-danger"></i>
                            Batalkan
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tampilan Mobile */}
        <div className="mobile-card-list d-lg-none">
          {filteredBookings.map((booking) => (
            <div className="mobile-card" key={booking.id}>
              <div className="mobile-card-header">
                <div>
                  <span className="fw-bold">{booking.user?.name || "N/A"}</span>
                  <small className="d-block text-muted">
                    #{booking.id.substring(0, 8)}
                  </small>
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
                  <small>Total</small>
                  <span>Rp {booking.totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="mobile-card-footer d-flex justify-content-between align-items-center">
                <small>
                  {new Date(booking.bookingTime).toLocaleDateString("id-ID")}
                </small>
                {/* Tombol aksi untuk mobile bisa ditambahkan di sini jika perlu */}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center p-4 text-muted">
            Data pesanan tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
