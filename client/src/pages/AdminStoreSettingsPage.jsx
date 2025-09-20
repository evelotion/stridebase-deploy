// File: client/src/pages/AdminStoreSettingsPage.jsx (Versi Final Lengkap dengan Pengaturan Tier)

import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getStoreSettingsForAdmin,
  updateStoreSettingsByAdmin,
  uploadAdminPhoto,
} from "../services/apiService";

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
      showMessage(err.message, "Error");
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
    // Simpan perubahan langsung saat header diubah
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
      // Kirim semua data yang relevan, termasuk tier dan biayanya
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

      await updateStoreSettingsByAdmin(storeId, payload);
      setStore(dataToSave); // Perbarui state lokal agar UI sinkron
      setSchedule(newSchedule);
      showMessage("Perubahan berhasil disimpan!");
    } catch (err) {
      showMessage(err.message, "Error");
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
      // Langsung simpan setelah upload berhasil
      await handleSaveChanges(updatedStoreWithNewImage);
      showMessage("Foto berhasil diunggah dan disimpan!");
    } catch (err) {
      showMessage(err.message, "Error");
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

    // Langsung simpan setelah hapus
    await handleSaveChanges(updatedStoreWithoutImage);
    showMessage("Foto berhasil dihapus dan perubahan disimpan!");
  };

  if (loading || !store)
    return <div className="p-4">Memuat pengaturan toko...</div>;

  const isPhotoLimitReached =
    (store.images || []).length >= (store.photoLimit || 5);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <div>
          <Link to="/admin/stores" className="btn btn-sm btn-light me-2">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h2 className="fs-2 mb-0 d-inline-block align-middle">
            Kelola Pengaturan: {store.name}
          </h2>
        </div>
        <button
          onClick={() => handleSaveChanges()}
          className="btn btn-primary"
          disabled={isSaving || isUploading}
        >
          {isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </button>
      </div>

      <div className="table-card p-3 p-md-4 shadow-sm">
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profil & Galeri
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "schedule" ? "active" : ""}`}
              onClick={() => setActiveTab("schedule")}
            >
              Jadwal Operasional
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "business" ? "active" : ""}`}
              onClick={() => setActiveTab("business")}
            >
              Bisnis Model
            </button>
          </li>
        </ul>

        {activeTab === "profile" && (
          <div>
            <div className="mb-4">
              <label htmlFor="name" className="form-label">
                Nama Toko
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={store.name || ""}
                onChange={handleProfileChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                Deskripsi Toko
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="4"
                value={store.description || ""}
                onChange={handleProfileChange}
              ></textarea>
            </div>
            <h5 className="mb-3">
              Galeri Foto ({(store.images || []).length}/{store.photoLimit || 5}
              )
            </h5>
            {isPhotoLimitReached && (
              <div className="alert alert-warning small">
                Toko ini telah mencapai batas maksimal{" "}
                <strong>{store.photoLimit || 5} foto</strong> untuk tier{" "}
                <strong>{store.tier}</strong>.
              </div>
            )}
            <div className="row g-3">
              {(store.images || []).map((img, index) => (
                <div className="col-md-3" key={index}>
                  <div className="photo-gallery-item position-relative">
                    <img
                      src={img}
                      alt={`Store view ${index + 1}`}
                      className="img-fluid rounded"
                      style={{
                        height: "150px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteImage(img)}
                        title="Hapus Foto"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="position-absolute bottom-0 start-0 m-2">
                      {store.headerImageUrl === img ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i> Header
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => handleSetHeaderImage(img)}
                          title="Jadikan Header"
                        >
                          Jadikan Header
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!isPhotoLimitReached && (
                <div className="col-md-3">
                  <label
                    htmlFor="imageUpload"
                    className="photo-item-add d-flex align-items-center justify-content-center text-center p-3"
                    style={{ height: "150px" }}
                  >
                    {isUploading ? (
                      <div className="spinner-border spinner-border-sm"></div>
                    ) : (
                      <div>
                        <i className="fas fa-plus"></i>
                        <span className="d-block small">Tambah Foto</span>
                      </div>
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
        )}

        {activeTab === "schedule" && (
          <form>
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="row align-items-center mb-3 pb-3 border-bottom"
              >
                <div className="col-md-2">
                  <strong>{dayLabels[day]}</strong>
                </div>
                <div className="col-md-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`isOpen-${day}`}
                      checked={!schedule[day]?.isClosed}
                      onChange={(e) =>
                        handleScheduleChange(day, "isClosed", !e.target.checked)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`isOpen-${day}`}
                    >
                      {!schedule[day]?.isClosed ? "Buka" : "Tutup"}
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="time"
                      className="form-control"
                      value={schedule[day]?.opens || "09:00"}
                      onChange={(e) =>
                        handleScheduleChange(day, "opens", e.target.value)
                      }
                      disabled={schedule[day]?.isClosed}
                    />
                    <span className="input-group-text">-</span>
                    <input
                      type="time"
                      className="form-control"
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
          </form>
        )}

        {activeTab === "business" && (
          <div>
            <div className="mb-3">
              <label htmlFor="tier" className="form-label">
                Tipe Toko
              </label>
              <select
                className="form-select"
                id="tier"
                name="tier"
                value={store.tier}
                onChange={handleProfileChange}
              >
                <option value="BASIC">BASIC (Komisi)</option>
                <option value="PRO">PRO (Langganan)</option>
              </select>
            </div>

            {/* Input Kondisional */}
            {store.tier === "BASIC" ? (
              <div className="mb-4">
                <label htmlFor="commissionRate" className="form-label">
                  Persentase Komisi (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="commissionRate"
                  name="commissionRate"
                  value={store.commissionRate || ""}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="subscriptionFee" className="form-label">
                  Biaya Langganan Bulanan (Rp)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="subscriptionFee"
                  name="subscriptionFee"
                  value={store.subscriptionFee || ""}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoreSettingsPage;
