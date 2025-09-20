// File: client/src/pages/AdminNewStorePage.jsx (Versi Lengkap dengan Input Dinamis)

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { getAllUsers } from "../services/apiService"; // Kita akan gunakan ini
import API_BASE_URL from "../apiConfig"; // Kita butuh ini untuk POST manual

const AdminNewStorePage = ({ showMessage }) => {
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState({
    name: "",
    location: "",
    description: "",
    ownerId: null,
    tier: "BASIC", // Default ke BASIC
    commissionRate: 10, // Default komisi
    subscriptionFee: 99000, // Default langganan
  });
  const [mitraOptions, setMitraOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mengambil daftar calon pemilik (mitra)
  const fetchMitraUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const mitras = allUsers
        .filter((user) => user.role === "mitra")
        .map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
      setMitraOptions(mitras);
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchMitraUsers();
  }, [fetchMitraUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (selectedOption) => {
    setStoreData((prev) => ({
      ...prev,
      ownerId: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeData.ownerId) {
      showMessage("Anda harus memilih pemilik toko (mitra).", "Error");
      return;
    }
    // Validasi input berdasarkan tier
    if (storeData.tier === "BASIC" && !storeData.commissionRate) {
      showMessage("Persentase komisi wajib diisi untuk toko BASIC.", "Error");
      return;
    }
    if (storeData.tier === "PRO" && !storeData.subscriptionFee) {
      showMessage("Biaya langganan wajib diisi untuk toko PRO.", "Error");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      // Menggunakan fetch manual karena ini endpoint baru
      const response = await fetch(`${API_BASE_URL}/api/admin/stores/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat toko baru.");
      }

      showMessage(
        "Toko baru berhasil dibuat dan permintaan persetujuan telah dikirim ke Developer."
      );
      navigate("/admin/stores");
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center mb-4">
        <Link to="/admin/stores" className="btn btn-sm btn-light me-2">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <h2 className="fs-2 mb-0">Tambah Toko Baru</h2>
      </div>

      <div className="table-card p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nama Toko
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={storeData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">
              Lokasi/Alamat
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={storeData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Deskripsi
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="4"
              value={storeData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="ownerId" className="form-label">
              Pemilik Toko (Mitra)
            </label>
            <Select
              id="ownerId"
              options={mitraOptions}
              isLoading={loading}
              isClearable
              placeholder="Pilih dari daftar mitra..."
              onChange={handleOwnerChange}
              value={mitraOptions.find(
                (opt) => opt.value === storeData.ownerId
              )}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="tier" className="form-label">
              Tipe Toko
            </label>
            <select
              className="form-select"
              id="tier"
              name="tier"
              value={storeData.tier}
              onChange={handleChange}
            >
              <option value="BASIC">BASIC (Komisi)</option>
              <option value="PRO">PRO (Langganan)</option>
            </select>
          </div>

          {/* Input Kondisional */}
          {storeData.tier === "BASIC" ? (
            <div className="mb-4">
              <label htmlFor="commissionRate" className="form-label">
                Persentase Komisi (%)
              </label>
              <input
                type="number"
                className="form-control"
                id="commissionRate"
                name="commissionRate"
                value={storeData.commissionRate}
                onChange={handleChange}
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
                value={storeData.subscriptionFee}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="text-end">
            <Link to="/admin/stores" className="btn btn-secondary me-2">
              Batal
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan dan Kirim untuk Persetujuan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewStorePage;
