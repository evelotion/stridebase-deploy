// File: client/src/pages/AdminUsersPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  createUserByAdmin,
  requestUserDeletion,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

// --- COMPONENT: PAGINATION (MAX 5 BUTTONS) ---
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;

  // Logika: Tampilkan maksimal 5 tombol halaman
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(pageCount, startPage + 4);

  // Koreksi jika halaman mendekati akhir (tetap tampilkan 5 tombol jika ada)
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
        {/* Prev Button */}
        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {/* Page Numbers (Limited) */}
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

        {/* Next Button */}
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

// --- MODAL TAMBAH USER ---
const AddUserModal = ({ show, handleClose, handleSubmit, showMessage }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await handleSubmit(userData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backdropFilter: "blur(5px)", zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content pe-card p-0 border-0 shadow-lg"
            style={{
              backgroundColor: "var(--pe-card-bg)",
              color: "var(--pe-text-main)",
              border: "1px solid var(--pe-card-border)",
            }}
          >
            <div
              className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3"
              style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            >
              <h5 className="pe-title mb-0 fs-6">Tambah Pengguna Baru</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                style={{ filter: "var(--pe-filter-invert, none)" }}
              ></button>
            </div>
            <form onSubmit={onFormSubmit}>
              <div className="modal-body px-4 py-4">
                <div className="mb-3">
                  <label
                    className="form-label small text-uppercase fw-bold"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    onChange={handleChange}
                    required
                    placeholder="Contoh: John Doe"
                    style={{
                      backgroundColor: "var(--pe-bg)",
                      color: "var(--pe-text-main)",
                      borderColor: "var(--pe-card-border)",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label small text-uppercase fw-bold"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    style={{
                      backgroundColor: "var(--pe-bg)",
                      color: "var(--pe-text-main)",
                      borderColor: "var(--pe-card-border)",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label small text-uppercase fw-bold"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    onChange={handleChange}
                    required
                    minLength="8"
                    placeholder="Minimal 8 karakter"
                    style={{
                      backgroundColor: "var(--pe-bg)",
                      color: "var(--pe-text-main)",
                      borderColor: "var(--pe-card-border)",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label small text-uppercase fw-bold"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    Peran
                  </label>
                  
                  {/* FIX: Dropdown menggunakan Variabel Tema */}
                  <select
                    className="form-select"
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    style={{
                      backgroundColor: "var(--pe-bg)",
                      color: "var(--pe-text-main)",
                      borderColor: "var(--pe-card-border)",
                    }}
                  >
                    <option value="customer" style={{ backgroundColor: "var(--pe-card-bg)", color: "var(--pe-text-main)" }}>Customer</option>
                    <option value="mitra" style={{ backgroundColor: "var(--pe-card-bg)", color: "var(--pe-text-main)" }}>Mitra</option>
                    <option value="admin" style={{ backgroundColor: "var(--pe-card-bg)", color: "var(--pe-text-main)" }}>Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-25 bg-transparent px-4 py-3">
                <button
                  type="button"
                  className="pe-btn-action"
                  onClick={handleClose}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="pe-btn-action"
                  style={{
                    background: "var(--pe-accent)",
                    borderColor: "var(--pe-accent)",
                    color: "#fff",
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Pengguna"}
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

// --- HALAMAN UTAMA ADMIN USERS ---
const AdminUsersPage = ({ showMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination State (Show 10)
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Mobile Bottom Sheet State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      if (showMessage)
        showMessage("Peran pengguna berhasil diubah.", "Success");
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    let newStatus =
      currentStatus === "pending" || currentStatus === "blocked"
        ? "active"
        : "blocked";
    try {
      await changeUserStatus(userId, { status: newStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      if (showMessage)
        showMessage(
          `Pengguna sekarang ${newStatus === "active" ? "Aktif" : "Diblokir"}.`,
          "Success"
        );
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const result = await createUserByAdmin(userData);
      showMessage(result.message, "Success");
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      showMessage(err.message, "Error");
      throw err;
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role !== "customer") {
      showMessage(
        `Ubah peran "${user.name}" menjadi 'customer' dahulu.`,
        "Info"
      );
      return;
    }
    if (!window.confirm(`Hapus permanen "${user.name}"?`)) return;

    try {
      const result = await requestUserDeletion(user.id);
      showMessage(result.message, "Success");
      setIsSheetOpen(false);
    } catch (err) {
      showMessage(err.message, "Error");
    }
  };

  // Mobile Sheet Handlers
  const openActionSheet = (user) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const closeActionSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "pe-badge pe-badge-danger";
      case "developer":
        return "pe-badge pe-badge-info";
      case "mitra":
        return "pe-badge pe-badge-warning";
      default:
        return "pe-badge"; // Customer
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === "active"
      ? "pe-badge pe-badge-success"
      : "pe-badge pe-badge-danger";
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // --- LOGIC PAGINATION ---
  const pageCount = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const currentUsersOnPage = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* Sticky Header & Search */}
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="pe-title mb-0 fs-4">Pengguna</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-sm btn-primary rounded-pill px-3"
          >
            <i className="fas fa-plus me-1"></i> Baru
          </button>
        </div>

        <div className="position-relative">
          <i
            className="fas fa-search position-absolute"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--pe-text-muted)", // Warna Adaptif
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
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div
          className="d-flex gap-2 mt-3 overflow-auto pb-1"
          style={{ whiteSpace: "nowrap", scrollbarWidth: "none" }}
        >
          {["all", "customer", "mitra", "admin", "developer"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                filterRole === role ? "fw-bold" : ""
              }`}
              style={{
                background:
                  filterRole === role
                    ? "var(--pe-accent)"
                    : "var(--pe-card-bg)",
                color: filterRole === role ? "#fff" : "var(--pe-text-muted)",
                fontSize: "0.8rem",
                textTransform: "capitalize",
              }}
            >
              {role === "all" ? "Semua" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="px-3 py-2">
        {currentUsersOnPage.length > 0 ? (
          currentUsersOnPage.map((user) => (
            <div
              className="pe-card mb-3 p-3"
              key={user.id}
              onClick={() => openActionSheet(user)}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-5 flex-shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      user.role === "admin"
                        ? "var(--pe-accent-admin)"
                        : user.role === "mitra"
                        ? "var(--pe-warning)"
                        : "var(--pe-accent)",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6
                      className="mb-0 fw-bold text-truncate"
                      style={{
                        color: "var(--pe-text-main)",
                        maxWidth: "140px",
                      }}
                    >
                      {user.name}
                    </h6>
                    <span
                      className={getRoleBadgeClass(user.role)}
                      style={{ fontSize: "0.6rem" }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <small
                    className="d-block text-truncate mb-1"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    {user.email}
                  </small>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge rounded-pill ${
                        user.status === "active"
                          ? "bg-success bg-opacity-25 text-success"
                          : "bg-danger bg-opacity-25 text-danger"
                      }`}
                      style={{ fontSize: "0.6rem" }}
                    >
                      {user.status === "active" ? "Aktif" : "Blokir"}
                    </span>
                    <small
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--pe-text-muted)",
                      }}
                    >
                      • {user.transactionCount || 0} Trx
                    </small>
                  </div>
                </div>
                <i
                  className="fas fa-ellipsis-v opacity-50"
                  style={{ color: "var(--pe-text-muted)" }}
                ></i>
              </div>
            </div>
          ))
        ) : (
          <div
            className="text-center py-5"
            style={{ color: "var(--pe-text-muted)" }}
          >
            Tidak ada user ditemukan.
          </div>
        )}

        {/* Pagination Mobile */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Bottom Sheet */}
      {/* ... Bottom Sheet code remains same ... */}
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

        {selectedUser && (
          <>
            <div className="text-center mb-4">
              <h5 className="fw-bold mb-1">{selectedUser.name}</h5>
              <p
                className="small mb-3"
                style={{ color: "var(--pe-text-muted)" }}
              >
                {selectedUser.email}
              </p>
              <div className="d-flex justify-content-center gap-2">
                <span className={getRoleBadgeClass(selectedUser.role)}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <h6
              className="small fw-bold mb-3 text-uppercase"
              style={{ color: "var(--pe-text-muted)" }}
            >
              Tindakan
            </h6>
            <div className="d-grid gap-2">
              <button
                className={`btn ${
                  selectedUser.status === "active"
                    ? "btn-outline-danger"
                    : "btn-outline-success"
                } py-2 rounded-3 d-flex justify-content-between align-items-center`}
                onClick={() =>
                  handleStatusChange(selectedUser.id, selectedUser.status)
                }
              >
                <span>
                  <i
                    className={`fas ${
                      selectedUser.status === "active" ? "fa-ban" : "fa-check"
                    } me-2`}
                  ></i>{" "}
                  {selectedUser.status === "active"
                    ? "Blokir User"
                    : "Aktifkan User"}
                </span>
              </button>

              <div className="dropdown w-100">
                <button
                  className="btn btn-outline-secondary w-100 py-2 rounded-3 d-flex justify-content-between align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <span>
                    <i className="fas fa-user-tag me-2"></i> Ubah Peran
                  </span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <ul
                  className="dropdown-menu w-100 border-secondary"
                  style={{ backgroundColor: "var(--pe-card-bg)" }}
                >
                  {["customer", "mitra", "admin"].map((role) => (
                    <li key={role}>
                      <button
                        className="dropdown-item"
                        style={{ color: "var(--pe-text-main)" }}
                        onClick={() => handleRoleChange(selectedUser.id, role)}
                      >
                        Set as {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedUser.role !== "developer" && (
                <button
                  className="btn btn-danger bg-opacity-10 text-danger border-0 py-2 rounded-3 d-flex justify-content-between align-items-center mt-2"
                  onClick={() => handleDeleteUser(selectedUser)}
                >
                  <span>
                    <i className="fas fa-trash-alt me-2"></i> Hapus Permanen
                  </span>
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
     RENDER: DESKTOP VIEW
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block position-relative z-2">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Data Master
            </h6>
            <h2 className="pe-title mb-0">Manajemen Pengguna</h2>
          </div>
        </Fade>
        <button className="pe-btn-action" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus me-2"></i>Tambah User
        </button>
      </div>

      <Fade triggerOnce>
        <div className="pe-card mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent border-secondary"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-secondary"
                  placeholder="Cari pengguna (Nama / Email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ color: "var(--pe-text-main)" }}
                />
              </div>
            </div>
            <div className="col-md-4">
              {/* FIX: Dropdown Warna Adaptif */}
              <select
                className="form-select bg-transparent border-secondary"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  color: "var(--pe-text-main)",
                  backgroundColor: "var(--pe-card-bg)",
                }}
              >
                <option
                  value="all"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Semua Peran
                </option>
                <option
                  value="customer"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Customer
                </option>
                <option
                  value="mitra"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Mitra
                </option>
                <option
                  value="admin"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Admin
                </option>
                <option
                  value="developer"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Developer
                </option>
              </select>
            </div>
          </div>
        </div>
      </Fade>

      <Fade delay={100} triggerOnce>
        {/* TABEL */}
        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table align-middle">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Trx</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentUsersOnPage.length > 0 ? (
                  currentUsersOnPage.map((user) => (
                    <tr key={user.id} className="pe-table-row-hover">
                      <td>
                        <span
                          className="fw-bold"
                          style={{ color: "var(--pe-text-main)" }}
                        >
                          {user.name}
                        </span>
                      </td>
                      <td
                        className="small"
                        style={{ color: "var(--pe-text-muted)" }}
                      >
                        {user.email}
                      </td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--pe-text-main)" }}>
                        {user.transactionCount || 0}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <div className="dropdown">
                            <button
                              className="pe-btn-action py-1 px-2"
                              data-bs-toggle="dropdown"
                            >
                              <i className="fas fa-cog"></i>
                            </button>
                            <ul
                              className="dropdown-menu dropdown-menu-end shadow"
                              style={{
                                backgroundColor: "var(--pe-card-bg)",
                                border: "1px solid var(--pe-card-border)",
                              }}
                            >
                              <li>
                                <h6
                                  className="dropdown-header"
                                  style={{ color: "var(--pe-text-muted)" }}
                                >
                                  Ubah Peran
                                </h6>
                              </li>
                              {["customer", "mitra", "admin"].map((role) => (
                                <li key={role}>
                                  <button
                                    className="dropdown-item"
                                    style={{ color: "var(--pe-text-main)" }} // Pastikan teks kontras
                                    onClick={() =>
                                      handleRoleChange(user.id, role)
                                    }
                                  >
                                    Set as{" "}
                                    {role.charAt(0).toUpperCase() +
                                      role.slice(1)}
                                  </button>
                                </li>
                              ))}
                              <li>
                                <hr
                                  className="dropdown-divider"
                                  style={{
                                    borderColor: "var(--pe-card-border)",
                                  }}
                                />
                              </li>
                              <li className="px-3 py-1">
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={user.status === "active"}
                                    onChange={() =>
                                      handleStatusChange(user.id, user.status)
                                    }
                                  />
                                  <label
                                    className="form-check-label ms-2"
                                    style={{ color: "var(--pe-text-main)" }}
                                  >
                                    Aktif?
                                  </label>
                                </div>
                              </li>
                            </ul>
                          </div>
                          {user.role !== "developer" && (
                            <button
                              className="pe-btn-action py-1 px-2 text-danger"
                              onClick={() => handleDeleteUser(user)}
                              title="Request Hapus"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION DESKTOP (Di Bawah Card) */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-2"></div>

      {renderMobileView()}
      {renderDesktopView()}

      <AddUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleCreateUser}
        showMessage={showMessage}
      />
    </div>
  );
};

export default AdminUsersPage;
