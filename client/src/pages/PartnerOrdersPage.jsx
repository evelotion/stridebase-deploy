// File: client/src/pages/PartnerOrdersPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Fade } from "react-awesome-reveal";
import { getPartnerOrders, updateOrderStatus } from "../services/apiService"; // Pastikan API ini ada
import "../pages/PartnerElevate.css";

const PartnerOrdersPage = ({ showMessage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, process, history

  // Mobile Sheet
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // Simulasi Fetch
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getPartnerOrders();
        setOrders(data);
      } catch (err) {
        if (showMessage) showMessage("Gagal memuat pesanan", "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [showMessage]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (showMessage)
        showMessage(`Status pesanan diperbarui: ${newStatus}`, "Success");
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "pending")
      return orders.filter((o) => o.status === "pending");
    if (activeTab === "process")
      return orders.filter((o) =>
        ["confirmed", "in_progress"].includes(o.status)
      );
    return orders.filter((o) =>
      ["completed", "cancelled", "reviewed"].includes(o.status)
    );
  }, [orders, activeTab]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  // Mobile Handlers
  const openSheet = (order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (MERCHANT APP STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. STICKY TABS HEADER */}
      <div
        className="sticky-top px-3 pt-3 pb-2"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <h2 className="pe-title mb-3 fs-4">Pesanan</h2>
        <div
          className="d-flex p-1 rounded-3"
          style={{
            background: "var(--pe-card-bg)",
            border: "1px solid var(--pe-card-border)",
          }}
        >
          <button
            className={`flex-grow-1 btn btn-sm rounded-3 border-0 py-2 fw-bold transition-all ${
              activeTab === "pending" ? "text-white" : "text-muted"
            }`}
            style={{
              background:
                activeTab === "pending" ? "var(--pe-danger)" : "transparent",
            }}
            onClick={() => setActiveTab("pending")}
          >
            Baru ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            className={`flex-grow-1 btn btn-sm rounded-3 border-0 py-2 fw-bold transition-all ${
              activeTab === "process" ? "text-white" : "text-muted"
            }`}
            style={{
              background:
                activeTab === "process" ? "var(--pe-accent)" : "transparent",
            }}
            onClick={() => setActiveTab("process")}
          >
            Proses
          </button>
          <button
            className={`flex-grow-1 btn btn-sm rounded-3 border-0 py-2 fw-bold transition-all ${
              activeTab === "history" ? "text-white" : "text-muted"
            }`}
            style={{
              background:
                activeTab === "history"
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
            }}
            onClick={() => setActiveTab("history")}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* 2. ORDER LIST FEED */}
      <div className="px-3 py-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              className="pe-card mb-3 p-3 position-relative"
              key={order.id}
              onClick={() => openSheet(order)}
              style={{
                borderLeft:
                  activeTab === "pending"
                    ? "4px solid var(--pe-danger)"
                    : activeTab === "process"
                    ? "4px solid var(--pe-accent)"
                    : "4px solid var(--pe-success)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="badge bg-secondary bg-opacity-25 text-secondary font-monospace small">
                  #{order.id.substring(0, 6)}
                </span>
                <small className="text-muted">
                  {new Date(order.bookingTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>

              <div className="d-flex gap-3 align-items-center mb-3">
                <div
                  className="rounded-3 bg-dark d-flex align-items-center justify-content-center border border-secondary border-opacity-25"
                  style={{ width: 50, height: 50 }}
                >
                  <i className="fas fa-shoe-prints text-white fs-5"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{order.serviceName}</h6>
                  <small className="text-muted">
                    Pelanggan: {order.user?.name}
                  </small>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-10">
                <span className="fw-bold text-success fs-6">
                  {formatCurrency(order.totalPrice)}
                </span>
                {activeTab === "pending" ? (
                  <span className="badge bg-danger text-white px-3 py-2 rounded-pill">
                    Perlu Konfirmasi
                  </span>
                ) : (
                  <span className="text-muted small text-uppercase fw-bold">
                    {order.status.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <div className="mb-3 opacity-25">
              <i className="fas fa-box-open fa-3x"></i>
            </div>
            <p className="text-muted">Tidak ada pesanan di tab ini.</p>
          </div>
        )}
      </div>

      {/* 3. BOTTOM SHEET ACTION */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={closeSheet}
      ></div>

      <div
        className="position-fixed bottom-0 start-0 w-100 pe-card rounded-top-4 p-4"
        style={{
          zIndex: 2010,
          transform: isSheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
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

        {selectedOrder && (
          <>
            <div className="text-center mb-4">
              <h5 className="fw-bold mb-1">{selectedOrder.serviceName}</h5>
              <p className="text-muted small mb-3">Order #{selectedOrder.id}</p>
              <h2 className="fw-bold text-success">
                {formatCurrency(selectedOrder.totalPrice)}
              </h2>
            </div>

            {/* Detail Pelanggan */}
            <div className="bg-dark bg-opacity-50 p-3 rounded-3 mb-4 border border-secondary border-opacity-25">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Pelanggan</span>
                <span className="text-white small fw-bold">
                  {selectedOrder.user?.name}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Kontak</span>
                <span className="text-white small">
                  {selectedOrder.user?.phone || "-"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Catatan</span>
                <span
                  className="text-white small fst-italic text-end"
                  style={{ maxWidth: "60%" }}
                >
                  {selectedOrder.notes || "-"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-3">
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    className="btn btn-success py-3 rounded-3 fw-bold shadow-lg"
                    onClick={() =>
                      handleStatusUpdate(selectedOrder.id, "confirmed")
                    }
                  >
                    <i className="fas fa-check-circle me-2"></i> Terima Pesanan
                  </button>
                  <button
                    className="btn btn-outline-danger py-2 rounded-3"
                    onClick={() =>
                      handleStatusUpdate(selectedOrder.id, "cancelled")
                    }
                  >
                    Tolak Pesanan
                  </button>
                </>
              )}

              {selectedOrder.status === "confirmed" && (
                <button
                  className="btn btn-primary py-3 rounded-3 fw-bold"
                  onClick={() =>
                    handleStatusUpdate(selectedOrder.id, "in_progress")
                  }
                >
                  <i className="fas fa-play me-2"></i> Mulai Pengerjaan
                </button>
              )}

              {selectedOrder.status === "in_progress" && (
                <button
                  className="btn btn-success py-3 rounded-3 fw-bold"
                  onClick={() =>
                    handleStatusUpdate(selectedOrder.id, "completed")
                  }
                >
                  <i className="fas fa-flag-checkered me-2"></i> Tandai Selesai
                </button>
              )}

              {["completed", "cancelled"].includes(selectedOrder.status) && (
                <button
                  className="btn btn-secondary py-3 rounded-3"
                  onClick={closeSheet}
                >
                  Tutup
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (KANBAN / TABLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <Fade direction="down" triggerOnce>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Operasional
            </h6>
            <h2 className="pe-title mb-0">Manajemen Pesanan</h2>
          </div>
          {/* Filter Tabs Desktop */}
          <div className="d-flex gap-2">
            {["pending", "process", "history"].map((tab) => (
              <button
                key={tab}
                className={`pe-btn-action px-4 ${
                  activeTab === tab
                    ? "bg-primary text-white border-primary"
                    : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "pending"
                  ? "Baru Masuk"
                  : tab === "process"
                  ? "Dalam Proses"
                  : "Riwayat"}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade triggerOnce>
        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>ID Order</th>
                  <th>Layanan</th>
                  <th>Pelanggan</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="pe-table-row-hover">
                    <td className="font-monospace text-muted small">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="fw-bold text-white">{order.serviceName}</td>
                    <td>{order.user?.name}</td>
                    <td className="text-muted small">
                      {new Date(order.bookingTime).toLocaleString("id-ID")}
                    </td>
                    <td>
                      <span
                        className={`pe-badge ${
                          order.status === "pending"
                            ? "pe-badge-warning"
                            : order.status === "completed"
                            ? "pe-badge-success"
                            : order.status === "cancelled"
                            ? "pe-badge-danger"
                            : "pe-badge-info"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-success">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="text-end">
                      {order.status === "pending" && (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="pe-btn-action bg-success text-white border-success py-1 px-2"
                            onClick={() =>
                              handleStatusUpdate(order.id, "confirmed")
                            }
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="pe-btn-action bg-danger text-white border-danger py-1 px-2"
                            onClick={() =>
                              handleStatusUpdate(order.id, "cancelled")
                            }
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          className="pe-btn-action bg-primary text-white border-primary py-1 px-3 small"
                          onClick={() =>
                            handleStatusUpdate(order.id, "in_progress")
                          }
                        >
                          Kerjakan
                        </button>
                      )}
                      {order.status === "in_progress" && (
                        <button
                          className="pe-btn-action bg-success text-white border-success py-1 px-3 small"
                          onClick={() =>
                            handleStatusUpdate(order.id, "completed")
                          }
                        >
                          Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-1"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default PartnerOrdersPage;
