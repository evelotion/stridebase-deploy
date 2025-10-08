// File: client/src/pages/AdminUsersPage.jsx (Dengan Modal Tambah & Toggle Switch)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  createUserByAdmin, // Impor fungsi baru
} from "../services/apiService";

// Komponen Modal Baru
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
      // Error sudah ditangani oleh parent, kita hanya perlu stop loading
    } finally {
      setIsSaving(false);
    }
  };

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
            <form onSubmit={onFormSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Tambah Pengguna Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    required
                    minLength="8"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Peran
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="mitra">Mitra</option>
                    <option value="admin">Admin</option>
                  </select>
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
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Pengguna"}
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

const AdminUsersPage = ({ showMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false); // State untuk modal

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      if (showMessage) showMessage("Peran pengguna berhasil diubah.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await changeUserStatus(userId, newStatus);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      if (showMessage) showMessage("Status pengguna berhasil diubah.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const result = await createUserByAdmin(userData);
      showMessage(result.message, "Success");
      setShowAddModal(false);
      fetchUsers(); // Muat ulang daftar pengguna
    } catch (err) {
      showMessage(err.message, "Error");
      throw err; // Lempar error agar modal tahu proses gagal
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-danger";
      case "developer":
        return "bg-dark";
      case "mitra":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? "bg-success" : "bg-warning text-dark";
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

  if (loading) return <div className="p-4">Memuat data pengguna...</div>;
  if (error && users.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <>
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-2 mb-0">Manajemen Pengguna</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-2"></i>Tambah Pengguna
          </button>
        </div>
        <div className="card card-account p-3 mb-4">
          <div className="row g-2 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Cari pengguna berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Semua Peran</option>
                <option value="customer">Customer</option>
                <option value="mitra">Mitra</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-card p-3 shadow-sm">
          {/* Tampilan Desktop */}
          <div className="table-responsive d-none d-lg-block">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Total Transaksi</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="fw-bold">{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.transactionCount || 0}</td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-dark dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Kelola
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li className="dropdown-header">Ubah Peran</li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleRoleChange(user.id, "customer")
                              }
                            >
                              Set as Customer
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleRoleChange(user.id, "mitra")}
                            >
                              Set as Mitra
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleRoleChange(user.id, "admin")}
                            >
                              Set as Admin
                            </button>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>

                          {/* --- AWAL PERUBAHAN TOGGLE SWITCH --- */}
                          <li className="px-2">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`status-switch-${user.id}`}
                                checked={user.status === "active"}
                                onChange={(e) =>
                                  handleStatusChange(
                                    user.id,
                                    e.target.checked ? "active" : "blocked"
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`status-switch-${user.id}`}
                              >
                                {user.status === "active"
                                  ? "Aktif"
                                  : "Diblokir"}
                              </label>
                            </div>
                          </li>
                          {/* --- AKHIR PERUBAHAN TOGGLE SWITCH --- */}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tampilan Mobile */}
          <div className="mobile-card-list d-lg-none">
            {filteredUsers.map((user) => (
              <div className="mobile-card" key={user.id}>
                <div className="mobile-card-header">
                  <span className="fw-bold text-truncate">{user.name}</span>
                  <span className={`badge ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <small>Email</small>
                    <span className="text-truncate">{user.email}</span>
                  </div>
                  <div className="mobile-card-row">
                    <small>Peran</small>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="mobile-card-footer">
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-dark dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Kelola Pengguna
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-2">
                      <li className="dropdown-header">Ubah Peran</li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleRoleChange(user.id, "customer")}
                        >
                          Set as Customer
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleRoleChange(user.id, "mitra")}
                        >
                          Set as Mitra
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleRoleChange(user.id, "admin")}
                        >
                          Set as Admin
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li className="px-2">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`status-switch-mobile-${user.id}`}
                            checked={user.status === "active"}
                            onChange={(e) =>
                              handleStatusChange(
                                user.id,
                                e.target.checked ? "active" : "blocked"
                              )
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`status-switch-mobile-${user.id}`}
                          >
                            {user.status === "active" ? "Aktif" : "Diblokir"}
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center p-4 text-muted">
              Tidak ada pengguna yang cocok dengan kriteria.
            </div>
          )}
        </div>
      </div>

      <AddUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleCreateUser}
        showMessage={showMessage}
      />
    </>
  );
};

export default AdminUsersPage;
