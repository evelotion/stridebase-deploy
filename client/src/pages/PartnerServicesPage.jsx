// File: stridebase-app/client/src/pages/PartnerServicesPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PartnerServicesPage = () => {
  const [services, setServices] = useState([]);
  const [store, setStore] = useState(null); // State untuk menyimpan data toko
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    shoeType: "sneakers",
  });

  // Fungsi untuk mengambil data layanan dan toko
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      // Ambil data toko dan layanan secara bersamaan
      const [storeRes, servicesRes] = await Promise.all([
        fetch("/api/partner/settings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/partner/services", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const storeData = await storeRes.json();
      const servicesData = await servicesRes.json();

      if (!storeRes.ok)
        throw new Error(storeData.message || "Gagal mengambil data toko.");
      if (!servicesRes.ok)
        throw new Error(
          servicesData.message || "Gagal mengambil data layanan."
        );

      setStore(storeData);
      setServices(servicesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cek apakah limit sudah tercapai
 const isServiceLimitReached = store ? services.length >= store.serviceLimit : false;

  // Handler untuk membuka modal
  const handleOpenModal = (service = null) => {
    if (service) {
      setIsEditing(true);
      setCurrentService(service);
    } else {
      setIsEditing(false);
      setCurrentService({
        id: null,
        name: "",
        description: "",
        price: "",
        shoeType: "sneakers",
      });
    }
    setShowModal(true);
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handler untuk perubahan input form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form (tambah/edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/partner/services/${currentService.id}`
      : "/api/partner/services";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentService),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal memproses layanan.");

      showMessage(`Layanan berhasil ${isEditing ? "diperbarui" : "ditambahkan"}!`);
      handleCloseModal();
      fetchData(); // Muat ulang data
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  // Handler untuk hapus layanan
  const handleDelete = async (serviceId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/partner/services/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menghapus layanan.");

      showMessage("Layanan berhasil dihapus.");
      fetchData(); // Muat ulang data
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4">Memuat data layanan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">Manajemen Layanan</h2>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            disabled={isServiceLimitReached}
          >
            <i className="fas fa-plus me-2"></i>Tambah Layanan
          </button>
        </div>

        {isServiceLimitReached && (
          <div className="alert alert-warning mx-4">
            Anda telah mencapai batas maksimal{" "}
            <strong>{store.serviceLimit} layanan</strong> untuk tier BASIC.
            <Link to="/partner/upgrade" className="alert-link">
              {" "}
              Upgrade ke PRO
            </Link>{" "}
            untuk menambah layanan tanpa batas.
          </div>
        )}

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nama Layanan</th>
                  <th>Tipe Sepatu</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="fw-bold">{service.name}</span>
                      <small className="d-block text-muted">
                        {service.description || "Tidak ada deskripsi."}
                      </small>
                    </td>
                    <td>{service.shoeType}</td>
                    <td>
                      Rp {parseInt(service.price).toLocaleString("id-ID")}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        title="Edit"
                        onClick={() => handleOpenModal(service)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Hapus"
                        onClick={() => handleDelete(service.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Layanan" : "Tambah Layanan Baru"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Nama Layanan
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={currentService.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="2"
                      value={currentService.description}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="price" className="form-label">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={currentService.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shoeType" className="form-label">
                        Tipe Sepatu
                      </label>
                      <select
                        className="form-select"
                        id="shoeType"
                        name="shoeType"
                        value={currentService.shoeType}
                        onChange={handleFormChange}
                      >
                        <option value="sneakers">Sneakers</option>
                        <option value="kulit">Kulit</option>
                        <option value="suede">Suede</option>
                        <option value="boots">Boots</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default PartnerServicesPage;
