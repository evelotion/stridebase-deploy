// File: stridebase-app/client/src/pages/AdminStoreInvoicePage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

const AdminStoreInvoicePage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk modal Buat & Lihat
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    items: [
      {
        description: "Biaya Langganan Bulanan",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
  });

  const fetchInvoiceData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const [storeRes, invoicesRes] = await Promise.all([
        fetch(`/api/stores/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/stores/${storeId}/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!storeRes.ok) throw new Error("Gagal mengambil detail toko.");
      if (!invoicesRes.ok) throw new Error("Gagal mengambil data invoice.");
      const storeData = await storeRes.json();
      const invoicesData = await invoicesRes.json();
      setStore(storeData);
      setInvoices(invoicesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [storeId]);

  const handleShowCreateModal = () => setShowCreateModal(true);

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewInvoiceData({
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
      items: [
        {
          description: "Biaya Langganan Bulanan",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    });
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setViewingInvoice(null);
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...newInvoiceData.items];
    items[index][name] = value;
    const qty = parseInt(items[index].quantity, 10) || 0;
    const price = parseInt(items[index].unitPrice, 10) || 0;
    items[index].total = qty * price;
    setNewInvoiceData((prev) => ({ ...prev, items }));
  };

  const handleAddItem = () => {
    setNewInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unitPrice: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    const items = [...newInvoiceData.items];
    items.splice(index, 1);
    setNewInvoiceData((prev) => ({ ...prev, items }));
  };

  const totalInvoiceAmount = useMemo(() => {
    return newInvoiceData.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
  }, [newInvoiceData.items]);

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInvoiceData),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal menyimpan invoice.");

      alert("Invoice baru berhasil dibuat!");
      handleCloseCreateModal();
      fetchInvoiceData();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    const actionText = newStatus === "PAID" ? "menandai LUNAS" : "membatalkan";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} invoice ini?`)) return;

    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert(`Invoice berhasil ditandai sebagai ${newStatus}.`);
      handleCloseDetailModal();
      fetchInvoiceData();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkOverdue = async (invoiceId) => {
    if (
      !confirm(
        "Terapkan denda keterlambatan pada invoice ini? Aksi ini tidak dapat dibatalkan."
      )
    )
      return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/overdue`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert("Denda keterlambatan berhasil diterapkan.");
      handleCloseDetailModal();
      fetchInvoiceData();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowDetailModal = async (invoiceId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Detail invoice tidak ditemukan.");
      const data = await response.json();
      setViewingInvoice(data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue =
      new Date(dueDate) < new Date() &&
      status !== "PAID" &&
      status !== "CANCELLED";
    if (status === "PAID") return "bg-success";
    if (isOverdue || status === "OVERDUE") return "bg-danger";
    if (status === "SENT") return "bg-warning text-dark";
    return "bg-secondary";
  };

  const getStatusText = (status, dueDate) => {
    const isOverdue =
      new Date(dueDate) < new Date() &&
      status !== "PAID" &&
      status !== "CANCELLED";
    if (isOverdue && status !== "OVERDUE") return "Jatuh Tempo";
    return status;
  };

  const handleSendInvoice = async (invoiceId) => {
    if (
      !confirm(
        "Kirim invoice ini ke pemilik toko? Status akan berubah menjadi SENT."
      )
    )
      return;
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert("Invoice berhasil dikirim!");
      handleCloseDetailModal();
      fetchInvoiceData(); // Refresh data
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-4">Memuat data invoice...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <div>
            <Link to="/admin/stores" className="btn btn-sm btn-light me-2">
              <i className="fas fa-arrow-left"></i>
            </Link>
            <h2 className="fs-2 mb-0 d-inline-block align-middle">
              Manajemen Invoice: {store?.name || "..."}
            </h2>
          </div>
          <button className="btn btn-primary" onClick={handleShowCreateModal}>
            <i className="fas fa-plus me-2"></i>Buat Tagihan Baru
          </button>
        </div>

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nomor Invoice</th>
                  <th>Tgl Terbit</th>
                  <th>Tgl Jatuh Tempo</th>
                  <th>Total Tagihan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <span className="fw-bold">{invoice.invoiceNumber}</span>
                      </td>
                      <td>
                        {new Date(invoice.issueDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td>
                        {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                      </td>
                      <td>Rp {invoice.totalAmount.toLocaleString("id-ID")}</td>
                      <td>
                        <span
                          className={`badge ${getStatusBadge(
                            invoice.status,
                            invoice.dueDate
                          )}`}
                        >
                          {getStatusText(invoice.status, invoice.dueDate)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleShowDetailModal(invoice.id)}
                        >
                          <i className="fas fa-search me-1"></i> Detail & Aksi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-5 text-muted">
                      Belum ada invoice yang dibuat untuk toko ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Buat Tagihan Baru untuk {store?.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseCreateModal}
                  ></button>
                </div>
                <form onSubmit={handleSaveInvoice}>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="issueDate" className="form-label">
                          Tanggal Diterbitkan
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="issueDate"
                          name="issueDate"
                          value={newInvoiceData.issueDate}
                          onChange={handleInvoiceChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="dueDate" className="form-label">
                          Tanggal Jatuh Tempo
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="dueDate"
                          name="dueDate"
                          value={newInvoiceData.dueDate}
                          onChange={handleInvoiceChange}
                          required
                        />
                      </div>
                    </div>

                    <hr />
                    <h6 className="mb-3">Item Tagihan</h6>
                    {newInvoiceData.items.map((item, index) => (
                      <div key={index} className="row align-items-center mb-2">
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Deskripsi"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Jml"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Harga Satuan"
                            name="unitPrice"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          {newInvoiceData.items.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={handleAddItem}
                    >
                      <i className="fas fa-plus"></i> Tambah Item
                    </button>

                    <hr />
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        rows="2"
                        value={newInvoiceData.notes}
                        onChange={handleInvoiceChange}
                      ></textarea>
                    </div>
                    <div className="text-end">
                      <h5>
                        Total:{" "}
                        <span className="fw-bold">
                          Rp {totalInvoiceAmount.toLocaleString("id-ID")}
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseCreateModal}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? "Menyimpan..." : "Simpan & Kirim Invoice"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {showDetailModal && viewingInvoice && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Detail Invoice: {viewingInvoice.invoiceNumber}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseDetailModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>Kepada:</strong> {viewingInvoice.store.name}
                    </div>
                    <div className="col-6 text-end">
                      <strong>Status:</strong>{" "}
                      {getStatusText(
                        viewingInvoice.status,
                        viewingInvoice.dueDate
                      )}
                    </div>
                  </div>
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Deskripsi</th>
                        <th>Jumlah</th>
                        <th>Harga</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                          <td className="text-end">
                            Rp {item.total.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h5 className="text-end mt-3">
                    Total Tagihan: Rp{" "}
                    {viewingInvoice.totalAmount.toLocaleString("id-ID")}
                  </h5>
                </div>
                <div className="modal-footer justify-content-between">
                  <div>
                    <Link
                      to={`/admin/invoice/print/${viewingInvoice.id}`}
                      target="_blank"
                      className="btn btn-info"
                    >
                      <i className="fas fa-print me-2"></i>Cetak
                    </Link>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleCloseDetailModal}
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="btn-group">
                    {viewingInvoice.status === "DRAFT" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSendInvoice(viewingInvoice.id)}
                        disabled={isSaving}
                      >
                        <i className="fas fa-paper-plane me-2"></i>Kirim Invoice
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleMarkOverdue(viewingInvoice.id)}
                      disabled={isSaving || viewingInvoice.status !== "SENT"}
                    >
                      Tandai Telat & Denda
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleStatusUpdate(viewingInvoice.id, "PAID")
                      }
                      disabled={isSaving || viewingInvoice.status === "PAID"}
                    >
                      Tandai Lunas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default AdminStoreInvoicePage;
