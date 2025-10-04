// File: client/src/pages/AdminUsersPage.jsx (Dengan Perbaikan Tampilan Mobile)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
} from "../services/apiService";

const AdminUsersPage = ({ showMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Manajemen Pengguna</h2>
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
        {/* --- AWAL PERBAIKAN --- */}

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
                      <ul className="dropdown-menu dropdown-menu-end">
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
                        <li className="dropdown-header">Ubah Status</li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange(user.id, "active")}
                          >
                            Aktifkan
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange(user.id, "blocked")}
                          >
                            Blokir
                          </button>
                        </li>
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
                  <ul className="dropdown-menu dropdown-menu-end">
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
                    <li className="dropdown-header">Ubah Status</li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleStatusChange(user.id, "active")}
                      >
                        Aktifkan
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleStatusChange(user.id, "blocked")}
                      >
                        Blokir
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- AKHIR PERBAIKAN --- */}
        
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center p-4 text-muted">
            Tidak ada pengguna yang cocok dengan kriteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;