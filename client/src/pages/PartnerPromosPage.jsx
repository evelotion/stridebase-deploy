// File: client/src/pages/PartnerPromosPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Fade, Slide } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import "./PartnerElevate.css";

// --- GLASS MODAL FOR PROMOS ---
const PromoGlassModal = ({
  show,
  handleClose,
  handleSubmit,
  promoData,
  setPromoData,
  isEditing,
}) => {
  if (!show) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromoData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="pe-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Slide direction="up" duration={300} triggerOnce>
        <div
          className="pe-card p-0 overflow-hidden"
          style={{ width: "450px", maxWidth: "95%" }}
        >
          <div className="p-4 border-bottom border-secondary">
            <h5 className="pe-title mb-0">
              {isEditing ? "Edit Promo" : "Create New Promo"}
            </h5>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              <div className="mb-3">
                <label className="pe-subtitle small mb-2 d-block">
                  Promo Code
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary text-uppercase fw-bold"
                  name="code"
                  value={promoData.code}
                  onChange={handleChange}
                  required
                  placeholder="SUMMER25"
                />
              </div>
              <div className="mb-3">
                <label className="pe-subtitle small mb-2 d-block">
                  Description
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  name="description"
                  value={promoData.description}
                  onChange={handleChange}
                  required
                  placeholder="Special discount for..."
                />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="pe-subtitle small mb-2 d-block">Type</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    name="discountType"
                    value={promoData.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rp)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="pe-subtitle small mb-2 d-block">
                    Value
                  </label>
                  <input
                    type="number"
                    className="form-control bg-dark text-white border-secondary"
                    name="value"
                    value={promoData.value}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-top border-secondary d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-light border-0"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pe-btn-action bg-primary border-0"
              >
                Save Promo
              </button>
            </div>
          </form>
        </div>
      </Slide>
    </div>
  );
};

const PartnerPromosPage = ({ showMessage }) => {
  const [promos, setPromos] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
        if (promosRes.ok && storeRes.ok) {
          setPromos(await promosRes.json());
          setStore(await storeRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = (promo = null) => {
    setIsEditing(!!promo);
    setCurrentPromo(
      promo || {
        id: null,
        code: "",
        description: "",
        discountType: "percentage",
        value: "",
        status: "active",
      }
    );
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/partner/promos/${currentPromo.id}`
      : "/api/partner/promos";

    try {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentPromo),
      });
      if (!res.ok) throw new Error("Failed to save promo");

      if (showMessage)
        showMessage(`Promo ${isEditing ? "updated" : "created"} successfully!`);
      setShowModal(false);
      // Refresh (Simplified)
      window.location.reload();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promo?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/api/partner/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (showMessage) showMessage("Promo deleted.");
      window.location.reload();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  if (loading)
    return (
      <div className="pe-dashboard-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const isPromoLimitReached =
    store && store.tier === "BASIC" && promos.length >= 3;

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-2"></div>

      <div className="container-fluid px-4 py-4 position-relative z-1">
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <Fade direction="down" triggerOnce>
              <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
                Marketing Tools
              </h6>
              <h2 className="pe-title display-6 mb-0">Active Promotions</h2>
            </Fade>
          </div>
          <button
            className="pe-btn-action bg-primary border-primary"
            onClick={() => handleOpenModal()}
            disabled={isPromoLimitReached}
          >
            <i className="fas fa-plus me-2"></i> Create Promo
          </button>
        </div>

        {isPromoLimitReached && (
          <Fade direction="down" triggerOnce>
            <div className="alert alert-warning bg-warning bg-opacity-10 border-warning text-warning mb-4 d-flex align-items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                Limit Reached (Basic Tier).{" "}
                <Link
                  to="/partner/upgrade"
                  className="text-white fw-bold text-decoration-underline"
                >
                  Upgrade to PRO
                </Link>{" "}
                for unlimited promos.
              </div>
            </div>
          </Fade>
        )}

        <div className="row g-4">
          {promos.map((promo, i) => (
            <div className="col-md-6 col-xl-4" key={promo.id}>
              <Fade delay={i * 50} triggerOnce>
                <div
                  className="pe-card position-relative overflow-hidden h-100 d-flex flex-column group-hover-glow"
                  style={{ borderLeft: "4px solid var(--pe-warning)" }}
                >
                  {/* Ticket Perforation Effect */}
                  <div
                    className="position-absolute top-50 start-0 translate-middle"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "var(--pe-bg)",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div
                    className="position-absolute top-50 end-0 translate-middle"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "var(--pe-bg)",
                      borderRadius: "50%",
                    }}
                  ></div>

                  <div className="d-flex justify-content-between align-items-center mb-3 ps-3">
                    <span
                      className={`pe-badge ${
                        promo.status === "active"
                          ? "pe-badge-success"
                          : "pe-badge-danger"
                      }`}
                    >
                      {promo.status}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleOpenModal(promo)}
                        className="btn btn-sm text-muted hover-text-white"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="btn btn-sm text-muted hover-text-danger"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-3 border-bottom border-secondary border-dashed mb-3">
                    <h3 className="pe-title text-white mb-1 tracking-widest">
                      {promo.code}
                    </h3>
                    <small className="text-white-50">{promo.description}</small>
                  </div>

                  <div className="d-flex justify-content-center align-items-center gap-2 mt-auto">
                    <span className="text-warning fw-bold fs-4">
                      {promo.discountType === "percentage"
                        ? `${promo.value}%`
                        : `Rp ${parseInt(promo.value).toLocaleString()}`}
                    </span>
                    <span className="text-white-50 small text-uppercase">
                      OFF
                    </span>
                  </div>
                </div>
              </Fade>
            </div>
          ))}
          {promos.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              No active promotions. Start by creating one!
            </div>
          )}
        </div>
      </div>

      <PromoGlassModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleFormSubmit}
        promoData={currentPromo}
        setPromoData={setCurrentPromo}
        isEditing={isEditing}
      />
    </div>
  );
};

export default PartnerPromosPage;
