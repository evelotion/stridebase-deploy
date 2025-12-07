// File: client/src/pages/PartnerServicesPage.jsx

import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getPartnerServices,
  createService,
  updateService,
  deleteService,
} from "../services/apiService";
import "../pages/PartnerElevate.css";

const PartnerServicesPage = ({ showMessage }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    duration: 60,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getPartnerServices();
      setServices(data);
    } catch (err) {
      if (showMessage) showMessage("Gagal memuat layanan", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
      duration: service.duration,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (showMessage) showMessage("Layanan dihapus", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        if (showMessage) showMessage("Layanan diperbarui", "Success");
      } else {
        await createService(formData);
        if (showMessage) showMessage("Layanan ditambahkan", "Success");
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: "", price: 0, description: "", duration: 60 });
      fetchServices();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (PRODUCT LIST)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* Sticky Header */}
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="pe-title mb-0 fs-4">Layanan</h2>
          <div className="pe-badge pe-badge-info">{services.length} Item</div>
        </div>
      </div>

      {/* Service List */}
      <div className="px-3 py-3">
        {services.map((service) => (
          <div
            className="pe-card mb-3 p-3 position-relative"
            key={service.id}
            onClick={() => handleEdit(service)}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="fw-bold text-white mb-0 fs-6">{service.name}</h6>
              <span className="fw-bold text-success">
                {formatCurrency(service.price)}
              </span>
            </div>
            <p className="text-muted small text-truncate mb-2">
              {service.description || "Tidak ada deskripsi"}
            </p>
            <div className="d-flex align-items-center gap-3 border-top border-secondary border-opacity-10 pt-2 mt-2">
              <small className="text-white-50">
                <i className="fas fa-clock me-1"></i> {service.duration} Menit
              </small>
              <div className="ms-auto d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary rounded-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(service);
                  }}
                >
                  <i className="fas fa-pen small"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger rounded-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(service.id);
                  }}
                >
                  <i className="fas fa-trash small"></i>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {services.length === 0 && (
          <div className="text-center py-5 text-muted">Belum ada layanan.</div>
        )}
      </div>

      {/* Floating Action Button (Add) */}
      <div
        className="position-fixed"
        style={{ bottom: "100px", right: "20px", zIndex: 1030 }}
      >
        <button
          className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{ width: 56, height: 56, fontSize: "1.5rem" }}
          onClick={() => {
            setEditingService(null);
            setFormData({ name: "", price: 0, description: "", duration: 60 });
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (GRID)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block container-fluid px-4 py-4">
      <Fade direction="down" triggerOnce>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Katalog
            </h6>
            <h2 className="pe-title mb-0">Daftar Layanan</h2>
          </div>
          <button
            className="pe-btn-action"
            onClick={() => {
              setEditingService(null);
              setFormData({
                name: "",
                price: 0,
                description: "",
                duration: 60,
              });
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus me-2"></i> Tambah Layanan
          </button>
        </div>
      </Fade>

      <Fade triggerOnce>
        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-6 col-lg-4" key={service.id}>
              <div className="pe-card h-100 p-4 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="pe-icon-blue rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <i className="fas fa-tag fs-5"></i>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-link text-muted p-0"
                      data-bs-toggle="dropdown"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                      <li>
                        <button
                          className="dropdown-item text-white"
                          onClick={() => handleEdit(service)}
                        >
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleDelete(service.id)}
                        >
                          Hapus
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{service.name}</h5>
                <h4 className="text-success mb-3">
                  {formatCurrency(service.price)}
                </h4>
                <p className="text-muted small mb-3">{service.description}</p>
                <div className="d-flex align-items-center gap-2 text-white-50 small">
                  <i className="fas fa-clock"></i> Estimasi {service.duration}{" "}
                  Menit
                </div>
              </div>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-2"></div>
      {renderMobileView()}
      {renderDesktopView()}

      {/* Modal Form */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            style={{ backdropFilter: "blur(5px)", zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content pe-card p-0 border-0 shadow-lg">
                <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-50">
                  <h5 className="pe-title mb-0 fs-5">
                    {editingService ? "Edit Layanan" : "Tambah Layanan"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="mb-3">
                    <label className="text-muted small fw-bold mb-1">
                      Nama Layanan
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Contoh: Deep Clean"
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="text-muted small fw-bold mb-1">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-muted small fw-bold mb-1">
                        Durasi (Menit)
                      </label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted small fw-bold mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Penjelasan singkat layanan..."
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="pe-btn-action"
                      onClick={() => setShowModal(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="pe-btn-action bg-primary border-primary text-white"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
          ></div>
        </>
      )}
    </div>
  );
};

export default PartnerServicesPage;
