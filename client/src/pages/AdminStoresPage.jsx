// File: client/src/pages/AdminStoresPage.jsx (Dengan perbaikan typo)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllStoresForAdmin,
  updateStoreStatus,
  createStoreInvoiceByAdmin,
  previewStoreInvoiceByAdmin,
  requestStoreDeletion,
} from "../services/apiService";

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
          className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}
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

const AdminStoresPage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const STORES_PER_PAGE = 5;

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState({
    period: "",
    notes: "",
  });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const navigate = useNavigate();

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllStoresForAdmin();
      setStores(data);
    } catch (err) {
      // <-- PERBAIKAN TYPO DI SINI
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleStatusChange = async (storeId, newStatus) => {
    try {
      await updateStoreStatus(storeId, newStatus);
      setStores((prevStores) =>
        prevStores.map((store) =>
          store.id === storeId ? { ...store, storeStatus: newStatus } : store
        )
      );
      if (showMessage) showMessage("Status toko berhasil diubah.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleOpenInvoiceModal = (store) => {
    setCurrentStore(store);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = (lastMonth.getMonth() + 1).toString().padStart(2, "0");

    setInvoiceDetails({
      period: `${year}-${month}`,
      notes: `Tagihan untuk ${store.name} periode ${lastMonth.toLocaleString(
        "id-ID",
        { month: "long", year: "numeric" }
      )}.`,
    });
    setShowInvoiceModal(true);
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setCurrentStore(null);
  };

  const handlePreviewInvoice = async () => {
    if (!currentStore || !invoiceDetails.period) return;
    try {
      const previewData = await previewStoreInvoiceByAdmin(currentStore.id, {
        period: invoiceDetails.period,
        notes: invoiceDetails.notes,
      });

      const previewUrl = `/admin/invoice/print/preview`;
      navigate(previewUrl, {
        state: { isPreview: true, invoiceData: previewData },
      });
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingInvoice(true);
    try {
      const response = await createStoreInvoiceByAdmin(currentStore.id, {
        period: invoiceDetails.period,
        notes: invoiceDetails.notes,
      });
      showMessage(
        response.message || "Invoice berhasil dikirim ke mitra.",
        "Success"
      );
      handleCloseInvoiceModal();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleRequestDelete = async (storeId, storeName) => {
    if (
      !window.confirm(
        `Anda yakin ingin mengirim permintaan untuk menghapus toko "${storeName}"? Toko akan dihapus permanen setelah disetujui oleh Developer.`
      )
    ) {
      return;
    }

    try {
      const result = await requestStoreDeletion(storeId);
      showMessage(result.message, "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "pending":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger";
      case "inactive":
        return "bg-secondary";
      default:
        return "bg-light text-dark";
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const ownerName = store.owner?.name || store.owner || "";
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || store.storeStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, filterStatus]);

  const pageCount = Math.ceil(filteredStores.length / STORES_PER_PAGE);
  const currentStoresOnPage = filteredStores.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE
  );

  if (loading) return <div className="p-4">Memuat data toko...</div>;
  if (error && stores.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Manajemen Toko</h2>
        <div className="d-flex gap-2">
          <Link to="/admin/stores/new" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Tambah Toko Baru
          </Link>
        </div>
      </div>

      <div className="card card-account p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Cari toko berdasarkan nama atau pemilik..."
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
              <option value="active">Aktif</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive d-none d-lg-block">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Toko</th>
                <th>Pemilik</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Rating</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <span className="fw-bold">{store.name}</span>
                    </td>
                    <td>{store.owner?.name || store.owner}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadge(store.storeStatus)}`}
                      >
                        {store.storeStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          store.tier === "PRO"
                            ? "bg-warning text-dark"
                            : "bg-info text-dark"
                        }`}
                      >
                        {store.tier}
                      </span>
                    </td>
                    <td>
                      <i className="fas fa-star text-warning me-1"></i>{" "}
                      {store.rating || "N/A"}
                    </td>
                    <td className="text-end">
                      {store.tier === "PRO" && (
                        <>
                          <Link
                            to={`/admin/stores/${store.id}/invoices`}
                            className="btn btn-sm btn-outline-secondary me-2"
                            title="Lihat Riwayat Invoice"
                          >
                            <i className="fas fa-history"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => handleOpenInvoiceModal(store)}
                          >
                            Tagih PRO
                          </button>
                        </>
                      )}
                      <Link
                        to={`/admin/stores/${store.id}/settings`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        Kelola
                      </Link>
                      <div className="dropdown d-inline-block">
                        <button
                          className="btn btn-sm btn-outline-dark dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Ubah Status
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(store.id, "active")
                              }
                            >
                              Aktifkan
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleStatusChange(store.id, "inactive")
                              }
                            >
                              Nonaktifkan
                            </button>
                          </li>
                        </ul>
                      </div>
                      <button
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() =>
                          handleRequestDelete(store.id, store.name)
                        }
                        title="Minta Hapus Toko"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <p className="text-muted mb-0">
                      Tidak ada toko yang cocok dengan kriteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list d-lg-none">
          {currentStoresOnPage.map((store) => (
            <div className="mobile-card" key={store.id}>
              <div className="mobile-card-header">
                <span className="fw-bold text-truncate">{store.name}</span>
                <span className={`badge ${getStatusBadge(store.storeStatus)}`}>
                  {store.storeStatus}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <small>Pemilik</small>
                  <span>{store.owner?.name || store.owner}</span>
                </div>
                <div className="mobile-card-row">
                  <small>Tier</small>
                  <span
                    className={`badge ${
                      store.tier === "PRO"
                        ? "bg-warning text-dark"
                        : "bg-info text-dark"
                    }`}
                  >
                    {store.tier}
                  </span>
                </div>
                <div className="mobile-card-row">
                  <small>Rating</small>
                  <span>
                    <i className="fas fa-star text-warning me-1"></i>{" "}
                    {store.rating || "N/A"}
                  </span>
                </div>
              </div>
              <div className="mobile-card-footer d-flex justify-content-end gap-2">
                {store.tier === "PRO" && (
                  <>
                    <Link
                      to={`/admin/stores/${store.id}/invoices`}
                      className="btn btn-sm btn-outline-secondary"
                      title="Lihat Riwayat Invoice"
                    >
                      <i className="fas fa-history"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleOpenInvoiceModal(store)}
                    >
                      Tagih
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRequestDelete(store.id, store.name)}
                  title="Minta Hapus Toko"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <Link
                  to={`/admin/stores/${store.id}/settings`}
                  className="btn btn-sm btn-primary"
                >
                  Kelola
                </Link>
              </div>
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        </div>

        {filteredStores.length === 0 && !loading && (
          <div className="text-center p-4 text-muted">
            Data toko tidak ditemukan.
          </div>
        )}
      </div>

      {showInvoiceModal && currentStore && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleInvoiceSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Buat Tagihan untuk {currentStore.name}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseInvoiceModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="period" className="form-label">
                        Periode Tagihan (YYYY-MM)
                      </label>
                      <input
                        type="month"
                        className="form-control"
                        id="period"
                        value={invoiceDetails.period}
                        onChange={(e) =>
                          setInvoiceDetails({
                            ...invoiceDetails,
                            period: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        className="form-control"
                        id="notes"
                        rows="3"
                        value={invoiceDetails.notes}
                        onChange={(e) =>
                          setInvoiceDetails({
                            ...invoiceDetails,
                            notes: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseInvoiceModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={handlePreviewInvoice}
                      disabled={!invoiceDetails.period}
                    >
                      Pratinjau Cetak
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmittingInvoice}
                    >
                      {isSubmittingInvoice ? "Mengirim..." : "Kirim Tagihan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default AdminStoresPage;
