import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";

// Kategori Layanan (Data Dummy, bisa Anda kembangkan lebih lanjut)
const serviceCategories = [
  { name: "Cuci Cepat", icon: "fa-rocket", link: "/store?services=Fast+Clean" },
  { name: "Perawatan Kulit", icon: "fa-gem", link: "/store?services=Leather" },
  { name: "Suede", icon: "fa-leaf", link: "/store?services=Suede" },
  { name: "Unyellowing", icon: "fa-sun", link: "/store?services=Unyellowing" },
];

const HomePage = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendedStores, setRecommendedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [storesRes, bannersRes, recommendationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stores`),
          fetch(`${API_BASE_URL}/api/banners`),
          token
            ? fetch(`${API_BASE_URL}/api/user/recommendations`, { headers })
            : Promise.resolve(null),
        ]);

        if (!storesRes.ok || !bannersRes.ok) {
          throw new Error("Gagal mengambil data untuk homepage.");
        }

        const storesData = await storesRes.json();
        const bannersData = await bannersRes.json();

        const sortedStores = storesData.sort((a, b) => b.rating - a.rating);
        setFeaturedStores(sortedStores.slice(0, 3));
        setBanners(bannersData);

        if (recommendationsRes && recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendedStores(recommendationsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  return (
    <div className="homepage-mobile-container">
      {/* ======================================================= */}
      {/* === BAGIAN BARU: Header & Search Bar (Mobile Only) === */}
      {/* ======================================================= */}
      <div className="mobile-home-header d-lg-none">
        <div className="location-selector">
          <i className="fas fa-map-marker-alt"></i>
          <div>
            <span className="small text-muted">Lokasi Anda</span>
            <span className="fw-bold d-block">Jakarta Utara</span>
          </div>
        </div>
        <div className="search-bar-container">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Cari layanan atau toko..." />
        </div>
      </div>

      {/* ======================================================= */}
      {/* === Hero Section yang Dimodifikasi === */}
      {/* ======================================================= */}
      <section className="hero-section text-center text-lg-start">
        {/* Konten Hero untuk Desktop (disembunyikan di mobile) */}
        <div className="container d-none d-lg-block">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <h1 className="display-4 fw-bold mb-4">
                Merawat lebih dari <br />
                <span className="hero-highlight">Sekedar Membersihkan.</span>
              </h1>
              <p className="lead text-muted mb-4">
                Karena setiap detail layak dirawat sepenuh hati.
              </p>
              <Link
                to="/store"
                className="btn btn-primary btn-lg px-4 shadow-sm"
              >
                Cari Toko Sekarang <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              {banners.length > 0 && (
                <div
                  id="heroBannerCarousel"
                  className="carousel slide shadow-lg rounded-4"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-indicators">
                    {banners.map((banner, index) => (
                      <button
                        type="button"
                        data-bs-target="#heroBannerCarousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : "false"}
                        aria-label={`Slide ${index + 1}`}
                        key={banner.id}
                      ></button>
                    ))}
                  </div>

                  <div className="carousel-inner rounded-4">
                    {banners.map((banner, index) => (
                      <div
                        className={`carousel-item ${
                          index === 0 ? "active" : ""
                        }`}
                        key={banner.id}
                      >
                        <Link to={banner.linkUrl}>
                          <img
                            src={`${banner.imageUrl}`}
                            className="d-block w-100 hero-banner-img"
                            alt={`Banner ${index + 1}`}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konten Hero untuk Mobile (menggunakan banner yang sama) */}
        <div className="container d-lg-none">
          {banners.length > 0 && (
            <div
              id="heroBannerCarouselMobile"
              className="carousel slide shadow-lg rounded-4"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner rounded-4">
                {banners.map((banner, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                    key={banner.id}
                  >
                    <Link to={banner.linkUrl}>
                      <div className="mobile-hero-card">
                        <img
                          src={`${banner.imageUrl}`}
                          className="mobile-hero-card-img"
                          alt={`Banner ${index + 1}`}
                        />
                        <div className="mobile-hero-card-overlay">
                          <h5 className="fw-bold">Solusi Perawatan Sepatu</h5>
                          <p className="small">
                            Temukan layanan terbaik hanya untukmu!
                          </p>
                          <span className="btn btn-light btn-sm mt-2">
                            Lihat Promo
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================= */}
      {/* === BAGIAN BARU: Kategori Layanan === */}
      {/* ======================================================= */}
      <section className="service-categories-section container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="section-title">Kategori Layanan</h2>
          <Link to="/store" className="view-all-link">
            Lihat semua
          </Link>
        </div>
        <div className="category-grid">
          {serviceCategories.map((category) => (
            <Link
              to={category.link}
              key={category.name}
              className="category-card"
            >
              <div className="category-icon">
                <i className={`fas ${category.icon}`}></i>
              </div>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================= */}
      {/* === Rekomendasi & Toko Populer (Struktur tetap sama) === */}
      {/* ======================================================= */}
      {recommendedStores.length > 0 && (
        <section className="recommended-stores py-5">
          <div className="container">
            <div className="text-center mb-5 section-header">
              <h2 className="fw-bold">Rekomendasi Untuk Anda</h2>
              <p className="text-muted">
                Berdasarkan pesanan Anda sebelumnya, mungkin Anda akan menyukai
                ini.
              </p>
            </div>
            <div className="row g-4">
              {recommendedStores.map((store) => (
                <div className="col-lg-4 col-md-6" key={store.id}>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="featured-stores py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title">Toko Populer</h2>
            <Link to="/store" className="view-all-link">
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredStores.map((store) => (
                <div className="col-lg-4 col-md-6" key={store.id}>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/store" className="btn btn-outline-dark btn-lg">
              Lihat Semua Toko
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
