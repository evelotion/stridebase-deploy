// File: client/src/pages/AdminStoresPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  getAllStoresForAdmin,
  updateStoreDetails,
  createStoreInvoiceByAdmin,
  requestStoreDeletion,
  getAllUsers,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

// --- COMPONENT: PAGINATION (Compact Version) ---
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="mt-3 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-10 pt-2">
      <span className="text-muted" style={{ fontSize: "0.75rem" }}>
        Hal {currentPage} / {pageCount}
      </span>
      <div className="d-flex gap-1">
        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: "0.75rem" }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="d-none d-md-flex gap-1">
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
                      fontSize: "0.75rem",
                    }
                  : { opacity: 0.7, fontSize: "0.75rem" }
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
          style={{ fontSize: "0.75rem" }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: EDIT MODAL ---
const EditStoreModal = ({
  show,
  handleClose,
  store,
  mitraList,
  handleSubmit,
  showMessage,
}) => {
  const [status, setStatus] = useState("active");
  const [ownerId, setOwnerId] = useState("");
  const [billingType, setBillingType] = useState("COMMISSION");
  const [commissionRate, setCommissionRate] = useState(10);
  const [contractFee, setContractFee] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setStatus(store.storeStatus || "active");
      setOwnerId(store.ownerId || "");
      setBillingType(store.billingType || "COMMISSION");
      setCommissionRate(
        store.commissionRate !== undefined ? store.commissionRate : 10
      );
      setContractFee(store.contractFee !== undefined ? store.contractFee : 0);
    }
  }, [store]);

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (!ownerId) {
      showMessage("Anda harus memilih pemilik toko.", "Error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        storeStatus: status,
        ownerId,
        billingType,
        commissionRate:
          billingType === "COMMISSION" ? parseFloat(commissionRate) : 0,
        contractFee: billingType === "CONTRACT" ? parseFloat(contractFee) : 0,
      };

      await handleSubmit(store.id, payload);
      showMessage("Data toko berhasil diperbarui.", "Success");
      handleClose();
    } catch (error) {
      showMessage(error.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!show || !store) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backdropFilter: "blur(5px)", zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content pe-card p-0 border-0 shadow-lg overflow-hidden">
            <div
              className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            >
              <h5 className="pe-title mb-0 fs-6 text-white">
                Edit Toko: <span className="text-info">{store.name}</span>
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>
            <form onSubmit={onFormSubmit} className="px-4 py-4">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label
                    className="small text-muted mb-1 text-uppercase fw-bold"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Status Toko
                  </label>
                  <select
                    className="form-select form-select-sm bg-dark text-white border-secondary"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Aktif (Buka)</option>
                    <option value="inactive">Non-Aktif (Tutup)</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label
                    className="small text-muted mb-1 text-uppercase fw-bold"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Pemilik (Mitra)
                  </label>
                  <select
                    className="form-select form-select-sm bg-dark text-white border-secondary"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Mitra
                    </option>
                    {mitraList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="p-3 rounded-3 mb-3 border border-secondary border-opacity-25"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <label
                  className="small text-info fw-bold mb-2 d-block text-uppercase tracking-widest"
                  style={{ fontSize: "0.7rem" }}
                >
                  <i className="fas fa-file-contract me-2"></i>Model Bisnis &
                  Keuangan
                </label>
                <div className="d-flex gap-3 mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="billingType"
                      id="billCommission"
                      checked={billingType === "COMMISSION"}
                      onChange={() => setBillingType("COMMISSION")}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label text-white small"
                      htmlFor="billCommission"
                      style={{ cursor: "pointer" }}
                    >
                      Komisi (%)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="billingType"
                      id="billContract"
                      checked={billingType === "CONTRACT"}
                      onChange={() => setBillingType("CONTRACT")}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label text-white small"
                      htmlFor="billContract"
                      style={{ cursor: "pointer" }}
                    >
                      Kontrak (Rp)
                    </label>
                  </div>
                </div>
                {billingType === "COMMISSION" ? (
                  <div className="mb-1">
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="10"
                      />
                      <span className="input-group-text bg-secondary border-secondary text-white">
                        %
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-1">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-secondary border-secondary text-white">
                        Rp
                      </span>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={contractFee}
                        onChange={(e) => setContractFee(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="pe-btn-action py-1 px-3"
                  onClick={handleClose}
                  style={{ fontSize: "0.85rem" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pe-btn-action py-1 px-3"
                  style={{
                    background: "var(--pe-accent)",
                    borderColor: "var(--pe-accent)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        style={{ opacity: 0.7, background: "#000", zIndex: 1050 }}
      ></div>
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
const AdminStoresPage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [mitraUsers, setMitraUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const STORES_PER_PAGE = 12; // Menambah jumlah per halaman karena ukuran lebih kecil

  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Mobile Sheet

  const [invoiceDetails, setInvoiceDetails] = useState({
    period: "",
    notes: "",
  });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [storesData, usersData] = await Promise.all([
        getAllStoresForAdmin(),
        getAllUsers(),
      ]);
      setStores(storesData);
      setMitraUsers(usersData.filter((user) => user.role === "mitra"));
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleOpenActionSheet = (store) => {
    setSelectedStore(store);
    setIsSheetOpen(true);
  };

  const handleCloseActionSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedStore(null), 300);
  };

  const handleOpenEditModal = (store = selectedStore) => {
    setIsSheetOpen(false);
    setSelectedStore(store);
    setShowEditModal(true);
  };

  const handleUpdateStore = async (storeId, data) => {
    await updateStoreDetails(storeId, data);
    await fetchData();
  };

  const handleOpenInvoiceModal = (store = selectedStore) => {
    if (store.billingType !== "CONTRACT") {
      showMessage("Toko ini menggunakan sistem Komisi.", "Info");
      return;
    }
    setIsSheetOpen(false);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = (lastMonth.getMonth() + 1).toString().padStart(2, "0");

    setSelectedStore(store);
    setInvoiceDetails({
      period: `${year}-${month}`,
      notes: `Tagihan Kontrak Mitra periode ${lastMonth.toLocaleString(
        "id-ID",
        { month: "long", year: "numeric" }
      )}.`,
    });
    setShowInvoiceModal(true);
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore || !invoiceDetails.period) return;
    setIsSubmittingInvoice(true);
    try {
      const response = await createStoreInvoiceByAdmin(
        selectedStore.id,
        invoiceDetails
      );
      showMessage(response.message || "Invoice berhasil dikirim.", "Success");
      setShowInvoiceModal(false);
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleRequestDelete = async (storeId, storeName) => {
    if (!window.confirm(`Yakin ingin menghapus toko "${storeName}"?`)) return;
    setIsSheetOpen(false);
    try {
      const result = await requestStoreDeletion(storeId);
      showMessage(result.message, "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const getStatusBadge = (status) => {
    let badgeClass = "pe-badge-secondary";
    let text = status;
    if (status === "active") {
      badgeClass = "pe-badge-success";
      text = "Aktif";
    } else if (status === "pending") {
      badgeClass = "pe-badge-warning";
      text = "Pending";
    } else if (status === "rejected" || status === "inactive") {
      badgeClass = "pe-badge-danger";
      text = "Non-Aktif";
    }
    return (
      <span
        className={`pe-badge ${badgeClass}`}
        style={{ fontSize: "0.65rem", padding: "4px 8px" }}
      >
        {text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
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

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (COMPACT)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* Sticky Search - Lebih Ramping */}
      <div
        className="sticky-top px-3 py-2"
        style={{
          top: "60px",
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex gap-2">
          <div className="position-relative flex-grow-1">
            <i
              className="fas fa-search position-absolute text-muted"
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.8rem",
              }}
            ></i>
            <input
              type="text"
              className="form-control rounded-pill ps-4 border-0"
              style={{
                background: "var(--pe-card-bg)",
                color: "var(--pe-text-main)",
                fontSize: "0.85rem",
                height: "38px",
              }}
              placeholder="Cari toko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/admin/stores/new"
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "38px", height: "38px", flexShrink: 0 }}
          >
            <i className="fas fa-plus small"></i>
          </Link>
        </div>

        <div
          className="d-flex gap-2 mt-2 overflow-auto"
          style={{ paddingBottom: "2px", scrollbarWidth: "none" }}
        >
          {["all", "pending", "active", "inactive"].map((status) => (
            <button
              key={status}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                filterStatus === status
                  ? "bg-white text-dark"
                  : "bg-secondary bg-opacity-25 text-muted"
              }`}
              style={{
                whiteSpace: "nowrap",
                fontSize: "0.7rem",
                fontWeight: 600,
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all"
                ? "Semua"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Card List - Lebih Ramping & Fix Warna Font */}
      <div className="px-2 py-2">
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div
              className="pe-card mb-2 p-2 position-relative"
              key={store.id}
              onClick={() => handleOpenActionSheet(store)}
              style={{ padding: "12px 16px" }}
            >
              <div className="d-flex align-items-center gap-3">
                {/* Store Avatar - Diperkecil */}
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 border border-secondary"
                  style={{
                    width: 42,
                    height: 42,
                    background: "#000",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      store.headerImageUrl ||
                      store.images?.[0] ||
                      "https://placehold.co/100x100/111/FFF?text=IMG"
                    }
                    alt="Logo"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100?text=Error";
                    }}
                  />
                </div>

                {/* Store Info */}
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6
                      className="mb-0 fw-bold text-truncate"
                      style={{
                        color: "var(--pe-text-main)",
                        maxWidth: "140px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {store.name}
                    </h6>
                    {getStatusBadge(store.storeStatus)}
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {/* FIX: Warna font alamat sekarang mengikuti tema (var(--pe-text-muted)) */}
                    <small
                      className="text-truncate"
                      style={{
                        maxWidth: "120px",
                        fontSize: "0.75rem",
                        color: "var(--pe-text-muted)",
                      }}
                    >
                      <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                      {store.location || "N/A"}
                    </small>
                    <span
                      className="small"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      •
                    </span>
                    <small
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--pe-text-muted)",
                      }}
                    >
                      {store.owner?.name?.split(" ")[0]}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <p className="text-muted small">Toko tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet Action */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={handleCloseActionSheet}
      ></div>

      <div
        className="position-fixed bottom-0 start-0 w-100 pe-card rounded-top-4 p-4"
        style={{
          zIndex: 2010,
          transform: isSheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTop: "1px solid var(--pe-card-border)",
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

        {selectedStore && (
          <>
            <div className="text-center mb-4">
              <h5 className="fw-bold mb-1 pe-title">{selectedStore.name}</h5>
              <p className="text-muted small">{selectedStore.owner?.name}</p>
            </div>

            <div className="d-grid gap-2 mb-3">
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-opacity-10"
                style={{ background: "rgba(255,255,255,0.03)" }}
                onClick={() => handleOpenEditModal(selectedStore)}
              >
                <span className="small fw-bold">
                  <i className="fas fa-edit me-3 text-info"></i>Edit Informasi
                </span>
                <i className="fas fa-chevron-right small opacity-50"></i>
              </button>
              <Link
                to={`/admin/stores/${selectedStore.id}/settings`}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-opacity-10"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span className="small fw-bold">
                  <i className="fas fa-cog me-3 text-warning"></i>Pengaturan
                </span>
                <i className="fas fa-chevron-right small opacity-50"></i>
              </Link>
              {selectedStore.billingType === "CONTRACT" && (
                <button
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-opacity-10"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  onClick={() => handleOpenInvoiceModal(selectedStore)}
                >
                  <span className="small fw-bold">
                    <i className="fas fa-file-invoice-dollar me-3 text-success"></i>
                    Buat Invoice
                  </span>
                  <i className="fas fa-chevron-right small opacity-50"></i>
                </button>
              )}
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-opacity-10 text-danger"
                style={{ background: "rgba(239,68,68,0.05)" }}
                onClick={() =>
                  handleRequestDelete(selectedStore.id, selectedStore.name)
                }
              >
                <span className="small fw-bold">
                  <i className="fas fa-trash-alt me-3"></i>Hapus Toko
                </span>
                <i className="fas fa-chevron-right small opacity-50"></i>
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ height: "100px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (COMPACT TABLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block position-relative z-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
        <Fade direction="down" triggerOnce>
          <div>
            <h6
              className="pe-subtitle text-uppercase tracking-widest mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              Mitra & Layanan
            </h6>
            <h2 className="pe-title mb-0" style={{ fontSize: "1.5rem" }}>
              Manajemen Toko
            </h2>
          </div>
        </Fade>

        <Fade direction="down" delay={100} triggerOnce>
          <Link
            to="/admin/stores/new"
            className="pe-btn-action mt-3 mt-md-0 text-decoration-none py-2 px-3"
            style={{ fontSize: "0.85rem" }}
          >
            <i className="fas fa-plus-circle me-2"></i> Tambah Toko
          </Link>
        </Fade>
      </div>

      <Fade triggerOnce>
        <div className="pe-card position-relative z-2 mb-3 p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-9">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-secondary text-muted">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent text-white border-secondary"
                  placeholder="Cari nama toko, pemilik, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm border-secondary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  fontSize: "0.85rem",
                  backgroundColor: "var(--pe-card-bg)", // Adaptif: Putih (Light) / Hitam (Dark)
                  color: "var(--pe-text-main)", // Adaptif: Hitam (Light) / Putih (Dark)
                  borderColor: "var(--pe-card-border)",
                }}
              >
                {/* Hapus className="bg-dark" dari option */}
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="pending">Menunggu</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pe-card position-relative z-2 p-0 overflow-hidden">
          <div className="pe-table-wrapper">
            <table className="pe-table align-middle mb-0">
              <thead style={{ backgroundColor: "rgba(128, 128, 128, 0.1)" }}>
                {/* Menggunakan transparansi abu-abu yang aman untuk Light & Dark Mode */}
                <tr>
                  <th
                    style={{
                      width: "35%",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Profil Toko
                  </th>
                  <th
                    style={{
                      width: "20%",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Lokasi & Rating
                  </th>
                  <th
                    style={{
                      width: "20%",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Keuangan
                  </th>
                  <th
                    style={{
                      width: "10%",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="text-end"
                    style={{
                      width: "15%",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentStoresOnPage.length > 0 ? (
                  currentStoresOnPage.map((store) => (
                    <tr key={store.id} className="pe-table-row-hover">
                      <td style={{ padding: "12px 16px" }}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 border border-secondary p-1 bg-black"
                            style={{ width: "40px", height: "40px" }} // Ukuran gambar lebih kecil
                          >
                            <img
                              src={
                                store.headerImageUrl ||
                                store.images?.[0] ||
                                "https://placehold.co/100x100"
                              }
                              alt={store.name}
                              className="rounded-2 w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div>
                            <div
                              className="fw-bold text-white text-truncate"
                              style={{ fontSize: "0.85rem", maxWidth: "200px" }}
                            >
                              {store.name}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {store.owner?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {/* FIX: Ganti text-white-50 dengan var(--pe-text-muted) agar terlihat di dark/light mode */}
                        <div
                          className="small mb-1 text-truncate"
                          style={{
                            color: "var(--pe-text-muted)",
                            maxWidth: "150px",
                            fontSize: "0.75rem",
                          }}
                        >
                          <i className="fas fa-map-marker-alt text-danger me-2"></i>
                          {store.location || "-"}
                        </div>
                        <div
                          className="d-flex align-items-center gap-1"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <i className="fas fa-star text-warning"></i>
                          <span className="fw-bold text-white">
                            {store.rating ? store.rating.toFixed(1) : "0.0"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          className="text-white font-monospace"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i className="fas fa-wallet me-2 text-success"></i>
                          {formatCurrency(store.wallet?.balance)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {getStatusBadge(store.storeStatus)}
                      </td>
                      <td className="text-end" style={{ padding: "12px 16px" }}>
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="pe-btn-action p-1 px-2"
                            onClick={() => handleOpenEditModal(store)}
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="fas fa-edit text-info"></i>
                          </button>
                          <Link
                            to={`/admin/stores/${store.id}/settings`}
                            className="pe-btn-action p-1 px-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="fas fa-cog"></i>
                          </Link>
                          {store.billingType === "CONTRACT" && (
                            <button
                              className="pe-btn-action p-1 px-2"
                              onClick={() => handleOpenInvoiceModal(store)}
                              style={{ fontSize: "0.8rem" }}
                            >
                              <i className="fas fa-file-invoice-dollar text-warning"></i>
                            </button>
                          )}
                          <button
                            className="pe-btn-action p-1 px-2"
                            onClick={() =>
                              handleRequestDelete(store.id, store.name)
                            }
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="fas fa-trash-alt text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted small"
                    >
                      Tidak ada toko.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 pb-3">
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-3 py-3 position-relative z-1">
      <div className="pe-blob pe-blob-1"></div>

      {renderMobileView()}
      {renderDesktopView()}

      <EditStoreModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        store={selectedStore}
        mitraList={mitraUsers}
        handleSubmit={handleUpdateStore}
        showMessage={showMessage}
      />

      {/* MODAL INVOICE */}
      {showInvoiceModal && selectedStore && (
        <>
          <div
            className="modal fade show d-block"
            style={{ backdropFilter: "blur(5px)", zIndex: 1055 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content pe-card p-0 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-50">
                  <h5 className="pe-title mb-0 fs-6 text-white">
                    Invoice Kontrak:{" "}
                    <span className="text-info">{selectedStore.name}</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowInvoiceModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleInvoiceSubmit} className="p-4">
                  <div className="mb-3">
                    <label className="text-muted small mb-1">Periode</label>
                    <input
                      type="month"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
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
                    <label className="text-muted small mb-1">Nominal</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={(selectedStore.contractFee || 0).toLocaleString(
                        "id-ID"
                      )}
                      disabled
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-muted small mb-1">Catatan</label>
                    <textarea
                      className="form-control form-control-sm bg-dark text-white border-secondary"
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
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="pe-btn-action py-1 px-3"
                      onClick={() => setShowInvoiceModal(false)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="pe-btn-action py-1 px-3"
                      style={{
                        background: "var(--pe-accent)",
                        borderColor: "var(--pe-accent)",
                        color: "#fff",
                        fontSize: "0.85rem",
                      }}
                      disabled={isSubmittingInvoice}
                    >
                      {isSubmittingInvoice ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            style={{ opacity: 0.7, background: "#000", zIndex: 1050 }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AdminStoresPage;
