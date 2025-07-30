import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const PartnerSettingsPage = ({ showMessage }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [store, setStore] = useState({
    name: "",
    description: "",
    images: [],
    headerImage: "",
    photoLimit: 3,
  });
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStoreData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch("/api/partner/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal mengambil data toko.");

      setStore({
        name: data.name || "",
        description: data.description || "",
        images: data.images || [],
        headerImage:
          data.headerImage || (data.images.length > 0 ? data.images[0] : ""),
        photoLimit: data.photoLimit || 3,
      });

      const initialSchedule = {};
      daysOfWeek.forEach((day) => {
        initialSchedule[day] = data.schedule?.[day] || {
          isOpen: true,
          opens: "09:00",
          closes: "21:00",
        };
      });
      setSchedule(initialSchedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetHeaderImage = (imageUrl) => {
    setStore((prev) => ({ ...prev, headerImage: imageUrl }));
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/partner/upload-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal mengunggah foto.");

      setStore((prev) => ({
        ...prev,
        images: [...prev.images, result.filePath],
        headerImage: prev.headerImage ? prev.headerImage : result.filePath,
      }));
      showMessage("Foto berhasil diunggah! Jangan lupa simpan perubahan.");
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteImage = (imageToDelete) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;
    setStore((prev) => {
      const newImages = prev.images.filter((img) => img !== imageToDelete);
      const newHeader =
        prev.headerImage === imageToDelete
          ? newImages.length > 0
            ? newImages[0]
            : ""
          : prev.headerImage;
      return { ...prev, images: newImages, headerImage: newHeader };
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setIsSaving(true);

    const payload = {
      name: store.name,
      description: store.description,
      images: store.images,
      headerImage: store.headerImage,
      schedule: schedule,
    };

    try {
      const response = await fetch("/api/partner/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menyimpan perubahan.");
      showMessage("Pengaturan toko berhasil disimpan!");
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isPhotoLimitReached = store
    ? store.images.length >= store.photoLimit
    : false;

  if (loading) return <div className="p-4">Memuat pengaturan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Pengaturan Toko</h2>
        <button
          onClick={handleSaveChanges}
          className="btn btn-primary"
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </button>
      </div>

      <div className="table-card p-3 p-md-4 shadow-sm">
        <ul className="nav nav-tabs mb-4">
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
                value={store.name}
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
                value={store.description}
                onChange={handleProfileChange}
              ></textarea>
            </div>

            <h5 className="mb-3">Galeri Foto</h5>
            {isPhotoLimitReached && (
              <div className="alert alert-warning small">
                Anda telah mencapai batas maksimal{" "}
                <strong>{store.photoLimit} foto</strong>.
                <Link to="/partner/upgrade" className="alert-link">
                  {" "}
                  Upgrade ke PRO
                </Link>{" "}
                untuk menambah lebih banyak foto.
              </div>
            )}

            <div className="row g-3">
              {store.images.map((img, index) => (
                <div className="col-md-3" key={index}>
                  <div className="photo-gallery-item position-relative">
                    <img
                      src={`${img}`}
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
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteImage(img)}
                        title="Hapus Foto"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="position-absolute bottom-0 start-0 m-2">
                      {store.headerImage === img ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i> Header Aktif
                        </span>
                      ) : (
                        <button
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
                    <div>
                      <i className="fas fa-plus"></i>
                      <span className="d-block small">Tambah Foto</span>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="d-none"
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
                      checked={schedule[day]?.isOpen}
                      onChange={(e) =>
                        handleScheduleChange(day, "isOpen", e.target.checked)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`isOpen-${day}`}
                    >
                      {schedule[day]?.isOpen ? "Buka" : "Tutup"}
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="time"
                      className="form-control"
                      value={schedule[day]?.opens}
                      onChange={(e) =>
                        handleScheduleChange(day, "opens", e.target.value)
                      }
                      disabled={!schedule[day]?.isOpen}
                    />
                    <span className="input-group-text">-</span>
                    <input
                      type="time"
                      className="form-control"
                      value={schedule[day]?.closes}
                      onChange={(e) =>
                        handleScheduleChange(day, "closes", e.target.value)
                      }
                      disabled={!schedule[day]?.isOpen}
                    />
                  </div>
                </div>
              </div>
            ))}
          </form>
        )}
      </div>
    </div>
  );
};

export default PartnerSettingsPage;
