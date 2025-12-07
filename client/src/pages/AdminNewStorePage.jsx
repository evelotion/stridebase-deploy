// File: client/src/pages/AdminNewStorePage.jsx (Theme-Aware Fix)

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Fade } from "react-awesome-reveal";
import { getAllUsers } from "../services/apiService";
import API_BASE_URL from "../apiConfig";
import "../styles/ElevateDashboard.css";

// Style untuk React-Select agar mengikuti Tema (Dynamic)
const getSelectStyles = (isLightMode) => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: isLightMode ? "#ffffff" : "rgba(33, 37, 41, 1)",
    borderColor: state.isFocused ? "var(--pe-accent)" : "var(--pe-card-border)",
    color: isLightMode ? "#000" : "#fff",
    padding: "0.375rem 0.75rem",
    boxShadow: state.isFocused ? "0 0 0 0.25rem var(--pe-accent-glow)" : "none",
    "&:hover": { borderColor: "var(--pe-accent)" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isLightMode ? "#ffffff" : "#1e1e1e",
    border: "1px solid var(--pe-card-border)",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "var(--pe-accent)" : "transparent",
    color: state.isFocused ? "#fff" : isLightMode ? "#000" : "#fff",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isLightMode ? "#000" : "#fff",
  }),
  input: (provided) => ({
    ...provided,
    color: isLightMode ? "#000" : "#fff",
  }),
});

const AdminNewStorePage = ({ showMessage }) => {
  const navigate = useNavigate();
  // Cek mode tema dari localStorage atau body class untuk React-Select
  const isLightMode = localStorage.getItem("adminTheme") === "light";

  const [storeData, setStoreData] = useState({
    name: "",
    location: "",
    description: "",
    ownerId: null,
    tier: "BASIC",
    commissionRate: 10,
    subscriptionFee: 99000,
  });
  const [mitraOptions, setMitraOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      if (showMessage) showMessage(err.message, "Error");
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

    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stores/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal membuat toko.");

      showMessage("Toko baru berhasil dibuat!", "Success");
      navigate("/admin/stores");
    } catch (err) {
      showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1"></div>

      <div className="d-flex justify-content-between align-items-end mb-5 position-relative z-2">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              <Link
                to="/admin/stores"
                className="text-decoration-none text-muted hover-accent"
              >
                <i className="fas fa-arrow-left me-2"></i>Kembali
              </Link>
            </h6>
            <h2 className="pe-title mb-0">Tambah Toko Baru</h2>
          </div>
        </Fade>
      </div>

      <Fade triggerOnce>
        <div className="row justify-content-center position-relative z-2">
          <div className="col-lg-8">
            <div className="pe-card p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                <h5 className="pe-title mb-4 border-bottom border-secondary border-opacity-25 pb-2">
                  <i className="fas fa-store me-2 text-info"></i> Identitas Toko
                </h5>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label
                      htmlFor="name"
                      className="form-label text-muted small text-uppercase fw-bold"
                    >
                      Nama Toko
                    </label>
                    {/* HAPUS bg-dark text-white manual, biarkan CSS global menangani */}
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Contoh: Shoes Clean Jakarta"
                      value={storeData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="location"
                      className="form-label text-muted small text-uppercase fw-bold"
                    >
                      Lokasi
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      placeholder="Contoh: Jakarta Selatan"
                      value={storeData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label
                      htmlFor="description"
                      className="form-label text-muted small text-uppercase fw-bold"
                    >
                      Deskripsi
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      placeholder="Jelaskan layanan toko..."
                      value={storeData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <h5 className="pe-title mb-4 mt-5 border-bottom border-secondary border-opacity-25 pb-2">
                  <i className="fas fa-file-contract me-2 text-warning"></i>{" "}
                  Kepemilikan & Bisnis
                </h5>

                <div className="row g-4 mb-4">
                  <div className="col-12">
                    <label className="form-label text-muted small text-uppercase fw-bold">
                      Pilih Pemilik
                    </label>
                    <Select
                      id="ownerId"
                      options={mitraOptions}
                      isLoading={loading}
                      isClearable
                      styles={getSelectStyles(isLightMode)}
                      placeholder="Cari nama atau email mitra..."
                      onChange={handleOwnerChange}
                      value={mitraOptions.find(
                        (opt) => opt.value === storeData.ownerId
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small text-uppercase fw-bold">
                      Tipe Kerjasama
                    </label>
                    <select
                      className="form-select"
                      id="tier"
                      name="tier"
                      value={storeData.tier}
                      onChange={handleChange}
                    >
                      <option value="BASIC">BASIC (Sistem Komisi)</option>
                      <option value="PRO">PRO (Sistem Kontrak Bulanan)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    {storeData.tier === "BASIC" ? (
                      <div>
                        <label className="form-label text-muted small text-uppercase fw-bold">
                          Persentase Komisi (%)
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            id="commissionRate"
                            name="commissionRate"
                            value={storeData.commissionRate}
                            onChange={handleChange}
                            required
                            min="0"
                            max="100"
                          />
                          <span className="input-group-text">%</span>
                        </div>
                        {/* FIX UTAMA: Gunakan class 'form-text' saja, CSS global akan mewarnainya */}
                        <div className="form-text mt-1">
                          Dipotong otomatis dari setiap transaksi sukses.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="form-label text-muted small text-uppercase fw-bold">
                          Biaya Langganan
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">Rp</span>
                          <input
                            type="number"
                            className="form-control"
                            id="subscriptionFee"
                            name="subscriptionFee"
                            value={storeData.subscriptionFee}
                            onChange={handleChange}
                            required
                            min="0"
                          />
                        </div>
                        <div className="form-text mt-1">
                          Tagihan manual akan dibuat setiap bulan oleh admin.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top border-secondary border-opacity-25">
                  <Link
                    to="/admin/stores"
                    className="pe-btn-action text-decoration-none"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    className="pe-btn-action"
                    style={{
                      background: "var(--pe-accent)",
                      borderColor: "var(--pe-accent)",
                      color: "#fff",
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Memproses..." : "Simpan & Ajukan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default AdminNewStorePage;
