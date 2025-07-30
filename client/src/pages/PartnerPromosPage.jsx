import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from '../apiConfig';

const PartnerPromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromo, setCurrentPromo] = useState({
    id: null,
    code: "",
    description: "",
    discountType: "percentage",
    value: "",
    status: "active",
  });

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [promosRes, storeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/partner/promos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/partner/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!promosRes.ok || !storeRes.ok) {
        throw new Error("Gagal memuat data promo atau toko.");
      }

      const promosData = await promosRes.json();
      const storeData = await storeRes.json();

      setPromos(promosData);
      setStore(storeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isPromoLimitReached =
    store && store.tier === "BASIC" && promos.length >= 3;

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setIsEditing(true);
      setCurrentPromo(promo);
    } else {
      setIsEditing(false);
      setCurrentPromo({
        id: null,
        code: "",
        description: "",
        discountType: "percentage",
        value: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentPromo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/partner/promos/${currentPromo.id}`
      : "/api/partner/promos";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentPromo),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      showMessage(`Promo berhasil ${isEditing ? "diperbarui" : "dibuat"}!`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (promoId) => {
    if (!confirm("Yakin ingin menghapus promo ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/partner/promos/${promoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      showMessage("Promo berhasil dihapus.");
      fetchData();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4">Memuat data promo...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">Manajemen Promo Toko</h2>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            disabled={isPromoLimitReached}
          >
            <i className="fas fa-plus me-2"></i>Buat Promo Baru
          </button>
        </div>

        {isPromoLimitReached && (
          <div className="alert alert-warning mx-4">
            Anda telah mencapai batas maksimal 3 promo untuk tier BASIC.
            <Link to="/partner/upgrade" className="alert-link">
              {" "}
              Upgrade ke PRO{" "}
            </Link>
            untuk membuat promo tanpa batas.
          </div>
        )}

        <div className="table-card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Kode Promo</th>
                  <th>Deskripsi</th>
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
                    <td>
                      {promo.discountType === "percentage"
                        ? `${promo.value}%`
                        : `Rp ${promo.value.toLocaleString("id-ID")}`}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          promo.status === "active" ? "success" : "secondary"
                        }`}
                      >
                        {promo.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleOpenModal(promo)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {promos.length === 0 && (
              <p className="text-center text-muted p-4">
                Anda belum memiliki promo.
              </p>
            )}
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
              <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditing ? "Edit Promo" : "Buat Promo Baru"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
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
                      value={currentPromo.code}
                      onChange={handleFormChange}
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
                      value={currentPromo.description}
                      onChange={handleFormChange}
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
                        value={currentPromo.discountType}
                        onChange={handleFormChange}
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
                        value={currentPromo.value}
                        onChange={handleFormChange}
                        required
                      />
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

export default PartnerPromosPage;
