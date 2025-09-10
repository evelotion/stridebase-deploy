import React, { useState, useEffect, useCallback } from "react";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../services/apiService";
import { uploadImage } from "../services/apiService"; // Menggunakan fungsi upload yang sudah ada

const BannerModal = ({ show, handleClose, handleSubmit, bannerData, setBannerData, isUploading, handleImageUpload }) => {
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBannerData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{bannerData.id ? "Edit Banner" : "Tambah Banner Baru"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Judul</label>
                  <input type="text" className="form-control" id="title" name="title" value={bannerData.title} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Deskripsi Singkat</label>
                  <input type="text" className="form-control" id="description" name="description" value={bannerData.description} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="linkUrl" className="form-label">URL Tautan (opsional)</label>
                  <input type="text" className="form-control" id="linkUrl" name="linkUrl" value={bannerData.linkUrl} onChange={handleChange} placeholder="Contoh: /store" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Gambar Banner</label>
                    {bannerData.imageUrl && (
                        <div className="mb-2">
                            <img src={bannerData.imageUrl} alt="Preview" className="img-thumbnail" width="200"/>
                        </div>
                    )}
                    <input type="file" className="form-control" id="image" accept="image/*" onChange={handleImageUpload} />
                    {isUploading && <div className="form-text">Mengunggah...</div>}
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="status" name="status" checked={bannerData.status === 'active'} onChange={(e) => setBannerData(prev => ({...prev, status: e.target.checked ? 'active' : 'inactive'}))} />
                  <label className="form-check-label" htmlFor="status">Aktifkan Banner</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                    {isUploading ? "Tunggu..." : "Simpan"}
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


const AdminBannersPage = ({ showMessage }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState({
    id: null,
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    status: "active",
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setCurrentBanner(banner);
    } else {
      setCurrentBanner({
        id: null, title: "", description: "", imageUrl: "", linkUrl: "", status: "active",
      });
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => setShowModal(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const result = await uploadImage(formData);
      setCurrentBanner(prev => ({ ...prev, imageUrl: result.imageUrl }));
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentBanner.id) {
        await updateBanner(currentBanner.id, currentBanner);
        if (showMessage) showMessage("Banner berhasil diperbarui!");
      } else {
        await createBanner(currentBanner);
        if (showMessage) showMessage("Banner baru berhasil ditambahkan!");
      }
      handleCloseModal();
      await fetchBanners();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      try {
        await deleteBanner(bannerId);
        // Optimistic update
        setBanners(prev => prev.filter(b => b.id !== bannerId));
        if (showMessage) showMessage("Banner berhasil dihapus.");
      } catch (err) {
        if (showMessage) showMessage(err.message, "Error");
      }
    }
  };
  
  const getStatusBadge = (status) => {
    return status === 'active' ? 'bg-success' : 'bg-secondary';
  };

  if (loading) return <div className="p-4">Memuat data banner...</div>;
  if (error && banners.length === 0) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Manajemen Banner</h2>
        <button className="btn btn-dark" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-2"></i>Tambah Banner
        </button>
      </div>

      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Gambar</th>
                <th>Judul</th>
                <th>Tautan</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                banners.map(banner => (
                  <tr key={banner.id}>
                    <td><img src={banner.imageUrl} alt={banner.title} style={{ width: "120px", height:"60px", objectFit: "cover" }} className="rounded"/></td>
                    <td><span className="fw-bold">{banner.title}</span></td>
                    <td>{banner.linkUrl || "-"}</td>
                    <td><span className={`badge ${getStatusBadge(banner.status)}`}>{banner.status}</span></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handleOpenModal(banner)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(banner.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">Belum ada banner yang ditambahkan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BannerModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleSubmit}
        bannerData={currentBanner}
        setBannerData={setCurrentBanner}
        isUploading={isUploading}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default AdminBannersPage;