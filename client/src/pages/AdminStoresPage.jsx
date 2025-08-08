import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const AdminStoresPage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [themeConfig, setThemeConfig] = useState({ featureFlags: {} });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: "",
    location: "",
    ownerId: "",
    latitude: "",
    longitude: "",
    commissionRate: "10",
    billingType: "COMMISSION",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const [storesRes, usersRes, configRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/stores`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/public/theme-config`),
        ]);

        if (!storesRes.ok || !usersRes.ok || !configRes.ok) {
          throw new Error("Gagal mengambil data inisial.");
        }

        const storesData = await storesRes.json();
        const usersData = await usersRes.json();
        const configData = await configRes.json();

        setStores(storesData);
        setUsers(
          usersData.filter((u) => u.role === "mitra" || u.role === "customer")
        );
        setThemeConfig(configData);
      } catch (error) {
        showMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchStores = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data toko.");
      const data = await response.json();
      setStores(data);
    } catch (error) {
      showMessage(error.message);
    }
  };

  const handleApproval = async (storeId, action) => {
    const storeName = stores.find((s) => s.id === storeId)?.name || "Toko";
    const newStatus = action === "approve" ? "active" : "inactive";
    const actionText = action === "approve" ? "menyetujui" : "menolak";

    if (
      !confirm(
        `Apakah Anda yakin ingin ${actionText} pendaftaran untuk ${storeName}?`
      )
    )
      return;

    await handleStatusChange(
      storeId,
      newStatus,
      `Pendaftaran ${storeName} berhasil di${actionText}.`
    );
  };

  const handleStatusChange = async (storeId, newStatus, successMessage) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stores/${storeId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newStatus }),
        }
      );
      if (!response.ok) throw new Error("Gagal mengubah status toko.");
      fetchStores();
      showMessage(
        successMessage || `Status toko berhasil diubah menjadi "${newStatus}".`
      );
    } catch (error) {
      showMessage(error.message);
    }
  };

  const handleTierChange = async (storeId, newTier) => {
    const storeName = stores.find((s) => s.id === storeId)?.name;
    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah keanggotaan ${storeName} menjadi "${newTier}"?`
      )
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stores/${storeId}/tier`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newTier }),
        }
      );

      if (!response.ok) throw new Error("Gagal mengubah tingkatan toko.");
      fetchStores();
      showMessage(
        `Keanggotaan ${storeName} berhasil diubah menjadi ${newTier}.`
      );
    } catch (error) {
      showMessage(error.message);
    }
  };

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
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stores/${editingStore.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingStore),
        }
      );
      if (!response.ok) throw new Error("Gagal memperbarui data toko.");
      handleCloseEditModal();
      fetchStores();
      showMessage(`Data untuk ${editingStore.name} berhasil diperbarui.`);
    } catch (error) {
      showMessage(error.message);
    }
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewStoreData({
      name: "",
      location: "",
      ownerId: "",
      latitude: "",
      longitude: "",
      commissionRate: "10",
      billingType: "COMMISSION",
    });
  };
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewStore = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stores`, {
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
      fetchStores();
      showMessage(`Toko "${createdStore.name}" berhasil ditambahkan.`);
    } catch (error) {
      showMessage(error.message);
    }
  };

  const filteredStores = stores.filter((s) => s.storeStatus === filter);

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

        <ul className="nav nav-pills mb-3 px-4">
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === "inactive" ? "active" : ""}`}
              onClick={() => setFilter("inactive")}
            >
              Inactive
            </button>
          </li>
        </ul>

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive d-none d-lg-block">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nama Toko</th>
                  <th>Pemilik</th>
                  <th>Lokasi</th>
                  <th>Tipe Penagihan</th>
                  <th>Status Tagihan</th>
                  <th>Status Toko</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <span className="fw-bold">{store.name}</span>
                      {themeConfig.featureFlags.enableTierSystem && (
                        <span
                          className={`badge ms-2 ${
                            store.tier === "PRO"
                              ? "bg-warning text-dark"
                              : "bg-light text-dark"
                          }`}
                        >
                          {store.tier}
                        </span>
                      )}
                    </td>
                    <td>{store.owner || "N/A"}</td>
                    <td>{store.location}</td>
                    <td>
                      <span
                        className={`badge ${
                          store.billingType === "INVOICE"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {store.billingType}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        Belum Ditagih
                      </span>
                    </td>
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
                      <div className="btn-group">
                        {store.storeStatus === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproval(store.id, "approve")
                              }
                              className="btn btn-sm btn-outline-success"
                              title="Setujui"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleApproval(store.id, "reject")}
                              className="btn btn-sm btn-outline-danger"
                              title="Tolak"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        {store.storeStatus === "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                store.id,
                                "inactive",
                                `Toko ${store.name} berhasil dinonaktifkan.`
                              )
                            }
                            className="btn btn-sm btn-outline-warning"
                            title="Nonaktifkan"
                          >
                            <i className="fas fa-power-off"></i>
                          </button>
                        )}
                        {store.storeStatus === "inactive" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                store.id,
                                "active",
                                `Toko ${store.name} berhasil diaktifkan.`
                              )
                            }
                            className="btn btn-sm btn-outline-success"
                            title="Aktifkan"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}
                        {store.billingType === "INVOICE" && (
                          <Link
                            to={`/admin/stores/${store.id}/invoices`}
                            className="btn btn-sm btn-outline-primary"
                            title="Lihat & Kelola Invoice"
                          >
                            <i className="fas fa-file-invoice-dollar"></i>
                          </Link>
                        )}

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Edit"
                          onClick={() => handleShowEditModal(store)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>

                        {themeConfig.featureFlags.enableTierSystem && (
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              title="Ubah Tier"
                            >
                              <i className="fas fa-crown"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleTierChange(store.id, "PRO")
                                  }
                                >
                                  Jadikan PRO
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleTierChange(store.id, "BASIC")
                                  }
                                >
                                  Jadikan BASIC
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStores.length === 0 && !loading && (
              <div className="text-center p-4 text-muted">
                Tidak ada toko dengan status "{filter}".
              </div>
            )}
          </div>

          <div className="mobile-card-list d-lg-none">
            {filteredStores.map((store) => (
              <div className="mobile-card" key={store.id}>
                <div className="mobile-card-header">
                  <span className="fw-bold">{store.name}</span>
                  <span
                    className={`badge bg-${
                      store.storeStatus === "active"
                        ? "success"
                        : store.storeStatus === "inactive"
                        ? "secondary"
                        : "warning text-dark"
                    }`}
                  >
                    {store.storeStatus}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <small>Pemilik</small>
                    <span>{store.owner || "N/A"}</span>
                  </div>
                  <div className="mobile-card-row">
                    <small>Lokasi</small>
                    <span className="text-end">{store.location}</span>
                  </div>
                  <div className="mobile-card-row">
                    <small>Tipe Penagihan</small>
                    <span
                      className={`badge ${
                        store.billingType === "INVOICE"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                    >
                      {store.billingType}
                    </span>
                  </div>
                </div>
                <div className="mobile-card-footer">
                  <div className="btn-group">
                    {store.storeStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleApproval(store.id, "approve")}
                          className="btn btn-sm btn-outline-success"
                          title="Setujui"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => handleApproval(store.id, "reject")}
                          className="btn btn-sm btn-outline-danger"
                          title="Tolak"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      title="Edit"
                      onClick={() => handleShowEditModal(store)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {store.billingType === "INVOICE" && (
                      <Link
                        to={`/admin/stores/${store.id}/invoices`}
                        className="btn btn-sm btn-outline-primary"
                        title="Invoices"
                      >
                        <i className="fas fa-file-invoice-dollar"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                  <div className="mb-3">
                    <label htmlFor="commissionRate" className="form-label">
                      Tingkat Komisi (%)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="commissionRate"
                      name="commissionRate"
                      value={editingStore.commissionRate || 10}
                      onChange={handleEditFormChange}
                      step="0.1"
                      min="0"
                      max="100"
                      required
                    />
                    <div className="form-text">
                      Masukkan nilai persentase, contoh: 12.5
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

      {showAddModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
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
                    <label htmlFor="add-ownerId" className="form-label">
                      Pemilik Toko
                    </label>
                    <select
                      id="add-ownerId"
                      name="ownerId"
                      className="form-select"
                      value={newStoreData.ownerId}
                      onChange={handleAddFormChange}
                      required
                    >
                      <option value="" disabled>
                        Pilih Pengguna...
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="add-billingType" className="form-label">
                      Tipe Penagihan
                    </label>
                    <select
                      id="add-billingType"
                      name="billingType"
                      className="form-select"
                      value={newStoreData.billingType}
                      onChange={handleAddFormChange}
                      required
                    >
                      <option value="COMMISSION">Bagi Hasil (Komisi)</option>
                      <option value="INVOICE">
                        Langganan (Invoice Bulanan)
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="add-location" className="form-label">
                      Alamat/Lokasi
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

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="add-latitude" className="form-label">
                        Latitude (Opsional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        id="add-latitude"
                        name="latitude"
                        value={newStoreData.latitude}
                        onChange={handleAddFormChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="add-longitude" className="form-label">
                        Longitude (Opsional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        id="add-longitude"
                        name="longitude"
                        value={newStoreData.longitude}
                        onChange={handleAddFormChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="add-commissionRate" className="form-label">
                      Tingkat Komisi Awal (%)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="add-commissionRate"
                      name="commissionRate"
                      value={newStoreData.commissionRate}
                      onChange={handleAddFormChange}
                      step="0.1"
                      min="0"
                      max="100"
                      required
                    />
                    <div className="form-text">
                      Hanya berlaku jika Tipe Penagihan adalah "Komisi".
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
                    Simpan Toko
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(showEditModal || showAddModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </>
  );
};

export default AdminStoresPage;
