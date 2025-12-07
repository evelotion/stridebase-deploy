// File: client/src/pages/PartnerWalletPage.jsx

import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
// PERBAIKAN: Ubah import agar sesuai dengan apiService.js
import { getPartnerWalletData, requestPartnerPayout } from "../services/apiService";
import "../pages/PartnerElevate.css";

const PartnerWalletPage = ({ showMessage }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // PERBAIKAN: Gunakan nama fungsi yang benar
      const data = await getPartnerWalletData();
      setWallet(data.wallet); 
      setTransactions(data.transactions || []);
    } catch (err) {
      if (showMessage) showMessage("Gagal memuat data dompet", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 50000) {
      if (showMessage) showMessage("Minimal penarikan Rp 50.000", "Error");
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      if (showMessage) showMessage("Saldo tidak mencukupi", "Error");
      return;
    }

    setIsSubmitting(true);
    try {
      // PERBAIKAN: Gunakan nama fungsi yang benar.
      // Catatan: requestPartnerPayout di apiService sudah membungkus { amount },
      // jadi kita cukup kirim nilai amount-nya saja.
      await requestPartnerPayout(amount);
      
      if (showMessage)
        showMessage("Permintaan penarikan berhasil dikirim", "Success");
      setShowWithdrawModal(false);
      setIsSheetOpen(false); // Tutup sheet mobile
      setWithdrawAmount("");
      fetchWalletData();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  // Mobile Handlers
  const openWithdrawSheet = () => setIsSheetOpen(true);
  const closeWithdrawSheet = () => setIsSheetOpen(false);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (E-WALLET STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. STICKY HEADER */}
      <div
        className="sticky-top px-3 py-3"
        style={{ background: "var(--pe-bg)", zIndex: 1020 }}
      >
        <h2 className="pe-title mb-0 fs-4">Dompet Saya</h2>
      </div>

      <div className="px-3">
        {/* 2. DIGITAL CARD (VISA STYLE) */}
        <div
          className="pe-card p-4 mb-4 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            minHeight: "200px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {/* Background Decoration */}
          <div className="position-absolute top-0 end-0 p-4 opacity-25">
            <i className="fas fa-wallet fa-5x text-white"></i>
          </div>

          <div className="d-flex justify-content-between align-items-start mb-4 position-relative z-2">
            <span className="text-white-50 font-monospace small">
              STRIDEBASE PAY
            </span>
            <i className="fas fa-wifi text-white-50 fa-rotate-90"></i>
          </div>

          <div className="mb-4 position-relative z-2">
            <small className="text-white-50 d-block mb-1">
              Total Saldo Aktif
            </small>
            <h2 className="text-white fw-bold mb-0">
              {formatCurrency(wallet?.balance || 0)}
            </h2>
          </div>

          <div className="d-flex justify-content-between align-items-end position-relative z-2">
            <div>
              <small
                className="text-white-50 d-block"
                style={{ fontSize: "0.65rem" }}
              >
                PEMILIK TOKO
              </small>
              <span className="text-white font-monospace">
                {wallet?.store?.name || "MITRA TOKO"}
              </span>
            </div>
            <img
              src="https://img.icons8.com/color/48/000000/mastercard-logo.png"
              alt="Chip"
              width="40"
            />
          </div>
        </div>

        {/* 3. ACTION BUTTONS */}
        <div className="d-grid gap-2 mb-4">
          <button
            className="btn btn-primary py-3 rounded-4 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
            onClick={openWithdrawSheet}
          >
            <i className="fas fa-paper-plane"></i> Tarik Dana
          </button>
        </div>

        {/* 4. TRANSACTION HISTORY */}
        <h6 className="text-muted small fw-bold mb-3 ps-1 text-uppercase tracking-widest">
          Riwayat Transaksi
        </h6>
        <div className="d-flex flex-column gap-2">
          {transactions.length > 0 ? (
            transactions.map((trx) => (
              <div
                className="pe-card p-3 d-flex justify-content-between align-items-center"
                key={trx.id}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      trx.type === "CREDIT"
                        ? "bg-success bg-opacity-10 text-success"
                        : "bg-danger bg-opacity-10 text-danger"
                    }`}
                    style={{ width: 45, height: 45 }}
                  >
                    <i
                      className={`fas ${
                        trx.type === "CREDIT" ? "fa-arrow-down" : "fa-arrow-up"
                      }`}
                    ></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold fs-6">
                      {trx.type === "CREDIT" ? "Pemasukan" : "Penarikan"}
                    </h6>
                    <small
                      className="text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
                <span
                  className={`fw-bold ${
                    trx.type === "CREDIT" ? "text-success" : "text-danger"
                  }`}
                >
                  {trx.type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(trx.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted small">
              Belum ada transaksi.
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAWAL BOTTOM SHEET */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={closeWithdrawSheet}
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

        <h5 className="fw-bold mb-4 text-center">Tarik Dana ke Rekening</h5>
        <form onSubmit={handleWithdraw}>
          <div className="mb-4">
            <label className="text-muted small fw-bold mb-2">
              Nominal Penarikan
            </label>
            <div className="input-group">
              <span className="input-group-text bg-transparent text-white border-secondary fs-4 fw-bold">
                Rp
              </span>
              <input
                type="number"
                className="form-control bg-transparent text-white border-secondary fs-4 fw-bold"
                placeholder="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                autoFocus
              />
            </div>
            <small className="text-muted mt-2 d-block">
              Minimal Rp 50.000 • Biaya admin Rp 0
            </small>
          </div>

          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-success py-3 rounded-4 fw-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi Penarikan"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary py-3 rounded-4"
              onClick={closeWithdrawSheet}
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (TABLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <Fade direction="down" triggerOnce>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Keuangan
            </h6>
            <h2 className="pe-title mb-0">Dompet & Mutasi</h2>
          </div>
          <button
            className="pe-btn-action bg-primary text-white border-primary"
            onClick={() => setShowWithdrawModal(true)}
          >
            <i className="fas fa-money-bill-wave me-2"></i> Tarik Dana
          </button>
        </div>
      </Fade>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Fade triggerOnce>
            <div
              className="pe-card h-100 p-4"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="p-3 bg-white bg-opacity-10 rounded-3">
                  <i className="fas fa-wallet fa-2x text-white"></i>
                </div>
                <span className="badge bg-success">Active</span>
              </div>
              <h6 className="text-white-50 text-uppercase tracking-widest mb-1">
                Total Saldo
              </h6>
              <h1 className="text-white fw-bold mb-0">
                {formatCurrency(wallet?.balance || 0)}
              </h1>
            </div>
          </Fade>
        </div>
        <div className="col-md-8">
          <Fade delay={100} triggerOnce>
            <div className="pe-card h-100">
              <div className="pe-table-wrapper">
                <table className="pe-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Tipe</th>
                      <th>Keterangan</th>
                      <th className="text-end">Jumlah</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trx) => (
                      <tr key={trx.id}>
                        <td className="text-muted small">
                          {new Date(trx.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              trx.type === "CREDIT"
                                ? "bg-success bg-opacity-25 text-success"
                                : "bg-danger bg-opacity-25 text-danger"
                            }`}
                          >
                            {trx.type}
                          </span>
                        </td>
                        <td>{trx.description}</td>
                        <td
                          className={`text-end fw-bold ${
                            trx.type === "CREDIT"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {trx.type === "CREDIT" ? "+" : "-"}
                          {formatCurrency(trx.amount)}
                        </td>
                        <td className="text-end">
                          <span className="pe-badge pe-badge-success">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-2"></div>
      {renderMobileView()}
      {renderDesktopView()}

      {/* Modal Desktop */}
      {showWithdrawModal && (
        <div
          className="modal fade show d-block"
          style={{ backdropFilter: "blur(5px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content pe-card p-0 border-0 shadow-lg">
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-50">
                <h5 className="pe-title mb-0 fs-5">Tarik Dana</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowWithdrawModal(false)}
                ></button>
              </div>
              <form onSubmit={handleWithdraw} className="p-4">
                <div className="mb-3">
                  <label className="text-muted small fw-bold mb-2">
                    Nominal
                  </label>
                  <input
                    type="number"
                    className="form-control bg-dark text-white border-secondary"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    Konfirmasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerWalletPage;