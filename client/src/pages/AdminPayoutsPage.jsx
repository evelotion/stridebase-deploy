// File: client/src/pages/AdminPayoutsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getPayoutRequests,
  resolvePayoutRequest,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

const AdminPayoutsPage = ({ showMessage }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPayoutRequests();
      setPayouts(data);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleProcess = async (id) => {
    if (!window.confirm("Setujui pencairan dana ini?")) return;
    try {
      await resolvePayoutRequest(id, "APPROVED");
      if (showMessage) showMessage("Payout berhasil disetujui.", "Success");
      fetchPayouts();
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tolak pencairan dana ini?")) return;
    try {
      await resolvePayoutRequest(id, "REJECTED");
      if (showMessage) showMessage("Payout ditolak.", "Info");
      fetchPayouts();
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const filteredPayouts = useMemo(() => {
    if (activeTab === "pending") {
      return payouts.filter((p) => p.status === "PENDING");
    } else {
      return payouts.filter((p) => p.status !== "PENDING");
    }
  }, [payouts, activeTab]);

  const openSheet = (payout) => {
    setSelectedPayout(payout);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedPayout(null), 300);
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <h2 className="pe-title mb-3 fs-4">Pencairan Dana</h2>

        <div
          className="d-flex p-1 rounded-3"
          style={{
            background: "var(--pe-card-bg)",
            border: "1px solid var(--pe-card-border)",
          }}
        >
          <button
            className="flex-grow-1 btn btn-sm rounded-3 border-0 py-2 fw-bold transition-all"
            style={{
              background:
                activeTab === "pending" ? "var(--pe-accent)" : "transparent",
              color: activeTab === "pending" ? "#fff" : "var(--pe-text-muted)",
            }}
            onClick={() => setActiveTab("pending")}
          >
            Menunggu
          </button>
          <button
            className="flex-grow-1 btn btn-sm rounded-3 border-0 py-2 fw-bold transition-all"
            style={{
              background:
                activeTab === "history"
                  ? "var(--pe-sidebar-bg)"
                  : "transparent",
              color:
                activeTab === "history"
                  ? "var(--pe-text-main)"
                  : "var(--pe-text-muted)",
            }}
            onClick={() => setActiveTab("history")}
          >
            Riwayat
          </button>
        </div>
      </div>

      <div className="px-3 py-3">
        {filteredPayouts.length > 0 ? (
          filteredPayouts.map((p) => (
            <div
              className="pe-card mb-3 p-3 position-relative"
              key={p.id}
              onClick={() => openSheet(p)}
              style={{
                borderLeft:
                  p.status === "PENDING"
                    ? "4px solid var(--pe-warning)"
                    : "4px solid var(--pe-card-border)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  {/* FIX: Warna Text Muted */}
                  <small
                    className="d-block"
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    REQUEST ID
                  </small>
                  <span
                    className="font-monospace small opacity-75"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    #{p.id.substring(0, 8)}
                  </span>
                </div>
                <div className="text-end">
                  <small
                    className="d-block"
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    TANGGAL
                  </small>
                  <span
                    className="small"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 py-3 border-top border-bottom border-secondary border-opacity-10 my-2">
                <div
                  className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 45, height: 45 }}
                >
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <div>
                  <h5
                    className="mb-0 fw-bold"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {formatCurrency(p.amount)}
                  </h5>
                  <small style={{ color: "var(--pe-text-muted)" }}>
                    {p.store?.name}
                  </small>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span
                  className={`badge rounded-pill ${
                    p.status === "PENDING"
                      ? "bg-warning text-dark"
                      : p.status === "APPROVED"
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }`}
                >
                  {p.status === "PENDING" ? "Menunggu Konfirmasi" : p.status}
                </span>
                <i className="fas fa-chevron-right text-muted opacity-50"></i>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <div
              className="pe-icon-green rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ width: 60, height: 60 }}
            >
              <i className="fas fa-check-circle fs-4"></i>
            </div>
            <p style={{ color: "var(--pe-text-muted)" }}>Tidak ada data.</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
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

        {selectedPayout && (
          <>
            <div className="text-center mb-4">
              <small
                className="text-uppercase tracking-widest"
                style={{ color: "var(--pe-text-muted)" }}
              >
                Total Pencairan
              </small>
              <h2 className="fw-bold text-success my-2">
                {formatCurrency(selectedPayout.amount)}
              </h2>
              <p className="mb-0" style={{ color: "var(--pe-text-main)" }}>
                {selectedPayout.store?.name}
              </p>
              <small style={{ color: "var(--pe-text-muted)" }}>
                {selectedPayout.requestedBy?.email}
              </small>
            </div>

            <div className="bg-dark bg-opacity-10 p-3 rounded-3 mb-4 border border-secondary border-opacity-25">
              <div className="d-flex justify-content-between mb-2">
                <span
                  className="small"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Status
                </span>
                <span
                  className={`fw-bold ${
                    selectedPayout.status === "PENDING"
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {selectedPayout.status}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span
                  className="small"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  Diajukan
                </span>
                <span
                  className="small"
                  style={{ color: "var(--pe-text-main)" }}
                >
                  {new Date(selectedPayout.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedPayout.status === "PENDING" && (
              <div className="d-grid gap-3">
                <button
                  className="btn btn-success py-3 rounded-3 fw-bold shadow-lg"
                  onClick={() => handleProcess(selectedPayout.id)}
                >
                  <i className="fas fa-check-circle me-2"></i> Setujui &
                  Transfer
                </button>
                <button
                  className="btn btn-outline-danger py-2 rounded-3"
                  onClick={() => handleReject(selectedPayout.id)}
                >
                  Tolak Permintaan
                </button>
              </div>
            )}

            {selectedPayout.status !== "PENDING" && (
              <button
                className="btn w-100 py-3 rounded-3"
                style={{
                  background: "var(--pe-card-bg)",
                  color: "var(--pe-text-main)",
                  border: "1px solid var(--pe-card-border)",
                }}
                onClick={closeSheet}
              >
                Tutup
              </button>
            )}
          </>
        )}
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="d-none d-lg-block">
      <Fade direction="down" triggerOnce>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Keuangan
            </h6>
            <h2 className="pe-title mb-0">Permintaan Pencairan (Payout)</h2>
          </div>
        </div>
      </Fade>

      <Fade triggerOnce>
        <div className="pe-card mb-4">
          <div className="d-flex gap-3">
            <button
              className={`pe-btn-action px-4 ${
                activeTab === "pending" ? "active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
              style={
                activeTab === "pending"
                  ? {
                      background: "var(--pe-warning)",
                      color: "#000",
                      borderColor: "var(--pe-warning)",
                    }
                  : {}
              }
            >
              <i className="fas fa-clock me-2"></i> Menunggu
            </button>
            <button
              className={`pe-btn-action px-4 ${
                activeTab === "history" ? "active" : ""
              }`}
              onClick={() => setActiveTab("history")}
              style={
                activeTab === "history"
                  ? {
                      background: "var(--pe-card-bg)",
                      borderColor: "var(--pe-text-main)",
                    }
                  : {}
              }
            >
              <i className="fas fa-history me-2"></i> Riwayat
            </button>
          </div>
        </div>
      </Fade>

      <Fade delay={100} triggerOnce>
        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table align-middle">
              <thead>
                <tr>
                  <th style={{ color: "var(--pe-text-muted)" }}>Tanggal</th>
                  <th style={{ color: "var(--pe-text-muted)" }}>Toko</th>
                  <th style={{ color: "var(--pe-text-muted)" }}>Jumlah</th>
                  <th style={{ color: "var(--pe-text-muted)" }}>Pemohon</th>
                  <th style={{ color: "var(--pe-text-muted)" }}>Status</th>
                  {activeTab === "pending" && (
                    <th
                      className="text-end"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.length > 0 ? (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="pe-table-row-hover">
                      <td
                        className="small"
                        style={{ color: "var(--pe-text-muted)" }}
                      >
                        {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td
                        className="fw-bold"
                        style={{ color: "var(--pe-text-main)" }}
                      >
                        {p.store?.name}
                      </td>
                      <td>
                        <span className="text-success fw-bold font-monospace fs-6">
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td
                        className="small"
                        style={{ color: "var(--pe-text-muted)" }}
                      >
                        {p.requestedBy?.name}
                      </td>
                      <td>
                        <span
                          className={`pe-badge ${
                            p.status === "PENDING"
                              ? "pe-badge-warning"
                              : p.status === "APPROVED"
                              ? "pe-badge-success"
                              : "pe-badge-danger"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      {activeTab === "pending" && (
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="pe-btn-action bg-success text-white border-success"
                              onClick={() => handleProcess(p.id)}
                              title="Approve"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="pe-btn-action bg-danger text-white border-danger"
                              onClick={() => handleReject(p.id)}
                              title="Reject"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === "pending" ? "6" : "5"}
                      className="text-center py-5"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-admin"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default AdminPayoutsPage;
