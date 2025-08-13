import React, { useState, useEffect, useMemo } from "react";
import API_BASE_URL from "../apiConfig";

const PartnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE BARU UNTUK PENCARIAN & PAGINASI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5; // Tampilkan 5 kartu per halaman

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/orders`, {
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

  // --- LOGIKA BARU UNTUK MEMFILTER DAN MEMBAGI DATA ---
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (order.user?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.serviceName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const pageCount = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const currentOrdersOnPage = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleWorkStatusChange = async (bookingId, newWorkStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/partner/orders/${bookingId}/work-status`,
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
      // Asumsi 'showMessage' adalah prop, jika tidak ada, ganti dengan alert
      if (window.showMessage) {
        window.showMessage(`Error: ${err.message}`);
      } else {
        alert(`Error: ${err.message}`);
      }
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

  // Komponen untuk Paginasi
  const Pagination = ({ currentPage, pageCount, onPageChange }) => {
    if (pageCount <= 1) return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <nav className="mt-4 d-flex justify-content-center">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
            >
              &laquo;
            </button>
          </li>
          {pages.map((num) => (
            <li
              key={num}
              className={`page-item ${currentPage === num ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(num)}>
                {num}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === pageCount ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return <div className="p-4">Memuat data pesanan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Manajemen Pesanan</h2>
      </div>

      <div className="table-card p-3 shadow-sm">
        {/* Tampilan Desktop */}
        <div className="table-responsive d-none d-lg-block">
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

        {/* Tampilan Mobile */}
        <div className="d-lg-none">
          <div className="mb-3 px-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama, layanan, atau ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="mobile-card-list">
            {currentOrdersOnPage.length > 0 ? (
              currentOrdersOnPage.map((order) => (
                <div className="mobile-card" key={order.id}>
                  <div className="mobile-card-header">
                    <div>
                      <span className="fw-bold">{order.user.name}</span>
                      <small className="d-block text-muted">{order.id}</small>
                    </div>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <small>Layanan</small>
                      <span>{order.serviceName}</span>
                    </div>
                    <div className="mobile-card-row">
                      <small>Jadwal</small>
                      <span>
                        {new Date(order.scheduleDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    <div className="mobile-card-row">
                      <small>Status Pengerjaan</small>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "150px" }}
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
                        <option value="QUALITY_CHECK">Cek Kualitas</option>
                        <option value="READY_FOR_PICKUP">Siap Diambil</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-muted">
                Tidak ada pesanan yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerOrdersPage;
