import React, { useState, useEffect } from "react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memberi sedikit jeda agar skeleton loader terlihat (hanya untuk demonstrasi)
    setTimeout(() => {
      fetchUsers();
    }, 500);
  }, []);

  const fetchUsers = async () => {
    setLoading(true); // Pastikan loading true di awal fetch
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("import.meta.env.VITE_API_BASE_URL + "/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      // Di aplikasi nyata, Anda mungkin ingin menampilkan notifikasi error di sini
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
      const response = await fetch(`import.meta.env.VITE_API_BASE_URL + "/api/admin/users/${userId}/role`, {
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
      const response = await fetch(`import.meta.env.VITE_API_BASE_URL + "/api/admin/users/${userId}/status`, {
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

  // ### PERUBAHAN 1: BLOK LOADING DENGAN SKELETON ###
  if (loading) {
    const SkeletonRow = () => (
      <tr>
        {/* Kolom Nama User */}
        <td>
          <div className="d-flex align-items-center">
            <div className="skeleton skeleton-avatar me-3"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text"></div>
            </div>
          </div>
        </td>
        {/* Kolom Email */}
        <td>
          <div className="skeleton skeleton-text"></div>
        </td>
        {/* Kolom Total Belanja */}
        <td>
          <div className="skeleton skeleton-text"></div>
        </td>
        {/* Kolom Jml. Transaksi */}
        <td>
          <div
            className="skeleton skeleton-text"
            style={{ width: "50px" }}
          ></div>
        </td>
        {/* Kolom Peran */}
        <td>
          <div
            className="skeleton skeleton-text"
            style={{ width: "100px" }}
          ></div>
        </td>
        {/* Kolom Status */}
        <td>
          <div
            className="skeleton skeleton-text"
            style={{ width: "80px" }}
          ></div>
        </td>
        {/* Kolom Aksi */}
        <td>
          <div
            className="skeleton skeleton-text"
            style={{ width: "80px" }}
          ></div>
        </td>
      </tr>
    );

    // Tampilkan tabel dengan baris-baris skeleton
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
                  <th>Total Belanja</th>
                  <th>Jml. Transaksi</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

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
                  {/* ### PERUBAHAN 2: STANDARDISASI TOMBOL AKSI ### */}
                  <td>
                    <div className="btn-group">
                      {/* Tombol Ubah Status (Aktif/Blokir) */}
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

                      {/* Tombol Edit (Aksi di masa depan) */}
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
      </div>
    </div>
  );
};

export default AdminUsersPage;
