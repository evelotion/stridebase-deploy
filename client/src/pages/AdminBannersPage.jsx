// File: client/src/pages/AdminBannersPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

const AdminBannersPage = ({ showMessage }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    description: "",
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBanner(formData);
      if (showMessage) showMessage("Banner berhasil ditambahkan!", "Success");
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus banner ini?")) return;
    try {
      await deleteBanner(id);
      if (showMessage) showMessage("Banner dihapus.", "Success");
      setIsSheetOpen(false);
      fetchBanners();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  // Mobile Handlers
  const openSheet = (banner) => {
    setSelectedBanner(banner);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedBanner(null), 300);
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

  /* =========================================
     RENDER: MOBILE VIEW
     ========================================= */
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
          <h2 className="pe-title mb-0 fs-4">Banner Iklan</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
          >
            <i className="fas fa-plus me-1"></i> Baru
          </button>
        </div>
      </div>

      <div className="px-3 py-3">
        {banners.length > 0 ? (
          banners.map((banner) => (
            <div
              className="pe-card mb-3 p-0 position-relative overflow-hidden"
              key={banner.id}
              onClick={() => openSheet(banner)}
              style={{ borderRadius: "16px" }}
            >
              {/* Banner Image Preview */}
              <div
                style={{ height: "140px", width: "100%", position: "relative" }}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="position-absolute top-0 end-0 p-2">
                  <span
                    className={`badge ${
                      banner.status === "active" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {banner.status || "Active"}
                  </span>
                </div>
                <div
                  className="position-absolute bottom-0 start-0 w-100 p-3"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                  }}
                >
                  <h6 className="mb-0 text-white fw-bold">{banner.title}</h6>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="text-center py-5"
            style={{ color: "var(--pe-text-muted)" }}
          >
            Belum ada banner.
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
        {selectedBanner && (
          <>
            <h5
              className="fw-bold mb-2"
              style={{ color: "var(--pe-text-main)" }}
            >
              {selectedBanner.title}
            </h5>
            {/* FIX: Warna Deskripsi */}
            <p className="small mb-4" style={{ color: "var(--pe-text-muted)" }}>
              {selectedBanner.description || "Tidak ada deskripsi"}
            </p>
            <button
              className="btn btn-outline-danger w-100 py-3 rounded-3"
              onClick={() => handleDelete(selectedBanner.id)}
            >
              Hapus Banner
            </button>
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
            <h2 className="pe-title mb-0">Banner & Iklan</h2>
          </div>
        </Fade>
        <button className="pe-btn-action" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i> Tambah Banner
        </button>
      </div>
      <Fade triggerOnce>
        <div className="row g-4">
          {banners.map((b) => (
            <div className="col-md-6 col-lg-4" key={b.id}>
              <div className="pe-card p-0 overflow-hidden h-100">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
                <div className="p-3">
                  <h5
                    className="mb-1 fw-bold"
                    style={{ color: "var(--pe-text-main)" }}
                  >
                    {b.title}
                  </h5>
                  {/* FIX: Warna Deskripsi Desktop */}
                  <p
                    className="small mb-3"
                    style={{ color: "var(--pe-text-muted)" }}
                  >
                    {b.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="pe-badge pe-badge-success">Active</span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(b.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-admin"></div>
      {renderMobileView()}
      {renderDesktopView()}

      {/* Modal Form */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backdropFilter: "blur(5px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            {/* FIX: Modal Theme */}
            <div
              className="modal-content pe-card border-0 shadow-lg p-4"
              style={{
                backgroundColor: "var(--pe-card-bg)",
                color: "var(--pe-text-main)",
              }}
            >
              <h5 className="mb-3">Tambah Banner</h5>
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-2"
                  placeholder="Judul Banner"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <input
                  className="form-control mb-2"
                  placeholder="URL Gambar"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  required
                />
                <input
                  className="form-control mb-2"
                  placeholder="Deskripsi Singkat"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    style={{ color: "var(--pe-text-muted)" }}
                    onClick={() => setShowModal(false)}
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
    </div>
  );
};

export default AdminBannersPage;
