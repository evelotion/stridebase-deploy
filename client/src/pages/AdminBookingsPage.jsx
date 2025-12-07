// File: client/src/pages/AdminBookingsPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getAllBookingsForAdmin,
  updateBookingStatusByAdmin,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

// --- COMPONENT: PAGINATION (Sama seperti AdminUsersPage) ---
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(pageCount, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-between align-items-center pt-3">
      <span style={{ fontSize: "0.8rem", color: "var(--pe-text-muted)" }}>
        Halaman {currentPage} dari {pageCount}
      </span>
      <div className="d-flex gap-1">
        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="d-flex gap-1">
          {pages.map((num) => (
            <button
              key={num}
              className={`pe-btn-action py-1 px-2 ${
                currentPage === num ? "active" : ""
              }`}
              onClick={() => onPageChange(num)}
              style={
                currentPage === num
                  ? {
                      background: "var(--pe-accent)",
                      borderColor: "var(--pe-accent)",
                      color: "#fff",
                      fontSize: "0.8rem",
                    }
                  : { opacity: 0.7, fontSize: "0.8rem" }
              }
            >
              {num}
            </button>
          ))}
        </div>

        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

const AdminBookingsPage = ({ showMessage }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State untuk Mobile Bottom Sheet
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookingsForAdmin();
      // Sort by terbaru (opsional, jika API belum sort)
      const sorted = data.sort(
        (a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)
      );
      setBookings(sorted);
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

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const result = await updateBookingStatusByAdmin(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (showMessage)
        showMessage(result.message || "Status berhasil diperbarui.", "Sukses");
      setIsSheetOpen(false); // Tutup sheet setelah update
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const openActionSheet = (booking) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  };

  const closeActionSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedBooking(null), 300);
  };

  // Helper Badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "pe-badge pe-badge-success";
      case "reviewed":
        return "pe-badge pe-badge-success";
      case "in_progress":
        return "pe-badge pe-badge-info";
      case "confirmed":
        return "pe-badge pe-badge-info";
      case "pending":
        return "pe-badge pe-badge-warning";
      case "cancelled":
        return "pe-badge pe-badge-danger";
      default:
        return "pe-badge";
    }
  };

  // Helper Label Status (Bahasa Indonesia)
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Menunggu",
      confirmed: "Dikonfirmasi",
      in_progress: "Dikerjakan",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      reviewed: "Diulas",
    };
    return labels[status] || status;
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

  // --- LOGIC PAGINATION ---
  const pageCount = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  if (error && bookings.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  /* =========================================
     RENDER: MOBILE VIEW (NATIVE APP STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. STICKY SEARCH HEADER */}
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="position-relative">
          <i
            className="fas fa-search position-absolute"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--pe-text-muted)",
            }}
          ></i>
          <input
            type="text"
            className="form-control rounded-pill ps-5 border-0"
            style={{
              background: "var(--pe-card-bg)",
              color: "var(--pe-text-main)",
              fontSize: "0.9rem",
            }}
            placeholder="Cari ID, User, atau Toko..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Horizontal Filter Chips */}
        <div
          className="d-flex gap-2 mt-3 overflow-auto pb-1"
          style={{ whiteSpace: "nowrap", scrollbarWidth: "none" }}
        >
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Proses" },
            { id: "completed", label: "Selesai" },
            { id: "cancelled", label: "Batal" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id)}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                filterStatus === filter.id ? "fw-bold" : ""
              }`}
              style={{
                background:
                  filterStatus === filter.id
                    ? "var(--pe-accent)"
                    : "var(--pe-card-bg)",
                color:
                  filterStatus === filter.id ? "#fff" : "var(--pe-text-muted)",
                fontSize: "0.8rem",
                flexShrink: 0,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARD FEED LIST */}
      <div className="px-3 py-2">
        {currentBookings.length > 0 ? (
          currentBookings.map((booking) => (
            <div
              className="pe-card mb-3 p-3 position-relative"
              key={booking.id}
              onClick={() => openActionSheet(booking)}
              style={{
                borderLeft: `4px solid ${
                  booking.status === "completed"
                    ? "var(--pe-success)"
                    : booking.status === "cancelled"
                    ? "var(--pe-danger)"
                    : "var(--pe-accent)"
                }`,
              }}
            >
              {/* Header Card */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span
                    className="badge bg-secondary bg-opacity-25 text-secondary rounded-1 mb-1"
                    style={{ fontSize: "0.6rem" }}
                  >
                    #{booking.id.substring(0, 8)}
                  </span>
                  <h6
                    className="mb-0 fw-bold"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {booking.user?.name}
                  </h6>
                </div>
                <div className="text-end">
                  <small
                    className="d-block"
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    {new Date(booking.bookingTime).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                  <span
                    className={getStatusBadgeClass(booking.status)}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>

              {/* Content Card */}
              <div className="d-flex align-items-center gap-3 py-2 border-top border-bottom border-secondary border-opacity-10 my-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 40, height: 40, background: "var(--pe-bg)" }}
                >
                  <i className="fas fa-store text-muted"></i>
                </div>
                <div className="overflow-hidden">
                  <small
                    className="d-block"
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Toko
                  </small>
                  <div
                    className="text-truncate fw-bold"
                    style={{ fontSize: "0.9rem", color: "var(--pe-text-main)" }}
                  >
                    {booking.store?.name}
                  </div>
                </div>
              </div>

              {/* Footer Card */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <small
                    className="d-block"
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Total
                  </small>
                  <span className="fw-bold text-primary">
                    Rp {booking.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  style={{ fontSize: "0.75rem" }}
                >
                  Kelola{" "}
                  <i
                    className="fas fa-chevron-right ms-1"
                    style={{ fontSize: "0.6rem" }}
                  ></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <div className="mb-3 opacity-50">
              <i className="fas fa-box-open fa-3x"></i>
            </div>
            <p className="text-muted">Tidak ada pesanan ditemukan</p>
          </div>
        )}

        {/* PAGINATION MOBILE */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 3. BOTTOM SHEET MODAL (ACTION) */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={closeActionSheet}
      ></div>

      <div
        className="position-fixed bottom-0 start-0 w-100 pe-card rounded-top-4 p-4"
        style={{
          zIndex: 2010,
          transform: isSheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          maxHeight: "80vh",
          overflowY: "auto",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <div className="d-flex justify-content-center mb-4">
          <div
            style={{
              width: "40px",
              height: "4px",
              background: "var(--pe-card-border)",
              borderRadius: "2px",
            }}
          ></div>
        </div>

        {selectedBooking && (
          <>
            <div className="text-center mb-4">
              <h5
                className="fw-bold mb-1"
                style={{ color: "var(--pe-text-main)" }}
              >
                Kelola Pesanan
              </h5>
              <p className="text-muted small">#{selectedBooking.id}</p>
            </div>

            <div className="d-grid gap-3 mb-4">
              <button
                className="btn btn-lg fw-bold d-flex justify-content-between align-items-center"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
                onClick={() =>
                  handleStatusChange(selectedBooking.id, "confirmed")
                }
              >
                <span>
                  <i className="fas fa-check me-2"></i> Konfirmasi
                </span>
                <i className="fas fa-arrow-right opacity-50"></i>
              </button>

              <button
                className="btn btn-lg fw-bold d-flex justify-content-between align-items-center"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
                onClick={() =>
                  handleStatusChange(selectedBooking.id, "completed")
                }
              >
                <span>
                  <i className="fas fa-check-double me-2"></i> Selesai
                </span>
                <i className="fas fa-arrow-right opacity-50"></i>
              </button>

              <button
                className="btn btn-lg fw-bold d-flex justify-content-between align-items-center"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
                onClick={() =>
                  handleStatusChange(selectedBooking.id, "cancelled")
                }
              >
                <span>
                  <i className="fas fa-times me-2"></i> Batalkan
                </span>
                <i className="fas fa-arrow-right opacity-50"></i>
              </button>
            </div>

            <button
              className="btn w-100 rounded-pill py-3"
              style={{
                background: "var(--pe-card-bg)",
                border: "1px solid var(--pe-card-border)",
                color: "var(--pe-text-main)",
              }}
              onClick={closeActionSheet}
            >
              Tutup
            </button>
          </>
        )}
      </div>
      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (CLASSIC TABLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4 position-relative z-1">
      {/* Decorative Blob */}
      <div className="pe-blob pe-blob-1"></div>

      {/* Header */}
      <div className="mb-4">
        <Fade direction="down" triggerOnce>
          <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
            Transaksi
          </h6>
          <h2 className="pe-title mb-0">Semua Pesanan</h2>
        </Fade>
      </div>

      {/* Filter Bar */}
      <Fade triggerOnce>
        <div className="pe-card mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent border-end-0"
                  style={{
                    borderColor: "var(--pe-card-border)",
                    color: "var(--pe-text-muted)",
                  }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-start-0"
                  style={{
                    borderColor: "var(--pe-card-border)",
                    color: "var(--pe-text-main)",
                  }}
                  placeholder="Cari ID / Pelanggan / Toko..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              {/* FIX: Dropdown Warna Adaptif (Hapus bg-dark) */}
              <select
                className="form-select bg-transparent"
                style={{
                  borderColor: "var(--pe-card-border)",
                  color: "var(--pe-text-main)",
                  backgroundColor: "var(--pe-card-bg)", // Adaptif
                }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option
                  value="all"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Semua Status
                </option>
                <option
                  value="pending"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Pending
                </option>
                <option
                  value="confirmed"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Confirmed
                </option>
                <option
                  value="in_progress"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  In Progress
                </option>
                <option
                  value="completed"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Completed
                </option>
                <option
                  value="cancelled"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>
      </Fade>

      {/* Table Data */}
      <Fade delay={100} triggerOnce>
        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pelanggan</th>
                  <th>Toko</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <tr key={booking.id} className="pe-table-row-hover">
                      <td>
                        <span
                          className="small font-monospace"
                          style={{ color: "var(--pe-text-muted)" }}
                        >
                          #{booking.id.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <span
                          className="fw-bold"
                          style={{ color: "var(--pe-text-main)" }}
                        >
                          {booking.user?.name || "N/A"}
                        </span>
                      </td>
                      <td style={{ color: "var(--pe-text-main)" }}>
                        {booking.store?.name || "N/A"}
                      </td>
                      <td style={{ color: "var(--pe-text-main)" }}>
                        {new Date(booking.bookingTime).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td>
                        <span
                          className="fw-bold"
                          style={{ color: "var(--pe-text-main)" }}
                        >
                          Rp {booking.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="dropdown">
                          <button
                            className="pe-btn-action py-1 px-2"
                            data-bs-toggle="dropdown"
                            disabled={booking.status === "reviewed"}
                          >
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                          {/* FIX: Dropdown Menu Warna Adaptif */}
                          <ul
                            className="dropdown-menu dropdown-menu-end shadow"
                            style={{
                              backgroundColor: "var(--pe-card-bg)",
                              borderColor: "var(--pe-card-border)",
                            }}
                          >
                            <li>
                              <button
                                className="dropdown-item"
                                style={{ color: "var(--pe-text-main)" }}
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed")
                                }
                              >
                                <i className="fas fa-check me-2 text-info"></i>{" "}
                                Konfirmasi
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                style={{ color: "var(--pe-text-main)" }}
                                onClick={() =>
                                  handleStatusChange(booking.id, "in_progress")
                                }
                              >
                                <i className="fas fa-sync me-2 text-primary"></i>{" "}
                                Kerjakan
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                style={{ color: "var(--pe-text-main)" }}
                                onClick={() =>
                                  handleStatusChange(booking.id, "completed")
                                }
                              >
                                <i className="fas fa-check-circle me-2 text-success"></i>{" "}
                                Selesai
                              </button>
                            </li>
                            <li>
                              <hr
                                className="dropdown-divider"
                                style={{
                                  borderColor: "var(--pe-card-border)",
                                }}
                              />
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() =>
                                  handleStatusChange(booking.id, "cancelled")
                                }
                              >
                                <i className="fas fa-times-circle me-2"></i>{" "}
                                Batalkan
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      Tidak ada data pesanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION DESKTOP */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </Fade>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
};

export default AdminBookingsPage;
