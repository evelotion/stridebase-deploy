// File: client/src/pages/PartnerServicesPage.jsx (Perbaikan Final Lengkap)

import React, { useState, useEffect, useCallback } from "react";
import {
  getPartnerServices,
  createPartnerService,
  updatePartnerService,
  deletePartnerService,
} from "../services/apiService";

const ServiceModal = ({
  show,
  handleClose,
  handleSubmit,
  serviceData,
  setServiceData,
}) => {
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {serviceData.id ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
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
                    value={serviceData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Deskripsi
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={serviceData.description}
                    onChange={handleChange}
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
                      value={serviceData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="shoeType" className="form-label">
                      Jenis Sepatu
                    </label>
                    <select
                      className="form-select"
                      id="shoeType"
                      name="shoeType"
                      value={serviceData.shoeType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih Jenis</option>
                      <option value="sneakers">Sneakers</option>
                      <option value="kulit">Kulit</option>
                      <option value="suede">Suede</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
                {/* --- INPUT BARU UNTUK DURASI --- */}
                <div className="mb-3">
                  <label htmlFor="duration" className="form-label">
                    Estimasi Durasi (menit)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="duration"
                    name="duration"
                    value={serviceData.duration}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 60"
                  />
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
                <button type="submit" className="btn btn-primary">
                  Simpan
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

const PartnerServicesPage = ({ showMessage }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    shoeType: "",
    duration: "", // Tambahkan initial state
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerServices();
      setServices(data);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenModal = (service = null) => {
    setCurrentService(
      service || {
        id: null,
        name: "",
        description: "",
        price: "",
        shoeType: "",
        duration: "",
      }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentService.id) {
        await updatePartnerService(currentService.id, currentService);
        if (showMessage) showMessage("Layanan berhasil diperbarui!");
      } else {
        await createPartnerService(currentService);
        if (showMessage) showMessage("Layanan baru berhasil ditambahkan!");
      }
      handleCloseModal();
      await fetchServices();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      try {
        await deletePartnerService(serviceId);
        if (showMessage) showMessage("Layanan berhasil dihapus.");
        await fetchServices();
      } catch (err) {
        if (showMessage) showMessage(err.message, "Error");
      }
    }
  };

  if (loading) return <div className="p-4">Memuat layanan...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Kelola Layanan Anda</h2>
        <button className="btn btn-dark" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-2"></i>Tambah Layanan
        </button>
      </div>
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Layanan</th>
                <th>Jenis Sepatu</th>
                <th>Harga</th>
                <th>Durasi</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="fw-bold">{service.name}</span>
                      <p
                        className="text-muted small mb-0 text-truncate"
                        style={{ maxWidth: "300px" }}
                      >
                        {service.description}
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {service.shoeType}
                      </span>
                    </td>
                    <td>Rp {Number(service.price).toLocaleString("id-ID")}</td>
                    <td>{service.duration} menit</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-dark me-2"
                        onClick={() => handleOpenModal(service)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(service.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">
                      Anda belum menambahkan layanan.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ServiceModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleSubmit}
        serviceData={currentService}
        setServiceData={setCurrentService}
      />
    </div>
  );
};

export default PartnerServicesPage;
