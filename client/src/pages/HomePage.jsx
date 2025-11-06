// File: client/src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";
import GlobalAnnouncement from "../components/GlobalAnnouncement"; // Asumsi komponen ini ada
import { Fade } from "react-awesome-reveal";
import "./HomePageModern.css";
import HeroCarousel from "../components/HeroCarousel"; // Komponen BARU kita

const serviceCategories = [
  { name: "Cuci Cepat", icon: "fa-rocket", link: "/store?services=Fast+Clean" },
  { name: "Perawatan Kulit", icon: "fa-gem", link: "/store?services=Leather" },
  { name: "Suede", icon: "fa-leaf", link: "/store?services=Suede" },
  { name: "Unyellowing", icon: "fa-sun", link: "/store?services=Unyellowing" },
  { name: "Reparasi", icon: "fa-tools", link: "/store?services=Repair" },
  { name: "Repaint", icon: "fa-paint-brush", link: "/store?services=Repaint" },
  { name: "Tas", icon: "fa-shopping-bag", link: "/store?services=Bag" },
  { name: "Topi", icon: "fa-hat-wizard", link: "/store?services=Cap" },
];

const HomePage = ({
  theme, // Ini sepertinya tema global (light/dark), bukan 'classic'/'modern'
  user,
  notifications,
  unreadCount,
  handleLogout,
  homePageTheme = "classic", // Kita akan gunakan prop ini
}) => {
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true);
  const [featuredStores, setFeaturedStores] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendedStores, setRecommendedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/homepage`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data homepage");
        }
        const data = await response.json();
        setFeaturedStores(data.featuredStores || []);
        setBanners(data.banners || []);
        setRecommendedStores(data.recommendedStores || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  const handleAnnouncementClose = () => {
    setAnnouncementVisible(false);
  };

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="alert alert-danger" role="alert">
      {error}
    </div>
  );

  // =================================================================
  // FUNGSI RENDER TEMA MODERN
  // =================================================================
  const renderModernHomepage = () => (
    <>
      {/* ===== BAGIAN CAROUSEL BARU (LANGKAH 1) ===== */}
      {/* Ini akan muncul di atas segalanya di tema modern */}
      {/* Kita akan sembunyikan di mobile menggunakan CSS */}
      <div className="hero-carousel-container-modern-desktop">
        <HeroCarousel banners={banners} />
      </div>
      {/* ============================================== */}

      {isAnnouncementVisible && (
        <GlobalAnnouncement onClose={handleAnnouncementClose} />
      )}

      {/* Konten modern yang sudah ada sebelumnya */}
      <div className="modern-hero-section">
        <h1>Temukan Perawatan Terbaik untuk Sepatumu</h1>
        <p>
          Dari cuci cepat hingga restorasi penuh, kami punya ahlinya untukmu.
        </p>
        <div className="modern-search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari layanan impianmu..."
            onClick={() => navigate("/store")}
          />
          <button
            onClick={() => navigate("/store")}
            className="btn btn-primary"
          >
            Cari
          </button>
        </div>
      </div>

      <Fade direction="up" triggerOnce>
        <div className="service-categories-modern">
          <h2>Layanan Populer</h2>
          <div className="categories-grid">
            {serviceCategories.map((category, index) => (
              <Link to={category.link} key={index} className="category-card">
                <i className={`fas ${category.icon}`}></i>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </Fade>

      <Fade direction="up" triggerOnce>
        <div className="recommended-stores-modern">
          <h2>Rekomendasi Pilihan</h2>
          <p>Toko-toko terbaik pilihan editor kami minggu ini.</p>
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : (
            <div className="store-grid-modern">
              {recommendedStores.length > 0 ? (
                recommendedStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    theme={homePageTheme}
                  />
                ))
              ) : (
                <p>Belum ada toko rekomendasi.</p>
              )}
            </div>
          )}
        </div>
      </Fade>

      {/* Bagian 'Featured Stores' yang sudah ada */}
      <Fade direction="up" triggerOnce>
        <div className="featured-stores-modern">
          <h2>Toko Unggulan</h2>
          <p>Mitra terverifikasi dengan layanan dan rating terbaik.</p>
          {loading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : (
            <div className="store-grid-modern">
              {featuredStores.length > 0 ? (
                featuredStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    theme={homePageTheme}
                  />
                ))
              ) : (
                <p>Belum ada toko unggulan.</p>
              )}
            </div>
          )}
        </div>
      </Fade>
    </>
  );

  // =================================================================
  // FUNGSI RENDER TEMA CLASSIC
  // =================================================================
  const renderClassicHomepage = () => (
    <>
      {isAnnouncementVisible && (
        <GlobalAnnouncement onClose={handleAnnouncementClose} />
      )}

      {/* Bagian Kategori Layanan */}
      <div className="service-categories mb-4">
        <div className="row g-2">
          {serviceCategories.map((category, index) => (
            <div
              key={index}
              className="col-3 col-md-3 text-center"
              onClick={() => navigate(category.link)}
              style={{ cursor: "pointer" }}
            >
              <div className="card h-100 card-service-category">
                <div className="card-body">
                  <i className={`fas ${category.icon} fa-2x mb-2`}></i>
                  <p className="mb-0">{category.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Banners (Hanya di Classic) */}
      {banners.length > 0 && <HeroCarousel banners={banners} />}

      {/* Toko Rekomendasi */}
      <div className="mt-4">
        <h2 className="h4">Rekomendasi Pilihan</h2>
        <p className="text-muted">
          Toko-toko terbaik pilihan editor kami minggu ini.
        </p>
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <div className="row g-3">
            {recommendedStores.length > 0 ? (
              recommendedStores.map((store) => (
                <div key={store.id} className="col-12 col-md-6 col-lg-3">
                  <StoreCard store={store} theme={homePageTheme} />
                </div>
              ))
            ) : (
              <p>Belum ada toko rekomendasi.</p>
            )}
          </div>
        )}
      </div>

      {/* Toko Unggulan */}
      <div className="mt-4">
        <h2 className="h4">Toko Unggulan</h2>
        <p className="text-muted">
          Mitra terverifikasi dengan layanan dan rating terbaik.
        </p>
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <div className="row g-3">
            {featuredStores.length > 0 ? (
              featuredStores.map((store) => (
                <div key={store.id} className="col-12 col-md-6 col-lg-3">
                  <StoreCard store={store} theme={homePageTheme} />
                </div>
              ))
            ) : (
              <p>Belum ada toko unggulan.</p>
            )}
          </div>
        )}
      </div>
    </>
  );

  // =================================================================
  // JSX UTAMA YANG DI-RETURN
  // =================================================================
  return (
    <div
      className={`homepage-container ${
        homePageTheme === "modern" ? "theme-modern" : "theme-classic"
      }`}
    >
      {/* Top Bar (Logo, User, Search) - Tetap sama untuk kedua tema */}
      <div className="homepage-header sticky-top">
        <div className="top-bar">
          <Link to="/">
            <img src="/logo-dark.png" alt="StrideBase" className="logo" />
          </Link>
          <div className="user-controls">
            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="btn btn-icon btn-sm me-2 position-relative"
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                      <span className="visually-hidden">unread messages</span>
                    </span>
                  )}
                </Link>
                <div className="dropdown">
                  <button
                    className="btn btn-icon btn-sm"
                    type="button"
                    id="userMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle"></i>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userMenuButton"
                  >
                    <li>
                      <h6 className="dropdown-header">
                        Halo, {user.name || "Pengguna"}
                      </h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/dashboard">
                        <i className="fas fa-tachometer-alt fa-fw me-2"></i>
                        Dashboard Pengguna
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item dropdown-item-danger"
                      >
                        <i className="fas fa-sign-out-alt fa-fw me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-gradient btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
        <div className="search-bar-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari layanan atau toko..."
            onClick={() => navigate("/store")}
          />
        </div>
      </div>

      {/* Konten Utama (dibungkus container) */}
      <div className="container mx-auto px-4 py-8">
        {/* Konten Desktop (Conditional) */}
        <div className="d-none d-lg-block">
          {homePageTheme === "modern"
            ? renderModernHomepage()
            : renderClassicHomepage()}
        </div>

        {/* Konten Mobile (selalu classic) */}
        <div className="d-lg-none">{renderClassicHomepage()}</div>
      </div>
    </div>
  );
};

export default HomePage;
