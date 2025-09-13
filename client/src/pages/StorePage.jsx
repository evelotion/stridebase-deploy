// File: client/src/pages/StorePage.jsx (Perbaikan Final)

import React, { useState, useEffect } from "react";
import StoreCard from "../components/StoreCard";
import { useSearchParams } from "react-router-dom";
import { getStores } from "../services/apiService";

const UNIQUE_SERVICES = [
  "Fast Clean Sneakers", "Deep Clean Leather", "Cuci Cepat Reguler",
  "Perawatan Suede", "Unyellowing Treatment", "Repair Consultation",
];

const RatingFilter = ({ rating, setRating }) => (
  <div className="d-flex">
    {[1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={`fas fa-star fa-lg`}
        style={{
          cursor: "pointer",
          color: star <= rating ? "#ffc107" : "#e4e5e9",
          marginRight: "4px",
        }}
        onClick={() => setRating(star === rating ? 0 : star)}
      />
    ))}
  </div>
);

const StorePage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");
  const [minRating, setMinRating] = useState(parseInt(searchParams.get("minRating")) || 0);
  const [userLocation, setUserLocation] = useState({
    lat: searchParams.get("lat") || null,
    lng: searchParams.get("lng") || null,
  });
  const [selectedServices, setSelectedServices] = useState(
    searchParams.get("services")?.split(",") || []
  );
  const [openNow, setOpenNow] = useState(searchParams.get("openNow") === "true");

  // --- PERBAIKAN UTAMA DI SINI ---
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (sortBy) params.append("sortBy", sortBy);
      if (minRating > 0) params.append("minRating", minRating);
      if (userLocation.lat && userLocation.lng) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
      }
      if (selectedServices.length > 0) {
        params.append("services", selectedServices.join(","));
      }
      if (openNow) {
        params.append("openNow", "true");
      }
      
      // Update URL search params
      setSearchParams(params, { replace: true });

      try {
        const data = await getStores(params);
        setStores(data);
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
        if (showMessage) {
            showMessage(error.message || "Gagal mengambil data toko", "Error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy, minRating, userLocation.lat, userLocation.lng, selectedServices.toString(), openNow, showMessage]);
  // --- AKHIR PERBAIKAN ---


  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSortBy("distance");
        },
        (error) => {
          showMessage("Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.");
          console.error(error);
        }
      );
    } else {
      showMessage("Geolocation tidak didukung oleh browser Anda.");
    }
  };

  const handleServiceFilterChange = (serviceName) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const resetAdvancedFilters = () => {
    setMinRating(0);
    setSelectedServices([]);
    setOpenNow(false);
  };

  const hasActiveAdvancedFilters = minRating > 0 || selectedServices.length > 0 || openNow;

  return (
    <div className="store-page-redesigned">
      <div className="filter-panel-top">
        {/* Konten JSX untuk filter panel tetap sama */}
        <div className="container d-flex flex-wrap align-items-center gap-2">
          <div className="search-input-wrapper flex-grow-1">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama atau lokasi toko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dropdown">
            <button
              className={`btn ${
                hasActiveAdvancedFilters ? "btn-dark" : "btn-outline-dark"
              }`}
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-bs-auto-close="outside"
            >
              <i className="fas fa-filter me-2"></i>
              Filter Lanjutan
              {hasActiveAdvancedFilters && (
                <span className="filter-active-dot"></span>
              )}
            </button>
            <div className="dropdown-menu p-4" style={{ width: "350px" }}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Min Rating</label>
                <RatingFilter rating={minRating} setRating={setMinRating} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Layanan Spesifik
                </label>
                <div className="service-filter-list">
                  {UNIQUE_SERVICES.map((service) => (
                    <div className="form-check" key={service}>
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id={`service-adv-${service}`}
                        checked={selectedServices.includes(service)}
                        onChange={() => handleServiceFilterChange(service)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`service-adv-${service}`}
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3 form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="openNowSwitchAdv"
                  checked={openNow}
                  onChange={(e) => setOpenNow(e.target.checked)}
                />
                <label
                  className="form-check-label fw-semibold"
                  htmlFor="openNowSwitchAdv"
                >
                  Sedang Buka
                </label>
              </div>
              <hr />
              <button
                className="btn btn-sm btn-light w-100"
                onClick={resetAdvancedFilters}
              >
                Reset Filter
              </button>
            </div>
          </div>

          <select
            className="form-select flex-grow-0"
            style={{ width: "180px" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Urutkan: Rating</option>
            <option value="distance" disabled={!userLocation.lat}>
              Urutkan: Jarak
            </option>
            <option value="createdAt">Urutkan: Terbaru</option>
          </select>

          <button
            className="btn btn-outline-dark"
            onClick={handleGetUserLocation}
          >
            <i
              className={`fas ${
                userLocation.lat
                  ? "fa-location-crosshairs"
                  : "fa-location-arrow"
              }`}
            ></i>
          </button>
        </div>
      </div>

      <main className="container py-4">
        <h5 className="mb-4">Menampilkan {stores.length} Toko</h5>
        <div className="results-grid-redesigned">
          {loading ? (
            <p>Memuat toko...</p>
          ) : stores.length > 0 ? (
            stores.map((store) => <StoreCard key={store.id} store={store} />)
          ) : (
            <div className="w-100 text-center py-5">
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