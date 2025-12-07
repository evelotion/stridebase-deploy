// File: client/src/pages/StorePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import "./StorePageElevate.css";

const StorePage = ({ showMessage }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchParams] = useSearchParams();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Grid 4x2 agar rapi

  const categories = [
    "All",
    "Fast Clean",
    "Deep Clean",
    "Leather",
    "Suede",
    "Repaint",
    "Repair",
  ];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/stores`);
        if (!response.ok) throw new Error("Gagal mengambil data toko");
        const data = await response.json();
        setStores(data);

        const serviceQuery = searchParams.get("services");
        if (serviceQuery) {
          const match = categories.find((c) =>
            c.toLowerCase().includes(serviceQuery.toLowerCase())
          );
          if (match) setSelectedCategory(match);
        }
      } catch (error) {
        console.error(error);
        if (showMessage) showMessage("Gagal memuat daftar toko", "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="pe-dashboard-wrapper luxury-blue-theme">
      {/* --- 1. HERO SECTION (MINIMALIST TYPOGRAPHY) --- */}
      <section className="sp-hero">
        <div className="sp-hero-orb orb-1"></div>
        <div className="sp-hero-orb orb-2"></div>

        <div className="container position-relative z-2 text-center">
          <Fade direction="up" triggerOnce>
            <span className="sp-hero-badge">CURATED SELECTION</span>
            <h1 className="sp-hero-title">
              DISCOVER <br />
              <span className="lx-text-blue-gradient">ARTISANS.</span>
            </h1>
          </Fade>
        </div>
      </section>

      {/* --- 2. FLOATING SEARCH & FILTER (GLASS PILL) --- */}
      <div className="sp-filter-sticky">
        <div className="container">
          <div className="sp-filter-glass">
            <div className="sp-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sp-filter-divider d-none d-md-block"></div>
            <div className="sp-category-scroll">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`sp-cat-pill ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. THE GALLERY (STORE GRID) --- */}
      <section className="sp-grid-section">
        <div className="container">
          {loading ? (
            <div className="sp-loader">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : filteredStores.length > 0 ? (
            <>
              <div className="row g-4">
                {paginatedStores.map((store, index) => (
                  <div className="col-md-6 col-lg-3" key={store.id}>
                    <Fade direction="up" delay={index * 50} triggerOnce>
                      <Link to={`/store/${store.id}`} className="sp-card-link">
                        <div className="sp-card">
                          {/* Image Area - Clean & Cinematic */}
                          <div className="sp-card-img-wrapper">
                            <img
                              src={
                                store.headerImageUrl ||
                                (store.images && store.images[0]) ||
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
                              }
                              alt={store.name}
                              className="sp-card-img"
                            />

                            {/* Tier Badge (Pengganti Harga) */}
                            <div className="sp-tier-badge">
                              {store.tier === "PRO"
                                ? "PRO PARTNER"
                                : "VERIFIED"}
                            </div>

                            {/* Rating Star (Minimalis) */}
                            <div className="sp-rating-badge">
                              ★ {store.rating ? store.rating.toFixed(1) : "N/A"}
                            </div>
                          </div>

                          {/* Content Area - Gallery Style */}
                          <div className="sp-card-body">
                            <div className="d-flex justify-content-between align-items-end">
                              <div>
                                <h3 className="sp-card-title text-truncate">
                                  {store.name}
                                </h3>
                                <div className="sp-card-meta">
                                  <span className="text-truncate">
                                    {store.location || "Jakarta"}
                                  </span>
                                </div>
                              </div>
                              {/* Tombol Panah Halus */}
                              <div className="sp-card-arrow">
                                <i className="fas fa-arrow-right"></i>
                              </div>
                            </div>

                            {/* Hover Reveal: Explore Text */}
                            <div className="sp-card-hover-text">
                              Explore Atelier
                            </div>
                          </div>

                          {/* Glow Border Effect */}
                          <div className="sp-card-border-glow"></div>
                        </div>
                      </Link>
                    </Fade>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="sp-pagination">
                  <button
                    className="sp-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <span className="sp-page-info">
                    PAGE {currentPage} OF {totalPages}
                  </span>
                  <button
                    className="sp-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="sp-empty-state">
              <h3>No Artisans Found</h3>
              <p>Try adjusting your search.</p>
              <button
                className="lx-btn-outline-blue"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StorePage;
