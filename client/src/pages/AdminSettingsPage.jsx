import React, { useState, useEffect } from "react";

const AdminSettingsPage = () => {
  // State sekarang menampung seluruh objek config, termasuk featureFlags
  const [config, setConfig] = useState({
    globalAnnouncement: "",
    featureFlags: { maintenanceMode: false },
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data konfigurasi.");
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ### FUNGSI INI SEKARANG MENANGANI SEMUA PERUBAHAN ###
  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setConfig((prev) => ({
        ...prev,
        featureFlags: {
          ...prev.featureFlags,
          [name]: checked,
        },
      }));
    } else {
      setConfig((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Gagal menyimpan perubahan.");
      alert("Pengaturan berhasil disimpan!");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-4">Memuat pengaturan...</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Pengaturan Platform</h2>
        <button
          className="btn btn-primary"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="table-card p-4 shadow-sm">
        <h5 className="mb-3">Konfigurasi Umum</h5>
        <div className="mb-4">
          <label htmlFor="globalAnnouncement" className="form-label">
            Pengumuman Global
          </label>
          <textarea
            id="globalAnnouncement"
            name="globalAnnouncement"
            className="form-control"
            rows="3"
            placeholder="Tulis pengumuman yang akan ditampilkan di seluruh situs..."
            value={config.globalAnnouncement || ""}
            onChange={handleConfigChange}
          ></textarea>
        </div>

        <hr className="my-4" />
        <h5 className="mb-3">Pengaturan Situs</h5>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="maintenanceMode"
            name="maintenanceMode" // Nama ini akan digunakan di handleConfigChange
            checked={config.featureFlags?.maintenanceMode || false}
            onChange={handleConfigChange} // Menggunakan handler yang sudah disatukan
          />
          <label className="form-check-label" htmlFor="maintenanceMode">
            Aktifkan Mode Maintenance
          </label>
          <div className="form-text mt-1">
            Jika aktif, hanya admin dan developer yang dapat mengakses situs.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
