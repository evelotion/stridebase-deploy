// File: client/src/pages/AdminStoreSettingsPage.jsx (Elevate Redesign)

import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import {
  getStoreSettingsForAdmin,
  updateStoreSettingsByAdmin,
  uploadAdminPhoto,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const dayLabels = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const AdminStoreSettingsPage = ({ showMessage }) => {
  const { storeId } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [store, setStore] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchStoreData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStoreSettingsForAdmin(storeId);
      setStore(data);
      const initialSchedule = {};
      daysOfWeek.forEach((day) => {
        const existingDay =
          data.schedules.find((s) => s.dayOfWeek === day) || {};
        initialSchedule[day] = {
          dayOfWeek: day,
          isClosed: existingDay.isClosed || false,
          opens: existingDay.openTime || "09:00",
          closes: existingDay.closeTime || "21:00",
        };
      });
      setSchedule(initialSchedule);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [storeId, showMessage]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetHeaderImage = (imageUrl) => {
    handleSaveChanges({ ...store, headerImageUrl: imageUrl });
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveChanges = async (
    dataToSave = store,
    newSchedule = schedule
  ) => {
    setIsSaving(true);
    try {
      const payload = {
        name: dataToSave.name,
        description: dataToSave.description,
        images: dataToSave.images,
        headerImageUrl: dataToSave.headerImageUrl,
        schedule: newSchedule,
        tier: dataToSave.tier,
        commissionRate: dataToSave.commissionRate,
        subscriptionFee: dataToSave.subscriptionFee,
      };

      const response = await updateStoreSettingsByAdmin(storeId, payload);
      setStore(dataToSave);
      setSchedule(newSchedule);
      if (showMessage) showMessage(response.message, "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    setIsUploading(true);
    try {
      const result = await uploadAdminPhoto(formData);
      const updatedStoreWithNewImage = {
        ...store,
        images: [...(store.images || []), result.filePath],
      };
      await handleSaveChanges(updatedStoreWithNewImage);
      if (showMessage) showMessage("Foto berhasil diunggah!", "Success");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageToDelete) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;

    const newImages = store.images.filter((img) => img !== imageToDelete);
    const newHeader =
      store.headerImageUrl === imageToDelete
        ? newImages.length > 0
          ? newImages[0]
          : ""
        : store.headerImageUrl;

    const updatedStoreWithoutImage = {
      ...store,
      images: newImages,
      headerImageUrl: newHeader,
    };

    await handleSaveChanges(updatedStoreWithoutImage);
    if (showMessage) showMessage("Foto berhasil dihapus.", "Success");
  };

  if (loading || !store)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  const isPhotoLimitReached =
    (store.images || []).length >= (store.photoLimit || 5);

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      {/* Decorative Blob */}
      <div className="pe-blob pe-blob-1"></div>

      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 position-relative z-2">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              <Link
                to="/admin/stores"
                className="text-decoration-none text-muted hover-white"
              >
                <i className="fas fa-arrow-left me-2"></i>Kembali
              </Link>
            </h6>
            <h2 className="pe-title mb-0">Pengaturan Toko</h2>
          </div>
        </Fade>

        <Fade direction="down" delay={100} triggerOnce>
          <div className="d-flex gap-3 align-items-center mt-3 mt-md-0">
            <div className="text-end d-none d-md-block">
              <span className="d-block text-white fw-bold">{store.name}</span>
              <span className="pe-badge pe-badge-info x-small">
                {store.tier}
              </span>
            </div>
            <button
              onClick={() => handleSaveChanges()}
              className="pe-btn-action"
              style={{
                background: "var(--pe-accent)",
                borderColor: "var(--pe-accent)",
                color: "#fff",
              }}
              disabled={isSaving || isUploading}
            >
              {isSaving ? (
                <span>
                  <i className="fas fa-spinner fa-spin me-2"></i>Menyimpan...
                </span>
              ) : (
                <span>
                  <i className="fas fa-save me-2"></i>Simpan Perubahan
                </span>
              )}
            </button>
          </div>
        </Fade>
      </div>

      <Fade triggerOnce>
        <div className="pe-card position-relative z-2">
          {/* CUSTOM TABS */}
          <ul className="nav nav-pills mb-4 border-bottom border-secondary border-opacity-25 pb-3 gap-2">
            {[
              { id: "profile", label: "Profil & Galeri", icon: "fa-images" },
              { id: "schedule", label: "Jadwal Operasional", icon: "fa-clock" },
              { id: "business", label: "Model Bisnis", icon: "fa-briefcase" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow"
                      : "text-muted bg-transparent"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  style={
                    activeTab === tab.id
                      ? { background: "var(--pe-accent)" }
                      : {}
                  }
                >
                  <i className={`fas ${tab.icon}`}></i> {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* TAB CONTENT: PROFILE */}
          {activeTab === "profile" && (
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="form-label text-muted small text-uppercase fw-bold"
                  >
                    Nama Toko
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary"
                    id="name"
                    name="name"
                    value={store.name || ""}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="form-label text-muted small text-uppercase fw-bold"
                  >
                    Deskripsi Toko
                  </label>
                  <textarea
                    className="form-control border-secondary"
                    id="description"
                    name="description"
                    rows="5"
                    value={store.description || ""}
                    onChange={handleProfileChange}
                  ></textarea>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="p-4 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-white mb-0">Galeri Foto</h6>
                    <span className="pe-badge pe-badge-secondary">
                      {(store.images || []).length}/{store.photoLimit || 5}
                    </span>
                  </div>

                  {isPhotoLimitReached && (
                    <div className="alert alert-warning py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>
                        Batas foto tercapai untuk tier{" "}
                        <strong>{store.tier}</strong>.
                      </span>
                    </div>
                  )}

                  <div className="row g-2">
                    {(store.images || []).map((img, index) => (
                      <div className="col-6" key={index}>
                        <div
                          className="position-relative group overflow-hidden rounded-3 border border-secondary border-opacity-50"
                          style={{ height: "120px" }}
                        >
                          <img
                            src={img}
                            alt={`Store view ${index + 1}`}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                          {/* Overlay Actions */}
                          <div
                            className="position-absolute inset-0 d-flex flex-column justify-content-between p-2"
                            style={{
                              background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent, rgba(0,0,0,0.8))",
                              inset: 0,
                            }}
                          >
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger p-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "4px",
                                }}
                                onClick={() => handleDeleteImage(img)}
                                title="Hapus Foto"
                              >
                                <i className="fas fa-times x-small"></i>
                              </button>
                            </div>
                            <div>
                              {store.headerImageUrl === img ? (
                                <span className="pe-badge pe-badge-success x-small w-100 text-center d-block py-1">
                                  <i className="fas fa-check me-1"></i> Header
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light w-100 py-0 x-small"
                                  onClick={() => handleSetHeaderImage(img)}
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Set Header
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!isPhotoLimitReached && (
                      <div className="col-6">
                        <label
                          htmlFor="imageUpload"
                          className="d-flex flex-column align-items-center justify-content-center text-center p-3 h-100 rounded-3 border border-dashed border-secondary text-muted hover-white cursor-pointer transition-all"
                          style={{
                            minHeight: "120px",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          {isUploading ? (
                            <div className="spinner-border spinner-border-sm text-primary"></div>
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt fs-3 mb-2"></i>
                              <span className="small">Upload Foto</span>
                            </>
                          )}
                        </label>
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="d-none"
                          disabled={isUploading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="p-4 rounded-3 bg-dark bg-opacity-25 border border-secondary border-opacity-25">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="row align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-25 last:border-0"
                >
                  <div className="col-md-3">
                    <span className="fw-bold text-white text-capitalize d-block">
                      {dayLabels[day]}
                    </span>
                    <span
                      className={`x-small ${
                        !schedule[day]?.isClosed
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {!schedule[day]?.isClosed ? "Buka" : "Tutup"}
                    </span>
                  </div>
                  <div className="col-md-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`isOpen-${day}`}
                        checked={!schedule[day]?.isClosed}
                        onChange={(e) =>
                          handleScheduleChange(
                            day,
                            "isClosed",
                            !e.target.checked
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-muted">
                        <i className="fas fa-clock"></i>
                      </span>
                      <input
                        type="time"
                        className="form-control border-secondary text-center"
                        value={schedule[day]?.opens || "09:00"}
                        onChange={(e) =>
                          handleScheduleChange(day, "opens", e.target.value)
                        }
                        disabled={schedule[day]?.isClosed}
                      />
                      <span className="input-group-text bg-dark border-secondary text-muted">
                        s/d
                      </span>
                      <input
                        type="time"
                        className="form-control border-secondary text-center"
                        value={schedule[day]?.closes || "21:00"}
                        onChange={(e) =>
                          handleScheduleChange(day, "closes", e.target.value)
                        }
                        disabled={schedule[day]?.isClosed}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: BUSINESS MODEL */}
          {activeTab === "business" && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="alert alert-info d-flex align-items-start gap-3 bg-opacity-10 border-info border-opacity-25 text-info">
                  <i className="fas fa-info-circle mt-1 fs-5"></i>
                  <div className="small">
                    <strong>Perhatian:</strong> Perubahan pada model bisnis akan
                    mempengaruhi perhitungan tagihan dan pembagian hasil ke
                    depannya. Pastikan Anda telah berkomunikasi dengan Mitra.
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small text-uppercase fw-bold">
                    Tipe Toko (Tier)
                  </label>
                  <select
                    className="form-select border-secondary p-3"
                    id="tier"
                    name="tier"
                    value={store.tier}
                    onChange={handleProfileChange}
                  >
                    <option value="BASIC">BASIC (Sistem Komisi)</option>
                    <option value="PRO">PRO (Sistem Kontrak)</option>
                  </select>
                </div>

                {store.tier === "BASIC" ? (
                  <div className="p-4 rounded-3 border border-success border-opacity-25 bg-success bg-opacity-10">
                    <h6 className="text-success mb-3">
                      <i className="fas fa-percentage me-2"></i>Pengaturan
                      Komisi
                    </h6>
                    <label className="form-label text-white small">
                      Persentase Komisi Platform (%)
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control border-secondary"
                        id="commissionRate"
                        name="commissionRate"
                        value={store.commissionRate || ""}
                        onChange={handleProfileChange}
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                      <span className="input-group-text bg-secondary border-secondary text-white">
                        %
                      </span>
                    </div>
                    <div className="form-text text-muted mt-2">
                      Dipotong otomatis dari setiap transaksi sukses.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-3 border border-info border-opacity-25 bg-info bg-opacity-10">
                    <h6 className="text-info mb-3">
                      <i className="fas fa-file-contract me-2"></i>Pengaturan
                      Kontrak
                    </h6>
                    <label className="form-label text-white small">
                      Biaya Langganan Bulanan (Rp)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary border-secondary text-white">
                        Rp
                      </span>
                      <input
                        type="number"
                        className="form-control border-secondary"
                        id="subscriptionFee"
                        name="subscriptionFee"
                        value={store.subscriptionFee || ""}
                        onChange={handleProfileChange}
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-text text-muted mt-2">
                      Tagihan akan dibuat secara manual setiap bulan melalui
                      menu Manajemen Toko.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Fade>
    </div>
  );
};

export default AdminStoreSettingsPage;
