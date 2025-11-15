// File: client/src/pages/HomePage.jsx (LENGKAP dengan MODIFIKASI KARTU PINK)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";
import GlobalAnnouncement from "../components/GlobalAnnouncement";
import { Fade } from "react-awesome-reveal";
import "./HomePageModern.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Impor CSS Swiper
import "swiper/css";
import "swiper/css/navigation";

// Hapus 'import HeroCarousel' karena tidak digunakan di sini
// (Carousel di 'classic' menggunakan Bootstrap bawaan)

const serviceCategories = [
  {
    name: "Cuci Cepat",
    icon: "fa-rocket",
    link: "/store?services=Fast+Clean",
    description: "Pembersihan instan untuk kesibukan Anda.",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=2670&auto=format&fit=crop",
  },
  {
    name: "Perawatan Kulit",
    icon: "fa-gem",
    link: "/store?services=Leather",
    description: "Mengembalikan kilau dan kelembutan bahan kulit.",
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2564&auto=format&fit=crop",
  },
  {
    name: "Suede & Nubuck",
    icon: "fa-leaf",
    link: "/store?services=Suede",
    description: "Perawatan khusus untuk bahan yang sensitif.",
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2525&auto=format&fit=crop",
  },
  {
    name: "Unyellowing",
    icon: "fa-sun",
    link: "/store?services=Unyellowing",
    description: "Solusi untuk sol yang menguning agar kembali putih.",
    imageUrl:
      "https://images.unsplash.com/photo-1552346154-21d32810ABA3?q=80&w=2670&auto=format&fit=crop",
  },
  // Anda bisa tambahkan lebih banyak di sini
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

  const renderModernHomepage = () => {
    // --- PERBAIKAN ERROR: Definisikan 'branding' dengan aman ---
    // Memberikan fallback object kosong jika theme atau theme.branding undefined
    const branding = theme?.branding || {};

    // --- AMBIL SEMUA URL DINAMIS (dari 'branding' yang sudah aman) ---
    const sideBannerUrl =
      branding.modernHeroSideBannerUrl ||
      "https://images.unsplash.com/photo-1590740618063-27c5952f5ef6?q=80&w=2670&auto=format&fit=crop";
    const sideBannerLink = branding.modernHeroSideBannerLink || "/store";

    // Variabel untuk GAMBAR KIRI (kartu pink)
    const heroSecondaryImageUrl = branding.heroSecondaryImage;

    // Variabel untuk BACKGROUND (kartu pink)
    const heroSecondaryBgUrl = branding.heroSecondaryBgImage;

    // --- VARIABEL BARU UNTUK BACKGROUND HERO ATAS ---
    const modernHeroSectionBgUrl = branding.modernHeroSectionBgUrl;

    // Fallback untuk gambar kiri JIKA KOSONG (gambar placeholder lama)
    const finalInfoImageUrl =
      heroSecondaryImageUrl ||
      "https://images.unsplash.com/photo-1605412899338-88682b09bAC4?q=80&w=2574&auto=format&fit=crop";

    return (
      // Pembungkus utama untuk tema modern
      <div className="home-modern-wrapper">
        {/* ==============================================
          PERUBAHAN STRUKTUR DIMULAI DI SINI
          ============================================== 
        */}

        {/* 1. Ini adalah WRAPPER BARU untuk Latar Belakang */}
        <div
          className="hm-hero-background-wrapper"
          style={{
            // 2. Style (gambar) dipindahkan ke wrapper baru ini
            backgroundImage: modernHeroSectionBgUrl
              ? `url(${modernHeroSectionBgUrl})`
              : "none",
          }}
        >
          {/* 3. 'hero-section' sekarang ada di dalam wrapper 
               dan TIDAK memiliki style 'backgroundImage' lagi 
          */}
          <section className="hero-section modern-split-banners">
            <div className="container">
              <div className="row g-4">
                {/* Kolom Kiri: Banner Carousel Utama */}
                <div className="col-lg-8">
                  <Fade direction="left" duration={800} triggerOnce>
                    <div className="modern-main-carousel-wrapper">
                      <div
                        id="modernMainBannerCarousel"
                        className="carousel slide carousel-fade"
                        data-bs-ride="carousel"
                      >
                        <div className="carousel-indicators modern-carousel-indicators">
                          {banners.map((_, index) => (
                            <button
                              type="button"
                              data-bs-target="#modernMainBannerCarousel"
                              data-bs-slide-to={index}
                              className={index === 0 ? "active" : ""}
                              aria-current={index === 0 ? "true" : "false"}
                              aria-label={`Slide ${index + 1}`}
                              key={index}
                            ></button>
                          ))}
                        </div>
                        <div className="carousel-inner">
                          {banners.length > 0 ? (
                            banners.map((banner, index) => (
                              <div
                                className={`carousel-item ${
                                  index === 0 ? "active" : ""
                                }`}
                                key={banner.id}
                              >
                                <Link to={banner.linkUrl || "#"}>
                                  <img
                                    src={banner.imageUrl}
                                    className="d-block w-100 modern-main-banner-image"
                                    alt={banner.title || "Main Banner"}
                                  />
                                </Link>
                              </div>
                            ))
                          ) : (
                            // Fallback jika tidak ada banner
                            <div className="carousel-item active">
                              <img
                                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2612&auto=format&fit=crop"
                                className="d-block w-100 modern-main-banner-image"
                                alt="Sepatu Bersih"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Fade>
                </div>
                {/* Kolom Kanan: Banner Statis Kecil */}
                <div className="col-lg-4">
                  <Fade direction="right" duration={800} triggerOnce>
                    <div className="modern-side-banner-wrapper">
                      <Link to={sideBannerLink}>
                        <img
                          src={sideBannerUrl}
                          alt="Promo Banner"
                          className="img-fluid modern-side-banner-image"
                        />
                        <div className="modern-side-banner-overlay">
                          <h4 className="text-white">Promo Spesial!</h4>
                          <p className="text-white-50">Diskon hingga 30%.</p>
                          <button className="btn btn-sm btn-light mt-2">
                            Lihat
                          </button>
                        </div>
                      </Link>
                    </div>
                  </Fade>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* ==============================================
        BRAND MARQUEE (Interaktif & Animatif)
        ============================================== */}
        <section className="brand-marquee-section">
          <div className="marquee-wrapper">
            <div className="marquee-content">
              <span className="brand-logo-text">Nike</span>
              <span className="brand-logo-text">Adidas</span>
              <span className="brand-logo-text">New Balance</span>
              <span className="brand-logo-text">Puma</span>
              <span className="brand-logo-text">Converse</span>
              <span className="brand-logo-text">Vans</span>
              <span className="brand-logo-text">Nike</span>
              <span className="brand-logo-text">Adidas</span>
              <span className="brand-logo-text">New Balance</span>
              <span className="brand-logo-text">Puma</span>
              <span className="brand-logo-text">Converse</span>
              <span className="brand-logo-text">Vans</span>
            </div>
          </div>
        </section>
        <section
          className="hm-services py-5"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="container">
            <Fade direction="up" triggerOnce>
              <div className="text-center mb-5">
                <h2 className="hm-section-title" style={{ color: "#1a1a1a" }}>
                  Layanan Komprehensif
                </h2>
                <p className="hm-section-subtitle" style={{ color: "#555" }}>
                  Dari pembersihan cepat hingga restorasi mendetail.
                </p>
              </div>

              {/* Versi 1: SLIDER BARU (Hanya tampil di Desktop) */}
              <div className="hm-services-slider d-none d-lg-block">
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={30} // Jarak antar kartu
                  slidesPerView={3.5} // Menampilkan 3 kartu penuh + 1/2 kartu
                  navigation // Menampilkan panah navigasi
                  className="mySwiper"
                >
                  {serviceCategories.map((category) => (
                    <SwiperSlide key={category.name}>
                      <Link to={category.link} className="hm-service-card">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="hm-service-card-image"
                        />
                        <div className="hm-service-card-overlay">
                          <div className="hm-service-card-content">
                            <div className="category-icon mb-3">
                              <i className={`fas ${category.icon}`}></i>
                            </div>
                            <h4 className="hm-service-card-title">
                              {category.name}
                            </h4>
                            <p className="hm-service-card-desc">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Versi 2: GRID LAMA (Hanya tampil di Mobile) */}
              <div className="category-grid d-lg-none">
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
          </div>
        </section>

        {/* ==============================================
        MODIFIKASI: INFO SECTION (Sesuai Gambar)
        ============================================== */}
        <section
          className="hm-info-section"
          // Biarkan CSS yang mengatur (default putih)
        >
          <div className="container">
            {/* KARTU PINK BARU (PEMBUNGKUS) */}
            <div
              className="hm-info-card-pink"
              style={{
                backgroundImage: heroSecondaryBgUrl
                  ? `url(${heroSecondaryBgUrl})`
                  : "none",
              }}
            >
              <div className="row g-5 align-items-center">
                {/* Kolom Kiri: Gambar (Sepatu) */}
                <div className="col-lg-6">
                  <Fade direction="left" triggerOnce>
                    <img
                      // Gambar sepatu (sudah benar)
                      src={finalInfoImageUrl}
                      alt="Perawatan Sepatu Profesional"
                      className="img-fluid hm-info-image"
                    />
                  </Fade>
                </div>

                {/* Kolom Kanan: Teks */}
                <div className="col-lg-6">
                  <Fade direction="right" triggerOnce>
                    <div className="hm-info-content">
                      {/* Judul putih dengan glow */}
                      <h2 className="hm-info-title-white-glow">
                        Teknologi Canggih, <br />
                        Hasil Maksimal.
                      </h2>

                      {/* Teks putih */}
                      <p className="hm-info-text-white">
                        Kami tidak hanya membersihkan, kami merawat. Dengan
                        menggunakan peralatan modern dan formula pembersih
                        premium yang aman, kami memastikan setiap pasang sepatu
                        kembali dalam kondisi terbaiknya.
                      </p>

                      {/* Tombol putih dengan teks pink */}
                      <Link
                        to="/about"
                        className="btn btn-modern-white-pink-text btn-lg"
                      >
                        Tentang Kami
                      </Link>
                    </div>
                  </Fade>
                </div>
              </div>{" "}
              {/* Akhir .row */}
            </div>{" "}
            {/* Akhir .hm-info-card-pink */}
          </div>
        </section>

        {/* ==============================================
        BAGIAN TOKO POPULER (Clean)
        ============================================== */}
        <section
          className="hm-featured-stores py-5"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div className="container">
            <Fade direction="up" triggerOnce>
              <div className="text-center mb-5">
                <h2 className="hm-section-title" style={{ color: "#1a1a1a" }}>
                  Mitra Terpercaya Kami
                </h2>
                <p className="hm-section-subtitle" style={{ color: "#555" }}>
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
                <div className="results-grid-redesigned">
                  {featuredStores.map((store) => (
                    <StoreCard store={store} key={store.id} />
                  ))}
                </div>
              )}
            </Fade>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="homepage-mobile-container">
      {/* Header Mobile (Sudah diperbaiki) */}
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
      </div>{" "}
      {/* <-- Tag penutup yang hilang di versi sebelumnya, sekarang ada */}
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
