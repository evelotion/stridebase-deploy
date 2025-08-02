import React, { useState, useEffect } from "react";
import API_BASE_URL from '../apiConfig';

const AdminBannersPage = ({ showMessage }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal tambah banner
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBannerData, setNewBannerData] = useState({
    imageFile: null, // <-- State untuk menampung file
    linkUrl: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data banner.");
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi-fungsi untuk modal tambah
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewBannerData({ imageFile: null, linkUrl: "" });
  };

  const handleAddFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setNewBannerData((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setNewBannerData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveNewBanner = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newBannerData.imageFile || !newBannerData.linkUrl) {
      showMessage("File gambar dan Link Tujuan wajib diisi.");
      return;
    }

    // 1. Upload gambar terlebih dahulu
    const formData = new FormData();
    formData.append("image", newBannerData.imageFile);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadData.message || "Gagal mengunggah gambar.");

      // 2. Jika upload berhasil, simpan data banner ke database
      const bannerPayload = {
        imageUrl: uploadData.imageUrl,
        linkUrl: newBannerData.linkUrl,
      };

      const saveRes = await fetch(`${API_BASE_URL}/api/admin/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bannerPayload),
      });

      const createdBanner = await saveRes.json();
      if (!saveRes.ok)
        throw new Error(createdBanner.message || "Gagal menambah banner.");

      handleCloseAddModal();
      fetchBanners(); // Refresh tabel
      showMessage("Banner baru berhasil ditambahkan.");
    } catch (error) {
      showMessage(error.message);
    }
  };

  // Fungsi untuk hapus banner
  const handleDeleteBanner = async (bannerId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menghapus banner.");

      fetchBanners(); // Refresh tabel
      showMessage(data.message);
    } catch (error) {
      showMessage(error.message);
    }
  };

  if (loading) return <div className="p-4">Memuat data banner...</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center m-4">
          <h2 className="fs-2 mb-0">Manajemen Banner</h2>
          <button className="btn btn-primary" onClick={handleShowAddModal}>
            <i className="fas fa-plus me-2"></i>Tambah Banner Baru
          </button>
        </div>

        <div className="row g-4 px-4">
          {banners.map((banner) => (
            <div className="col-md-6" key={banner.id}>
              <div className="card shadow-sm">
                {/* Tambahkan base URL server jika perlu */}
                <img
                  src={`${banner.imageUrl}`}
                  className="card-img-top"
                  alt="Banner"
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <p className="card-text small text-muted">
                    Link Tujuan: {banner.linkUrl}
                  </p>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <i className="fas fa-trash-alt me-2"></i>Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && !loading && (
            <div className="col-12">
              <p className="text-center text-muted">
                Belum ada banner yang ditambahkan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Banner */}
      {showAddModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Banner Baru</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddModal}
                ></button>
              </div>
              <form onSubmit={handleSaveNewBanner}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="imageFile" className="form-label">
                      File Gambar
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="imageFile"
                      name="imageFile"
                      onChange={handleAddFormChange}
                      accept="image/*"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="linkUrl" className="form-label">
                      Link Tujuan
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="linkUrl"
                      name="linkUrl"
                      value={newBannerData.linkUrl}
                      onChange={handleAddFormChange}
                      placeholder="/promo"
                      required
                    />
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
                    Simpan Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showAddModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default AdminBannersPage;
