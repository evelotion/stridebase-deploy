import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const PartnerServicesPage = ({ showMessage }) => {
  const [services, setServices] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    shoeType: "sneakers",
  });

  // --- STATE BARU UNTUK PENCARIAN & PAGINASI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const SERVICES_PER_PAGE = 5;

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const [storeRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/partner/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/partner/services`, {
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

  // --- LOGIKA BARU UNTUK MEMFILTER DAN MEMBAGI DATA ---
  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        (service.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.shoeType || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const pageCount = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const currentServicesOnPage = filteredServices.slice(
    (currentPage - 1) * SERVICES_PER_PAGE,
    currentPage * SERVICES_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const isServiceLimitReached = store
    ? services.length >= store.serviceLimit
    : false;

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

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_BASE_URL}/api/partner/services/${currentService.id}`
      : `${API_BASE_URL}/api/partner/services`;

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

      showMessage(
        `Layanan berhasil ${isEditing ? "diperbarui" : "ditambahkan"}!`
      );
      handleCloseModal();
      fetchData();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/partner/services/${serviceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menghapus layanan.");

      showMessage("Layanan berhasil dihapus.");
      fetchData();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  // Komponen untuk Paginasi
  const Pagination = ({ currentPage, pageCount, onPageChange }) => {
    if (pageCount <= 1) return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <nav className="mt-4 d-flex justify-content-center">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
            >
              &laquo;
            </button>
          </li>
          {pages.map((num) => (
            <li
              key={num}
              className={`page-item ${currentPage === num ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(num)}>
                {num}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === pageCount ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
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
          {/* Tampilan Desktop */}
          <div className="table-responsive d-none d-lg-block">
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

          {/* Tampilan Mobile */}
          <div className="d-lg-none">
            <div className="mb-3 px-2">
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama layanan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="mobile-card-list">
              {currentServicesOnPage.length > 0 ? (
                currentServicesOnPage.map((service) => (
                  <div className="mobile-card" key={service.id}>
                    <div className="mobile-card-header">
                      <span className="fw-bold">{service.name}</span>
                      <span className="badge bg-info">{service.shoeType}</span>
                    </div>
                    <div className="mobile-card-body">
                      <p className="mb-2 text-muted">
                        {service.description || "Tidak ada deskripsi."}
                      </p>
                      <div className="mobile-card-row">
                        <small>Harga</small>
                        <span className="fw-bold">
                          Rp {parseInt(service.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="mobile-card-footer">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleOpenModal(service)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(service.id)}
                      >
                        <i className="fas fa-trash-alt me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted">
                  Tidak ada layanan yang cocok dengan pencarian Anda.
                </div>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={handlePageChange}
            />
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
