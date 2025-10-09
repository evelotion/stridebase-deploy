// File: client/src/pages/PartnerSettingsPage.jsx (Perbaikan Final)

import React, { useState, useEffect, useCallback } from "react";
import {
  getPartnerSettings,
  updatePartnerSettings,
  uploadPartnerPhoto,
} from "../services/apiService";

const PartnerSettingsPage = ({ showMessage }) => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerSettings();
      // Pastikan 'images' adalah array untuk mencegah error
      if (data && !Array.isArray(data.images)) {
        data.images = [];
      }
      setStore(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    setIsUploading(true);
    try {
      const result = await uploadPartnerPhoto(formData);
      const newImageUrl = result.filePath;

      if (newImageUrl) {
        setStore((prev) => ({
          ...prev,
          // Logika aman untuk menambahkan gambar baru
          images: [...(prev.images || []), newImageUrl],
        }));
        if (showMessage) showMessage("Foto berhasil diunggah!");
      } else {
        throw new Error("URL gambar tidak diterima dari server.");
      }
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imgUrl) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      setStore((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imgUrl),
      }));
    }
  };

  const handleSetHeaderImage = (imgUrl) => {
    setStore((prev) => ({ ...prev, headerImage: imgUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Pastikan 'store' tidak null sebelum mengirim
      if (!store) throw new Error("Data toko tidak tersedia.");

      const { name, description, images, headerImage, location, phone } = store;
      await updatePartnerSettings({
        name,
        description,
        images,
        headerImage, // Kirim 'headerImage', backend akan menanganinya
        location,
        phone,
      });
      if (showMessage) showMessage("Pengaturan toko berhasil disimpan!");
    } catch (err) {
      // Perbaikan Syntax Error: Tambahkan kurung kurawal {}
      if (showMessage) {
        showMessage(err.message, "Error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-4">Memuat pengaturan toko...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;
  if (!store) return <div className="p-4">Data toko tidak ditemukan.</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Pengaturan Toko</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card card-account p-4">
              <h5 className="mb-4 fw-bold">Informasi Dasar</h5>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nama Toko
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={store.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Deskripsi Toko
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="5"
                  value={store.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Alamat / Lokasi
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={store.location}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Nomor Telepon (WhatsApp)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={store.phone || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card card-account p-4">
              <h5 className="mb-4 fw-bold">Galeri Foto</h5>
              <div className="row g-2 mb-3">
                {store.images.map((img) => (
                  <div className="col-6 col-md-4 col-lg-6" key={img}>
                    <div className="gallery-thumbnail position-relative">
                      <img
                        src={img}
                        alt={`Galeri`}
                        className="img-fluid rounded"
                      />
                      <div className="gallery-thumbnail-overlay">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          title="Jadikan Header"
                          onClick={() => handleSetHeaderImage(img)}
                        >
                          <i
                            className={`fas fa-star ${
                              store.headerImage === img ? "text-warning" : ""
                            }`}
                          ></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          title="Hapus"
                          onClick={() => handleRemoveImage(img)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-6 col-md-4 col-lg-6">
                  <label htmlFor="imageUpload" className="upload-box">
                    {isUploading ? (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-plus fa-2x"></i>
                        <span>Tambah Foto</span>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
              {store.headerImage && (
                <div>
                  <label className="form-label">Foto Header Saat Ini:</label>
                  <img
                    src={store.headerImage}
                    alt="Header"
                    className="img-fluid rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 text-end">
          <button
            type="submit"
            className="btn btn-dark btn-lg"
            disabled={isSaving || isUploading}
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartnerSettingsPage;
