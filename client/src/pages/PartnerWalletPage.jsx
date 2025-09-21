// File: client/src/pages/PartnerWalletPage.jsx (Dengan Daftar Invoice)

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getPartnerWalletData,
  requestPartnerPayout,
  getOutstandingInvoices,
} from "../services/apiService";

const PayoutModal = ({
  show,
  handleClose,
  handleSubmit,
  amount,
  setAmount,
  balance,
}) => {
  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Ajukan Penarikan Dana</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <p className="text-muted">
                  Saldo tersedia: Rp {balance.toLocaleString("id-ID")}
                </p>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Jumlah Penarikan (Rp)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    required
                    max={balance}
                    min="10000" // Atur minimum penarikan jika ada
                  />
                  <div className="form-text">
                    Minimum penarikan adalah Rp 10.000.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={amount > balance || amount < 10000}
                >
                  Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

const PartnerWalletPage = ({ showMessage }) => {
  const [walletData, setWalletData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const fetchWalletData = useCallback(async () => {
    try {
      const [wallet, outstandingInvoices] = await Promise.all([
        getPartnerWalletData(),
        getOutstandingInvoices(),
      ]);
      setWalletData(wallet);
      setInvoices(outstandingInvoices);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    setLoading(true);
    fetchWalletData();
  }, [fetchWalletData]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setPayoutAmount("");
  };

  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    try {
      const result = await requestPartnerPayout(parseFloat(payoutAmount));
      if (showMessage)
        showMessage(
          result.message || "Permintaan penarikan dana berhasil diajukan."
        );
      handleCloseModal();
      await fetchWalletData(); // Refresh data dompet
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const getTransactionTypeBadge = (type) => {
    return type === "CREDIT" ? "bg-success" : "bg-danger";
  };

  const getTransactionTypeText = (type) => {
    return type === "CREDIT" ? "Pemasukan" : "Penarikan";
  };

  if (loading) return <div className="p-4">Memuat data dompet...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;
  if (!walletData)
    return <div className="p-4">Data dompet tidak ditemukan.</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Dompet & Penarikan Dana</h2>
        <button className="btn btn-dark" onClick={handleOpenModal}>
          <i className="fas fa-hand-holding-usd me-2"></i>Ajukan Penarikan
        </button>
      </div>

      <div className="card card-account p-4 mb-4">
        <p className="text-muted mb-1">Saldo Saat Ini</p>
        <h2 className="display-4 fw-bold text-primary">
          Rp {walletData.balance.toLocaleString("id-ID")}
        </h2>
      </div>

      {invoices.length > 0 && (
        <div className="table-card p-3 shadow-sm mb-4">
          <h5 className="mb-3 text-danger">Tagihan Belum Dibayar</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>No. Invoice</th>
                  <th>Periode</th>
                  <th className="text-end">Jumlah (Rp)</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <span className="fw-bold">{invoice.invoiceNumber}</span>
                    </td>
                    <td>
                      {new Date(invoice.issueDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="text-end fw-bold text-danger">
                      {invoice.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/partner/invoices/${invoice.id}`}
                        className="btn btn-sm btn-success"
                      >
                        Lihat & Bayar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="table-card p-3 shadow-sm">
        <h5 className="mb-3">Riwayat Transaksi</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Tipe</th>
                <th className="text-end">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {walletData.transactions && walletData.transactions.length > 0 ? (
                walletData.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleString("id-ID")}</td>
                    <td>{tx.description}</td>
                    <td>
                      <span
                        className={`badge ${getTransactionTypeBadge(tx.type)}`}
                      >
                        {getTransactionTypeText(tx.type)}
                      </span>
                    </td>
                    <td
                      className={`text-end fw-bold ${
                        tx.type === "CREDIT" ? "text-success" : "text-danger"
                      }`}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}{" "}
                      {tx.amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <p className="text-muted mb-0">
                      Belum ada riwayat transaksi.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayoutModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleSubmitPayout}
        amount={payoutAmount}
        setAmount={setPayoutAmount}
        balance={walletData.balance}
      />
    </div>
  );
};

export default PartnerWalletPage;
