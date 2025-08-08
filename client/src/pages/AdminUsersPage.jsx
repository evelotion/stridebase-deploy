import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

const AdminUsersPage = ({ showMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      fetchUsers();
    }, 500);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    const userName = users.find((u) => u.id === userId)?.name || "Pengguna";

    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah peran ${userName} menjadi "${newRole}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
      });

      const updatedUser = await response.json();
      if (!response.ok) {
        throw new Error(
          updatedUser.message || "Gagal mengubah peran pengguna."
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        )
      );
      showMessage(`Peran untuk ${userName} berhasil diubah.`);
    } catch (error) {
      console.error(error);
      showMessage(error.message);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const token = localStorage.getItem("token");
    const userName = users.find((u) => u.id === userId)?.name || "Pengguna";
    const actionText = newStatus === "blocked" ? "memblokir" : "mengaktifkan";

    if (!confirm(`Apakah Anda yakin ingin ${actionText} ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });

      const updatedUser = await response.json();
      if (!response.ok) {
        throw new Error(
          updatedUser.message || "Gagal mengubah status pengguna."
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, status: updatedUser.status } : user
        )
      );
      showMessage(
        `Pengguna ${userName} berhasil di-${
          newStatus === "blocked" ? "blokir" : "aktifkan"
        }.`
      );
    } catch (error) {
      console.error(error);
      showMessage(error.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    return words.length > 1
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    // Skeleton loader can remain the same
    return (
      <div className="container-fluid px-4">
        <h2 className="fs-2 m-4">Manajemen Pengguna</h2>
        <div className="table-card p-3 shadow-sm">
          <div className="text-center p-5">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Manajemen Pengguna</h2>
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive d-none d-lg-block">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama User</th>
                <th>Email</th>
                <th>Total Belanja</th>
                <th>Jml. Transaksi</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar avatar-initials me-3">
                        <span>{getInitials(user.name)}</span>
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>Rp {user.totalSpent.toLocaleString("id-ID")}</td>
                  <td>{user.transactionCount}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.role || "customer"}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="customer">Customer</option>
                      <option value="mitra">Mitra</option>
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        (user.status || "active") === "active"
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      {(user.status || "active") === "active" ? (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          title="Blokir Pengguna"
                          onClick={() => handleStatusChange(user.id, "blocked")}
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          title="Aktifkan Pengguna"
                          onClick={() => handleStatusChange(user.id, "active")}
                        >
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="Edit Pengguna"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list d-lg-none">
          {users.map((user) => (
            <div className="mobile-card" key={user.id}>
              <div className="mobile-card-header">
                <div>
                  <span className="fw-bold">{user.name}</span>
                  <small className="d-block text-muted">{user.email}</small>
                </div>
                <span
                  className={`badge bg-${
                    (user.status || "active") === "active"
                      ? "success"
                      : "danger"
                  }`}
                >
                  {user.status || "active"}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <small>Total Belanja</small>
                  <span>Rp {user.totalSpent.toLocaleString("id-ID")}</span>
                </div>
                <div className="mobile-card-row">
                  <small>Jml. Transaksi</small>
                  <span>{user.transactionCount}</span>
                </div>
                <div className="mobile-card-row">
                  <small>Peran</small>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "150px" }}
                    value={user.role || "customer"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="mitra">Mitra</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>
              </div>
              <div className="mobile-card-footer">
                {(user.status || "active") === "active" ? (
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => handleStatusChange(user.id, "blocked")}
                  >
                    <i className="fas fa-ban me-1"></i> Blokir
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleStatusChange(user.id, "active")}
                  >
                    <i className="fas fa-check-circle me-1"></i> Aktifkan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
