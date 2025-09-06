import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";
import MessageBox from "../components/MessageBox";

const PartnerWalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // State baru untuk modal penarikan dana
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data dompet.");
      }
      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleShowPayoutModal = () => setShowPayoutModal(true);
  const handleClosePayoutModal = () => {
    setShowPayoutModal(false);
    setPayoutAmount("");
    setMessage("");
    setIsError(false);
  };
  
  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    if (parseFloat(payoutAmount) > walletData.balance) {
      setIsError(true);
      setMessage("Jumlah penarikan tidak boleh melebihi saldo yang tersedia.");
      setSubmitting(false);
      return;
    }
     if (parseFloat(payoutAmount) <= 0) {
      setIsError(true);
      setMessage("Jumlah penarikan harus lebih dari nol.");
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/payout-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(payoutAmount) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengajukan permintaan.");
      }
      
      setIsError(false);
      setMessage("Permintaan penarikan dana berhasil diajukan dan akan diproses oleh Admin.");
      handleClosePayoutModal();
      // Kita tidak perlu fetch ulang data karena saldo baru akan berkurang setelah disetujui
      
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
   const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-4">Memuat data dompet...</div>;
  }

  return (
    <>
      <div className="container-fluid px-4">
        <h2 className="fs-2 my-4">Dompet & Penarikan Dana</h2>
        
        {message && <MessageBox message={message} isError={isError} onDismiss={() => setMessage("")}/>}

        <div className="row">
          <div className="col-md-5 mb-4">
            <div className="card text-bg-primary">
              <div className="card-body">
                <h5 className="card-title text-white-50">Saldo Tersedia</h5>
                <p className="card-text fs-2 fw-bold">
                  {walletData ? formatCurrency(walletData.balance) : formatCurrency(0)}
                </p>
                <button 
                  className="btn btn-light" 
                  onClick={handleShowPayoutModal}
                  disabled={!walletData || walletData.balance <= 0}
                >
                  <i className="fas fa-paper-plane me-2"></i>Tarik Dana
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="table-card p-3 shadow-sm">
          <h4 className="fs-5 mb-3">Riwayat Transaksi</h4>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th className="text-end">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {walletData && walletData.transactions.length > 0 ? (
                  walletData.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td>{tx.description}</td>
                      <td className={`text-end fw-bold ${tx.type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'CREDIT' ? '+' : ''}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      Belum ada riwayat transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal untuk Penarikan Dana */}
      {showPayoutModal && (
         <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Formulir Penarikan Dana</h5>
                <button type="button" className="btn-close" onClick={handleClosePayoutModal}></button>
              </div>
              <form onSubmit={handleSubmitPayout}>
                <div className="modal-body">
                    {message && <MessageBox message={message} isError={isError} onDismiss={() => setMessage("")} />}
                  <p>Saldo tersedia: <span className="fw-bold">{formatCurrency(walletData.balance)}</span></p>
                  <div className="mb-3">
                    <label htmlFor="payoutAmount" className="form-label">Jumlah Penarikan (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="payoutAmount"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="Contoh: 50000"
                      required
                      min="1"
                      max={walletData.balance}
                    />
                  </div>
                   <div className="form-text">
                    Dana akan ditransfer ke rekening bank yang terdaftar. Permintaan akan diproses oleh Admin dalam 1-3 hari kerja.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleClosePayoutModal} disabled={submitting}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Mengajukan...' : 'Ajukan Permintaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showPayoutModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default PartnerWalletPage;