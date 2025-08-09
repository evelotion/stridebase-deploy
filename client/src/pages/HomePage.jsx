import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";

// Kategori Layanan (Data Dummy, bisa Anda kembangkan lebih lanjut)
const serviceCategories = [
  { name: "Cuci Cepat", icon: "fa-rocket", link: "/store?services=Fast+Clean" },
  { name: "Perawatan Kulit", icon: "fa-gem", link: "/store?services=Leather" },
  { name: "Suede", icon: "fa-leaf", link: "/store?services=Suede" },
  { name: "Unyellowing", icon: "fa-sun", link: "/store?services=Unyellowing" },
];

const HomePage = ({
  theme,
  user,
  notifications,
  unreadCount,
  handleLogout,
  isAnnouncementVisible,    // <-- Tambahkan ini
  setAnnouncementVisible, // <-- Tambahkan ini
}) => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendedStores, setRecommendedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        {theme?.featureFlags?.enableGlobalAnnouncement && theme?.globalAnnouncement && (
        <div className="d-lg-none"> {/* Hanya tampil di mobile */}
          <GlobalAnnouncement 
            message={theme.globalAnnouncement} 
            isVisible={isAnnouncementVisible}
            onClose={() => setAnnouncementVisible(false)}
          />
        </div>
      )}
      {/* ======================================================= */}
      {/* === HEADER BARU (MOBILE ONLY) === */}
      {/* ======================================================= */}
      
      <div className="mobile-home-header d-lg-none">
        <div className="top-bar">
          <Link to="/" className="mobile-logo">
            {theme?.branding?.logoUrl ? (
              <img src={theme.branding.logoUrl} alt="Logo" />
            ) : (
              <span>StrideBase</span>
            )}
          </Link>
          <div className="actions">
            {user ? (
              <>
                <div className="dropdown">
                  <button
                    className="btn btn-icon"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end dropdown-menu-custom"
                    style={{ width: "300px" }}
                  >
                    <li className="p-2 border-bottom">
                      <h6 className="mb-0">Notifikasi</h6>
                    </li>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif) => (
                          <li key={notif.id}>
                            <Link
                              to={notif.linkUrl || "#"}
                              className="dropdown-item text-wrap"
                            >
                              <small>{notif.message}</small>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {new Date(notif.createdAt).toLocaleString(
                                  "id-ID"
                                )}
                              </div>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="p-3 text-center text-muted small">
                          Tidak ada notifikasi baru.
                        </li>
                      )}
                    </div>
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <Link
                        to="/notifications"
                        className="dropdown-item text-center small"
                      >
                        Lihat Semua Notifikasi
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="dropdown">
                  <button
                    className="btn btn-icon"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src="/user-avatar-placeholder.png"
                      alt="User"
                      className="user-avatar-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://i.pravatar.cc/40";
                      }}
                    />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom">
                    <li>
                      <Link to="/dashboard" className="dropdown-item">
                        <i className="fas fa-tachometer-alt fa-fw me-2"></i>
                        Dashboard
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
              <Link to="/login" className="btn btn-light btn-sm">
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
        {/* PERUBAHAN DI BAWAH INI */}
        <div className="d-flex justify-content-between justify-content-lg-center align-items-center mb-3">
          <h2 className="section-title">Kategori Layanan</h2>
          {/* Link ini akan disembunyikan di layar besar (lg) dan ke atas */}
          <Link to="/store" className="view-all-link d-lg-none">
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
      {/* === Rekomendasi & Toko Populer === */}
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
    {/* PERUBAHAN DI BAWAH INI */}
    <div className="d-flex justify-content-between justify-content-lg-center align-items-center mb-3">
      <h2 className="section-title">Toko Populer</h2>
      {/* Link ini akan disembunyikan di layar besar (lg) dan ke atas */}
      <Link to="/store" className="view-all-link d-lg-none">
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

          <div className="text-center mt-5 d-none d-lg-block">
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
