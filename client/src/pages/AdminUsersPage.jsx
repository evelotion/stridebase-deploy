import React, { useState, useEffect } from "react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/users", {
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
      alert(`Peran untuk ${userName} berhasil diubah.`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // --- FUNGSI BARU UNTUK MENGUBAH STATUS PENGGUNA ---
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

      // Perbarui state secara lokal
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, status: updatedUser.status } : user
        )
      );
      alert(
        `Pengguna ${userName} berhasil di-${
          newStatus === "blocked" ? "blokir" : "aktifkan"
        }.`
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  // ------------------------------------------------

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    return words.length > 1
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="p-4">Memuat data pengguna...</div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Manajemen Pengguna</h2>
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama User</th>
                <th>Email</th>
                <th>Total Belanja</th> {/* <-- KOLOM BARU */}
                <th>Jml. Transaksi</th> {/* <-- KOLOM BARU */}
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
                      <div className="user-avatar avatar-initials me-2">
                        <span>{getInitials(user.name)}</span>
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  {/* -- DATA BARU -- */}
                  <td>Rp {user.totalSpent.toLocaleString("id-ID")}</td>
                  <td>{user.transactionCount}</td>
                  {/* ---------------- */}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.role || "customer"}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
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
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {(user.status || "active") === "active" ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Blokir"
                        onClick={() => handleStatusChange(user.id, "blocked")}
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-success"
                        title="Aktifkan"
                        onClick={() => handleStatusChange(user.id, "active")}
                      >
                        <i className="fas fa-check-circle"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
