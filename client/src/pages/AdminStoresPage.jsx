import React, { useState, useEffect } from "react";

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // State untuk modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: "",
    owner: "",
    location: "",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data toko.");
      const data = await response.json();
      setStores(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (storeId, newStatus) => {
    const token = localStorage.getItem("token");
    const storeName = stores.find((s) => s.id === storeId)?.name || "Toko";
    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah status ${storeName} menjadi "${newStatus}"?`
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      if (!response.ok) throw new Error("Gagal mengubah status toko.");
      fetchStores();
      alert(`Status ${storeName} berhasil diubah.`);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fungsi untuk Modal Edit
  const handleShowEditModal = (store) => {
    setEditingStore({ ...store });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStore(null);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingStore((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdateStore = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/stores/${editingStore.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingStore),
      });
      if (!response.ok) throw new Error("Gagal memperbarui data toko.");
      handleCloseEditModal();
      fetchStores();
      alert(`Data untuk ${editingStore.name} berhasil diperbarui.`);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fungsi untuk Modal Tambah
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewStore = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStoreData),
      });
      const createdStore = await response.json();
      if (!response.ok) {
        throw new Error(createdStore.message || "Gagal menambahkan toko baru.");
      }
      handleCloseAddModal();
      fetchStores(); // Ambil data terbaru dari server
      alert(`Toko "${createdStore.name}" berhasil ditambahkan.`);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="p-4">Memuat data toko...</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">Manajemen Toko</h2>
          <button className="btn btn-primary" onClick={handleShowAddModal}>
            <i className="fas fa-plus me-2"></i>Tambah Toko Baru
          </button>
        </div>

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nama Toko</th>
                  <th>Pemilik</th>
                  <th>Lokasi</th>
                  <th>Total Pendapatan</th> {/* <-- KOLOM BARU */}
                  <th>Jml. Transaksi</th> {/* <-- KOLOM BARU */}
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.owner || "N/A"}</td>
                    <td>{store.location}</td>
                    {/* -- DATA BARU -- */}
                    <td>Rp {store.totalRevenue.toLocaleString("id-ID")}</td>
                    <td>{store.transactionCount}</td>
                    {/* ---------------- */}
                    <td>
                      <span
                        className={`badge bg-${
                          store.storeStatus === "active"
                            ? "success"
                            : store.storeStatus === "inactive"
                            ? "secondary"
                            : "warning text-dark"
                        }`}
                      >
                        {store.storeStatus || "pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            store.id,
                            store.storeStatus === "active"
                              ? "inactive"
                              : "active"
                          )
                        }
                        className={`btn btn-sm btn-outline-${
                          store.storeStatus === "active" ? "warning" : "success"
                        } me-2`}
                        title={
                          store.storeStatus === "active"
                            ? "Nonaktifkan"
                            : "Aktifkan"
                        }
                      >
                        <i
                          className={`fas fa-${
                            store.storeStatus === "active"
                              ? "power-off"
                              : "check-circle"
                          }`}
                        ></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="Edit"
                        onClick={() => handleShowEditModal(store)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit Toko */}
      {showEditModal && editingStore && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Toko: {editingStore.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseEditModal}
                ></button>
              </div>
              <form onSubmit={handleUpdateStore}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={editingStore.name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="owner" className="form-label">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="owner"
                      name="owner"
                      value={editingStore.owner}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={editingStore.location}
                      onChange={handleEditFormChange}
                      required
                    />
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

      {/* Modal Tambah Toko */}
      {showAddModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Toko Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddModal}
                ></button>
              </div>
              <form onSubmit={handleSaveNewStore}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="add-name" className="form-label">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="add-name"
                      name="name"
                      value={newStoreData.name}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="add-owner" className="form-label">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="add-owner"
                      name="owner"
                      value={newStoreData.owner}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="add-location" className="form-label">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="add-location"
                      name="location"
                      value={newStoreData.location}
                      onChange={handleAddFormChange}
                      required
                    />
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
                    Simpan Toko
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop untuk kedua modal */}
      {(showEditModal || showAddModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </>
  );
};

export default AdminStoresPage;
