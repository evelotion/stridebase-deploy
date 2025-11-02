// File: client/src/pages/HomePage.jsx (Dengan Perbaikan Layout & Animasi)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";
import GlobalAnnouncement from "../components/GlobalAnnouncement";
import { Fade } from "react-awesome-reveal";
import "./HomePageModern.css";

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
  homePageTheme = "classic",
}) => {
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true);
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
          fetch(`${API_BASE_URL}/api/public/banners`),
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

  const renderClassicHomepage = () => (
    <>
      <section className="hero-section text-center text-lg-start">
        <div className="container d-none d-lg-block">
          <div className="row align-items-center">
            {/* === INI DIV YANG DIPERBAIKI === */}
            <div className="col-lg-6">
              <Fade direction="left" triggerOnce>
                <div className="hero-content">
                  <h1 className="display-4 fw-bold mb-4">
                    Merawat lebih dari <br />
                    <span className="hero-highlight">
                      Sekedar Membersihkan.
                    </span>
                  </h1>
                  <p className="lead text-muted mb-4">
                    Karena setiap detail layak dirawat sepenuh hati.
                  </p>
                  <Link
                    to="/store"
                    className="btn btn-primary btn-lg px-4 shadow-sm"
                  >
                    Cari Toko Sekarang{" "}
                    <i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                </div>
              </Fade>
            </div>
            {/* === AKHIR DARI DIV PERBAIKAN === */}
            <div className="col-lg-6 mt-4 mt-lg-0">
              <Fade direction="right" triggerOnce>
                {banners.length > 0 && (
                  <div
                    id="heroBannerCarousel"
                    className="carousel slide shadow-lg rounded-4"
                    data-bs-ride="carousel"
                  >
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
              </Fade>
            </div>
          </div>
        </div>

        {/* --- BANNER UNTUK MOBILE (DI LUAR GRID DESKTOP) --- */}
        <div className="container d-lg-none mt-3">
          {banners.length > 0 && (
            <div
              id="heroBannerCarouselMobile"
              className="carousel slide shadow rounded-3"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner rounded-3">
                {banners.map((banner, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
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
      </section>

      <section className="service-categories-section container">
        <Fade direction="up" triggerOnce>
          <div className="d-flex justify-content-between justify-content-lg-center align-items-center mb-3">
            <h2 className="section-title">Kategori Layanan</h2>
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
        </Fade>
      </section>

      <section className="featured-stores py-5 bg-light">
        <div className="container">
          <Fade direction="up" triggerOnce>
            <div className="d-flex justify-content-between justify-content-lg-center align-items-center mb-3">
              <h2 className="section-title">Toko Populer</h2>
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
          </Fade>
        </div>
      </section>
    </>
  );

const renderModernHomepage = () => (
  // Pembungkus utama untuk tema modern
  <div className="home-modern-wrapper">
    {/* ==============================================
        HERO SECTION - REVISI (Split Layout)
        ==============================================
    */}
    <section className="hero-section modern-hero">
      <div className="container modern-hero-content">
        <div className="row align-items-center">
          
          {/* Kolom Teks (Kiri) */}
          <div className="col-lg-6 modern-hero-text-wrapper">
            <Fade direction="down" triggerOnce>
              <h1 className="modern-hero-title">
                Perawatan Sepatu Profesional, <br />
                Hasil Istimewa.
              </h1>
              <p className="modern-hero-subtitle">
                Temukan, pesan, dan lacak layanan cuci sepatu terbaik di
                dekat Anda. Kualitas dan kemudahan di ujung jari Anda.
              </p>
              <div className="modern-hero-buttons">
                <Link to="/store" className="btn btn-modern-primary btn-lg">
                  Temukan Layanan
                </Link>
                {/* Anda bisa mengaktifkan tombol lacak jika perlu */}
                <Link to="/track" className="btn btn-modern-secondary btn-lg">
                  Lacak Pesanan
                </Link>
              </div>
            </Fade>
          </div>

          {/* Kolom Gambar (Kanan) */}
          <div className="col-lg-6 modern-hero-image-wrapper">
            <Fade direction="up" triggerOnce>
              
              <div 
                id="heroModernImageCarousel" 
                className="carousel slide carousel-fade" // 'carousel-fade' adalah kuncinya
                data-bs-ride="carousel" 
                data-bs-interval="4000" // Ganti gambar setiap 4 detik
              >
                <div className="carousel-inner">
                  {banners.length > 0 ? (
                    banners.map((banner, index) => (
                      <div 
                        className={`carousel-item ${index === 0 ? 'active' : ''}`} 
                        key={banner.id}
                      >
                        <img 
                          src={banner.imageUrl} 
                          className="modern-hero-image" // Pakai class yang sudah ada
                          alt={`Banner ${index + 1}`} 
                        />
                      </div>
                    ))
                  ) : (
                    // Fallback jika tidak ada banner
                    <div className="carousel-item active">
                      <img 
                        src="/images/default-hero.png" // Ganti dengan gambar fallback Anda
                        className="modern-hero-image" 
                        alt="Perawatan Sepatu Profesional"
                      />
                    </div>
                  )}
                </div>

                {/* Indikator (tombol bulat kecil di bawah) */}
                <div className="carousel-indicators modern-hero-indicators">
                  {banners.map((_, index) => (
                    <button
                      type="button"
                      data-bs-target="#heroModernImageCarousel"
                      data-bs-slide-to={index}
                      className={index === 0 ? "active" : ""}
                      aria-current={index === 0 ? "true" : "false"}
                      aria-label={`Slide ${index + 1}`}
                      key={`indicator-${index}`}
                    ></button>
                  ))}
                </div>

              </div>

            </Fade>
          </div>

        </div>
      </div>
    </section>

    {/* ==============================================
        BRAND MARQUEE (Dari Langkah 1)
        ==============================================
    */}
    <section className="brand-marquee-section">
      <div className="marquee-wrapper" style={{ '--logo-count': 5 }}>
        <div className="marquee-content">
          {/* Kita perlu menduplikasi list logo agar animasinya terlihat seamless.
              Ganti /path/to/logo-X.png dengan path logo Anda (misal: /images/logos/citrus.png)
            */}

          {/* List Logo Asli */}
          <img src="/images/logos/brand-1.png" alt="Brand 1" className="brand-logo" />
          <img src="/images/logos/brand-2.png" alt="Brand 2" className="brand-logo" />
          <img src="/images/logos/brand-3.png" alt="Brand 3" className="brand-logo" />
          <img src="/images/logos/brand-4.png" alt="Brand 4" className="brand-logo" />
          <img src="/images/logos/brand-5.png" alt="Brand 5" className="brand-logo" />

          {/* List Logo Duplikat (untuk animasi) */}
          <img src="/images/logos/brand-1.png" alt="Brand 1" className="brand-logo" />
          <img src="/images/logos/brand-2.png" alt="Brand 2" className="brand-logo" />
          <img src="/images/logos/brand-3.png" alt="Brand 3" className="brand-logo" />
          <img src="/images/logos/brand-4.png" alt="Brand 4" className="brand-logo" />
          <img src="/images/logos/brand-5.png" alt="Brand 5" className="brand-logo" />
        </div>
      </div>
    </section>

    {/* ==============================================
        BAGIAN KATEGORI LAYANAN
        ==============================================
    */}
    <section className="hm-services py-5">
      <div className="container">
        <Fade direction="up" triggerOnce>
          <div className="text-center mb-5">
            <h2 className="hm-section-title">Layanan Komprehensif</h2>
            <p className="hm-section-subtitle">
              Dari pembersihan cepat hingga restorasi mendetail.
            </p>
          </div>
          <div className="hm-services-grid">
            {serviceCategories.map((category) => (
              <Link
                to={category.link}
                key={category.name}
                className="hm-service-card"
              >
                <div className="hm-service-icon">
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h5 className="hm-service-name">{category.name}</h5>
              </Link>
            ))}
          </div>
        </Fade>
      </div>
    </section>

    {/* ==============================================
        BAGIAN TOKO POPULER
        ==============================================
    */}
    <section className="hm-featured-stores py-5">
      <div className="container">
        <Fade direction="up" triggerOnce>
          <div className="text-center mb-5">
            <h2 className="hm-section-title">Mitra Terpercaya Kami</h2>
            <p className="hm-section-subtitle">
              Dipilih berdasarkan kualitas dan ulasan terbaik.
            </p>
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
                  {/* Komponen StoreCard Anda akan digunakan di sini */}
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          )}
        </Fade>
      </div>
    </section>
  </div>
);
  
  return (
    <div className="homepage-mobile-container">
      {/* Header Mobile (Tetap Sama) */}
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
                    {user.role === "developer" && (
                      <li>
                        <Link
                          to="/developer/dashboard"
                          className="dropdown-item"
                        >
                          <i className="fas fa-crown fa-fw me-2"></i>SuperUser
                          Panel
                        </Link>
                      </li>
                    )}
                    {user.role === "admin" && (
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item">
                          <i className="fas fa-user-shield fa-fw me-2"></i>Panel
                          Admin
                        </Link>
                      </li>
                    )}
                    {user.role === "mitra" && (
                      <li>
                        <Link to="/partner/dashboard" className="dropdown-item">
                          <i className="fas fa-store fa-fw me-2"></i>Panel Toko
                          Saya
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to="/dashboard" className="dropdown-item">
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

      {/* Konten Utama */}
      <div className="d-none d-lg-block">
        {homePageTheme === "modern"
          ? renderModernHomepage()
          : renderClassicHomepage()}
      </div>

      {/* Konten Mobile (selalu classic) */}
      <div className="d-lg-none">{renderClassicHomepage()}</div>
    </div>
  );
};

export default HomePage;
