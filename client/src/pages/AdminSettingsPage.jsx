// File: client/src/pages/AdminSettingsPage.jsx (Versi Lengkap & Fungsional)

import React, { useState, useEffect, useCallback } from "react";
import { getAdminSettings, updateAdminSettings } from "../services/apiService";

const AdminSettingsPage = ({ showMessage }) => {
  const [settings, setSettings] = useState({
    globalAnnouncement: "",
    enableGlobalAnnouncement: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null); // Untuk melacak perubahan

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data);
      setInitialSettings(JSON.stringify(data)); // Simpan kondisi awal
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateAdminSettings(settings);
      setInitialSettings(JSON.stringify(settings)); // Perbarui kondisi awal setelah simpan
      if (showMessage) showMessage("Pengaturan berhasil disimpan dan disiarkan!");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== initialSettings;

  if (loading) return <div className="p-4">Memuat pengaturan...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fs-2 mb-0">Pengaturan Operasional</h2>
        <button 
          className="btn btn-dark" 
          onClick={handleSaveChanges} 
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Menyimpan..." : "Simpan & Siarkan Perubahan"}
        </button>
      </div>

      <div className="table-card p-4 shadow-sm">
        <h5 className="mb-3">Pengumuman Global</h5>
        <div className="mb-4">
          <label htmlFor="globalAnnouncement" className="form-label">
            Isi Pesan Pengumuman
          </label>
          <textarea
            id="globalAnnouncement"
            name="globalAnnouncement"
            className="form-control"
            rows="3"
            placeholder="Tulis pengumuman yang akan ditampilkan di seluruh situs..."
            value={settings.globalAnnouncement}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="enableGlobalAnnouncement"
            name="enableGlobalAnnouncement"
            checked={settings.enableGlobalAnnouncement}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="enableGlobalAnnouncement">
            Tampilkan Pengumuman Global
          </label>
          <div className="form-text mt-1">
            Jika aktif, bar pengumuman akan muncul di bawah navbar untuk semua pengguna.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;