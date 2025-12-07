// File: client/src/pages/AdminPromosPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Fade } from "react-awesome-reveal";
import { getAllPromos, createPromo, deletePromo } from "../services/apiService";
import "../styles/ElevateDashboard.css";

const AdminPromosPage = ({ showMessage }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Mobile Sheet State
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    value: 0,
    usageLimit: 100,
  });

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPromos();
      setPromos(data);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPromo(formData);
      if (showMessage) showMessage("Promo berhasil dibuat!", "Success");
      setShowModal(false);
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        value: 0,
        usageLimit: 100,
      });
      fetchPromos();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus promo ini?")) return;
    try {
      await deletePromo(id);
      if (showMessage) showMessage("Promo dihapus.", "Success");
      setIsSheetOpen(false);
      fetchPromos();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const openSheet = (promo) => {
    setSelectedPromo(promo);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedPromo(null), 300);
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="pe-title mb-0 fs-4">Kode Promo</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
          >
            <i className="fas fa-plus me-1"></i> Baru
          </button>
        </div>
      </div>

      <div className="px-3 py-3">
        {promos.length > 0 ? (
          promos.map((promo) => (
            <div
              className="pe-card mb-3 p-0 position-relative overflow-hidden"
              key={promo.id}
              onClick={() => openSheet(promo)}
            >
              <div
                className="position-absolute top-0 bottom-0 start-0 d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: "80px",
                  background:
                    "linear-gradient(135deg, var(--pe-accent), #2563eb)",
                  borderRight: "2px dashed rgba(255,255,255,0.3)",
                }}
              >
                <div
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    letterSpacing: "2px",
                  }}
                >
                  {promo.discountType === "PERCENTAGE"
                    ? `${promo.value}%`
                    : "Rp"}
                </div>
              </div>

              <div className="p-3" style={{ marginLeft: "80px" }}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h5 className="mb-0 fw-bold font-monospace text-primary">
                    {promo.code}
                  </h5>
                  <span
                    className={`badge ${
                      promo.status === "active"
                        ? "bg-success bg-opacity-25 text-success"
                        : "bg-secondary"
                    }`}
                    style={{ fontSize: "0.6rem" }}
                  >
                    {promo.status || "Active"}
                  </span>
                </div>
                {/* FIX: Warna Deskripsi */}
                <p
                  className="small mb-2 text-truncate"
                  style={{ color: "var(--pe-text-muted)" }}
                >
                  {promo.description}
                </p>
                <div className="d-flex align-items-center gap-3">
                  {/* FIX: Warna Usage Count */}
                  <small
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--pe-text-muted)",
                    }}
                  >
                    <i className="fas fa-users me-1"></i> {promo.usageCount} /{" "}
                    {promo.usageLimit}
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="text-center py-5"
            style={{ color: "var(--pe-text-muted)" }}
          >
            Belum ada promo.
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={closeSheet}
      ></div>

      <div
        className="position-fixed bottom-0 start-0 w-100 pe-card rounded-top-4 p-4"
        style={{
          zIndex: 2010,
          transform: isSheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <div className="d-flex justify-content-center mb-4">
          <div
            style={{
              width: "40px",
              height: "4px",
              background: "var(--pe-card-border)",
              borderRadius: "2px",
            }}
          ></div>
        </div>

        {selectedPromo && (
          <>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary font-monospace mb-1">
                {selectedPromo.code}
              </h2>
              <p className="small" style={{ color: "var(--pe-text-muted)" }}>
                {selectedPromo.description}
              </p>
            </div>
            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-danger py-3 rounded-3"
                onClick={() => handleDelete(selectedPromo.id)}
              >
                <i className="fas fa-trash-alt me-2"></i> Hapus Promo
              </button>
              <button
                className="btn py-3 rounded-3 mt-2"
                style={{
                  background: "var(--pe-card-bg)",
                  color: "var(--pe-text-main)",
                  border: "1px solid var(--pe-card-border)",
                }}
                onClick={closeSheet}
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="d-none d-lg-block">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Marketing
            </h6>
            <h2 className="pe-title mb-0">Kode Promo</h2>
          </div>
        </Fade>
        <button className="pe-btn-action" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i> Buat Promo
        </button>
      </div>

      <Fade triggerOnce>
        <div className="pe-card">
          <table className="pe-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Tipe</th>
                <th>Nilai</th>
                <th>Terpakai</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold font-monospace text-primary">
                    {p.code}
                  </td>
                  <td style={{ color: "var(--pe-text-main)" }}>
                    {p.description}
                  </td>
                  <td>
                    <span className="pe-badge pe-badge-info">
                      {p.discountType}
                    </span>
                  </td>
                  <td
                    className="fw-bold"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {p.discountType === "PERCENTAGE"
                      ? `${p.value}%`
                      : `Rp ${p.value.toLocaleString()}`}
                  </td>
                  <td style={{ color: "var(--pe-text-muted)" }}>
                    {p.usageCount} / {p.usageLimit}
                  </td>
                  <td className="text-end">
                    <button
                      className="pe-btn-action text-danger p-2"
                      onClick={() => handleDelete(p.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-admin"></div>

      {renderMobileView()}
      {renderDesktopView()}

      {/* --- MODAL FORM --- */}
      {showModal && (
        <>
          <div
            className="modal fade show d-flex align-items-center"
            style={{ zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content pe-modal-glass-content border-0">
                <div className="pe-modal-glass-header">
                  <h5 className="pe-modal-title mb-0 fs-5">Buat Promo Baru</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-glass"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                  <div className="mb-4">
                    <label className="pe-form-label">Kode Promo</label>
                    <input
                      type="text"
                      className="form-control pe-input-glass"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="MISAL: DISKON50"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="pe-form-label">Deskripsi</label>
                    <input
                      type="text"
                      className="form-control pe-input-glass"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Potongan harga spesial..."
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="pe-form-label">Tipe Diskon</label>
                      <select
                        className="form-select pe-select-glass"
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountType: e.target.value,
                          })
                        }
                      >
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="pe-form-label">Nilai</label>
                      <input
                        type="number"
                        className="form-control pe-input-glass"
                        required
                        min="1"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value: parseFloat(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="pe-form-label">
                      Batas Penggunaan (Kuota)
                    </label>
                    <input
                      type="number"
                      className="form-control pe-input-glass"
                      required
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: parseInt(e.target.value),
                        })
                      }
                      placeholder="Contoh: 100"
                    />
                  </div>

                  <div className="d-flex justify-content-end mt-5">
                    <button
                      type="button"
                      className="btn btn-link text-muted text-decoration-none me-3 fw-bold"
                      onClick={() => setShowModal(false)}
                      style={{ letterSpacing: "1px" }}
                    >
                      Batal
                    </button>
                    <button type="submit" className="pe-btn-submit-glass w-50">
                      BUAT PROMO
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            style={{
              zIndex: 1050,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AdminPromosPage;
