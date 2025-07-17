import React, { useState, useEffect } from "react";

const AdminPromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromoData, setNewPromoData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    value: "",
  });

  // State untuk modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/promos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil data promo.");
      }
      const data = await response.json();
      setPromos(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi-fungsi untuk modal Tambah
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewPromoData({
      code: "",
      description: "",
      discountType: "percentage",
      value: "",
    });
  };
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewPromoData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveNewPromo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/promos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPromoData),
      });
      const createdPromo = await response.json();
      if (!response.ok) {
        throw new Error(
          createdPromo.message || "Gagal menambahkan promo baru."
        );
      }
      handleCloseAddModal();
      fetchPromos();
      alert(`Promo "${createdPromo.code}" berhasil ditambahkan.`);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fungsi-fungsi untuk modal Edit
  const handleShowEditModal = (promo) => {
    setEditingPromo({ ...promo });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPromo(null);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingPromo((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    if (!editingPromo) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/promos/${editingPromo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingPromo),
      });
      const updatedPromo = await response.json();
      if (!response.ok) {
        throw new Error(updatedPromo.message || "Gagal memperbarui promo.");
      }
      handleCloseEditModal();
      fetchPromos();
      alert(`Promo "${updatedPromo.code}" berhasil diperbarui.`);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fungsi untuk Ubah Status Promo
  const handleStatusChange = async (promoId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const actionText =
      newStatus === "active" ? "mengaktifkan" : "menonaktifkan";

    if (!confirm(`Apakah Anda yakin ingin ${actionText} promo ini?`)) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/promos/${promoId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      const updatedPromo = await response.json();
      if (!response.ok) {
        throw new Error(updatedPromo.message || "Gagal mengubah status promo.");
      }
      fetchPromos();
      alert(`Promo berhasil di-${actionText}.`);
    } catch (error) {
      alert(error.message);
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS PROMO ---
  const handleDeletePromo = async (promoId) => {
    if (
      !confirm("Apakah Anda yakin ingin menghapus promo ini secara permanen?")
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus promo.");
      }
      fetchPromos(); // Muat ulang data
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };
  // ------------------------------------

  const getStatusBadge = (status) => {
    return status === "active" ? "bg-success" : "bg-secondary";
  };

  if (loading) return <div className="p-4">Memuat data promo...</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">Manajemen Promo</h2>
          <button className="btn btn-primary" onClick={handleShowAddModal}>
            <i className="fas fa-plus me-2"></i>Tambah Promo Baru
          </button>
        </div>

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Kode Promo</th>
                  <th>Deskripsi</th>
                  <th>Tipe</th>
                  <th>Nilai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <span className="fw-bold">{promo.code}</span>
                    </td>
                    <td>{promo.description}</td>
                    <td>{promo.discountType}</td>
                    <td>
                      {promo.discountType === "percentage"
                        ? `${promo.value}%`
                        : `Rp ${promo.value.toLocaleString("id-ID")}`}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(promo.status)}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Edit"
                          onClick={() => handleShowEditModal(promo)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={`btn btn-sm ${
                            promo.status === "active"
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                          }`}
                          title={
                            promo.status === "active"
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                          onClick={() =>
                            handleStatusChange(promo.id, promo.status)
                          }
                        >
                          <i
                            className={`fas ${
                              promo.status === "active"
                                ? "fa-power-off"
                                : "fa-check-circle"
                            }`}
                          ></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Hapus"
                          onClick={() => handleDeletePromo(promo.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
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

      {/* Modal Tambah Promo */}
      {showAddModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Promo Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddModal}
                ></button>
              </div>
              <form onSubmit={handleSaveNewPromo}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">
                      Kode Promo
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      name="code"
                      value={newPromoData.code}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="description"
                      name="description"
                      value={newPromoData.description}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="discountType" className="form-label">
                        Tipe Diskon
                      </label>
                      <select
                        className="form-select"
                        id="discountType"
                        name="discountType"
                        value={newPromoData.discountType}
                        onChange={handleAddFormChange}
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Potongan Tetap (Rp)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="value" className="form-label">
                        Nilai
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="value"
                        name="value"
                        value={newPromoData.value}
                        onChange={handleAddFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseAddModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan Promo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Promo */}
      {showEditModal && editingPromo && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Promo: {editingPromo.code}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseEditModal}
                ></button>
              </div>
              <form onSubmit={handleUpdatePromo}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="edit-code" className="form-label">
                      Kode Promo
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-code"
                      name="code"
                      value={editingPromo.code}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-description" className="form-label">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-description"
                      name="description"
                      value={editingPromo.description}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-discountType" className="form-label">
                        Tipe Diskon
                      </label>
                      <select
                        className="form-select"
                        id="edit-discountType"
                        name="discountType"
                        value={editingPromo.discountType}
                        onChange={handleEditFormChange}
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Potongan Tetap (Rp)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="edit-value" className="form-label">
                        Nilai
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="edit-value"
                        name="value"
                        value={editingPromo.value}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseEditModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </>
  );
};

export default AdminPromosPage;
