import React, { useState, useEffect } from "react";
import StoreCard from "../components/StoreCard";
import { useSearchParams } from "react-router-dom"; // Impor hook untuk mengelola URL query

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gunakan useSearchParams untuk membaca dan menulis query URL
  const [searchParams, setSearchParams] = useSearchParams();

  // State untuk input filter, nilainya diambil dari URL
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);

      // Bangun URL API dengan parameter dinamis
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      const apiUrl = `/api/stores?${params.toString()}`;
      console.log("Fetching stores from:", apiUrl); // Untuk debugging

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Gagal mengambil data toko");
        }
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [searchParams]); // Jalankan ulang setiap kali searchParams berubah

  // Fungsi untuk menangani perubahan filter dan memperbarui URL
  const handleFilterChange = () => {
    const newParams = new URLSearchParams();
    if (searchTerm) {
      newParams.set("search", searchTerm);
    }
    if (sortBy) {
      newParams.set("sortBy", sortBy);
    }
    setSearchParams(newParams);
  };

  // Fungsi untuk menangani penekanan tombol Enter pada input pencarian
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleFilterChange();
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page-container">
      <main className="results-content container py-4">
        <div className="results-header d-flex flex-column flex-md-row gap-3 mb-4">
          <div className="search-box-wrapper flex-grow-1">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama toko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              style={{ minWidth: "180px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Urutkan Berdasarkan</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="createdAt">Terbaru</option>
            </select>
            <button className="btn btn-primary" onClick={handleFilterChange}>
              Terapkan
            </button>
          </div>
        </div>

        <h5 className="mb-3">Menampilkan {stores.length} Toko</h5>

        <div className="results-grid">
          {stores.length > 0 ? (
            stores.map((store) => <StoreCard key={store.id} store={store} />)
          ) : (
            <div className="col-12 text-center py-5 w-100">
              <p className="text-muted">
                Toko tidak ditemukan dengan kriteria tersebut.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StorePage;
