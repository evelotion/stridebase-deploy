// File: client/src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";
import GlobalAnnouncement from "../components/GlobalAnnouncement";
// PERBAIKAN: Import Slide dan Zoom ditambahkan di sini
import { Fade, Slide, Zoom } from "react-awesome-reveal";
import "./HomePageModern.css";
import "./HomePageElevate.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Impor CSS Swiper
import "swiper/css";
import "swiper/css/navigation";

const serviceCategories = [
  {
    name: "Cuci Cepat",
    icon: "fa-rocket",
    link: "/store?services=Fast+Clean",
    description: "Pembersihan instan untuk kesibukan Anda.",
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2525&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2564&auto=format&fit=crop",
  },
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
    const branding = theme?.branding || {};
    const sideBannerUrl =
      branding.modernHeroSideBannerUrl ||
      "https://images.unsplash.com/photo-1590740618063-27c5952f5ef6?q=80&w=2670&auto=format&fit=crop";
    const sideBannerLink = branding.modernHeroSideBannerLink || "/store";
    const heroSecondaryImageUrl = branding.heroSecondaryImage;
    const heroSecondaryBgUrl = branding.heroSecondaryBgImage;
    const modernHeroSectionBgUrl = branding.modernHeroSectionBgUrl;
    const finalInfoImageUrl =
      heroSecondaryImageUrl ||
      "https://images.unsplash.com/photo-1605412899338-88682b09bAC4?q=80&w=2574&auto=format&fit=crop";

    return (
      <div className="home-modern-wrapper">
        <div
          className="hm-hero-background-wrapper"
          style={{
            backgroundImage: modernHeroSectionBgUrl
              ? `url(${modernHeroSectionBgUrl})`
              : "none",
          }}
        >
          <section className="hero-section modern-split-banners">
            <div className="container">
              <div className="row g-4">
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

              <div className="hm-services-slider d-none d-lg-block">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={30}
                  slidesPerView={3.5}
                  navigation
                  loop={true}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
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

        <section className="hm-info-section">
          <div className="container">
            <div
              className="hm-info-card-pink"
              style={{
                backgroundImage: heroSecondaryBgUrl
                  ? `url(${heroSecondaryBgUrl})`
                  : "none",
              }}
            >
              <div className="row g-5 align-items-center">
                <div className="col-lg-6">
                  <Fade direction="left" triggerOnce>
                    <img
                      src={finalInfoImageUrl}
                      alt="Perawatan Sepatu Profesional"
                      className="img-fluid hm-info-image"
                    />
                  </Fade>
                </div>
                <div className="col-lg-6">
                  <Fade direction="right" triggerOnce>
                    <div className="hm-info-content">
                      <h2 className="hm-info-title-white-glow">
                        Teknologi Canggih, <br />
                        Hasil Maksimal.
                      </h2>
                      <p className="hm-info-text-white">
                        Kami tidak hanya membersihkan, kami merawat. Dengan
                        menggunakan peralatan modern dan formula pembersih
                        premium yang aman, kami memastikan setiap pasang sepatu
                        kembali dalam kondisi terbaiknya.
                      </p>
                      <Link
                        to="/about"
                        className="btn btn-modern-white-pink-text btn-lg"
                      >
                        Tentang Kami
                      </Link>
                    </div>
                  </Fade>
                </div>
              </div>
            </div>
          </div>
        </section>

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

const renderElevateHomepage = () => {
    // Data Services sesuai PDF
    const v3Services = [
      { title: "Unyellowing", icon: "fa-sun", desc: "Mengembalikan warna sol sepatu yang menguning menjadi putih kembali." },
      { title: "Deep Cleaning", icon: "fa-hands-wash", desc: "Pembersihan mendalam untuk semua material (Canvas, Suede, Leather)." },
      { title: "Repaint", icon: "fa-paint-brush", desc: "Pewarnaan ulang sepatu pudar agar terlihat baru dan segar." },
      { title: "Repair", icon: "fa-hammer", desc: "Perbaikan struktural seperti reglue sol dan jahitan." }
    ];

    return (
      <div className="home-elevate-wrapper">
        
        {/* 1. HERO SECTION (LAYOUT KIRI + GAMBAR FULL) */}
        <section className="he-hero-section">
          
          {/* A. CAROUSEL IMAGE (BACKGROUND) */}
          <div id="elevateCarousel" className="carousel slide carousel-fade he-full-bleed-carousel" data-bs-ride="carousel" data-bs-interval="6000">
            <div className="carousel-indicators he-custom-indicators">
              {banners.map((_, index) => (
                <button
                  type="button"
                  data-bs-target="#elevateCarousel"
                  data-bs-slide-to={index}
                  className={`he-indicator-dot ${index === 0 ? "active" : ""}`}
                  key={index}
                  aria-current={index === 0 ? "true" : "false"}
                ></button>
              ))}
            </div>

            <div className="carousel-inner h-100">
              {banners.length > 0 ? banners.map((b, i) => (
                <div className={`carousel-item h-100 ${i===0?'active':''}`} key={b.id}>
                  <img src={b.imageUrl} className="he-hero-img" alt="Hero" />
                </div>
              )) : (
                <div className="carousel-item active h-100">
                  <img src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1920" className="he-hero-img" alt="Hero Default" />
                </div>
              )}
            </div>
          </div>

          {/* B. GRADIENT OVERLAY (Supaya teks kiri terbaca) */}
          <div className="he-hero-overlay-gradient"></div>

          {/* C. TEXT CONTENT (RATA KIRI) */}
          <div className="he-hero-content-left">
             <div className="he-hero-text-box">
                <Fade direction="up" cascade damping={0.1} triggerOnce>
                  {/* Badge */}
                  <div className="he-hero-badge-pill">
                    <span className="he-badge-dot"></span> 
                    StrideBase Premium V3
                  </div>

                  {/* Headline Besar */}
                  <h1 className="he-hero-headline">
                    Choose shops that <br/>
                    <span className="text-highlight filled">match your style</span> <br/>
                    and budget.
                  </h1>

                  {/* Deskripsi dengan garis tepi */}
                  <p className="he-hero-desc">
                    Platform perawatan sepatu #1 di Jakarta. Temukan artisan terbaik untuk restorasi, unyellowing, dan deep cleaning dalam satu aplikasi.
                  </p>

                  {/* Tombol Aksi */}
                  <div className="he-hero-actions">
                    <Link to="/store" className="he-btn-primary-glow">
                       Find Store Now
                    </Link>
                    <Link to="/about" className="he-btn-glass">
                       <i className="fas fa-play-circle"></i> Watch Video
                    </Link>
                  </div>

                  {/* Social Proof (Elaborasi Tambahan) */}
                  <div className="he-social-proof">
                     <div className="he-avatars">
                        <img src="https://i.pravatar.cc/150?img=12" alt="User" className="he-avatar-stack"/>
                        <img src="https://i.pravatar.cc/150?img=33" alt="User" className="he-avatar-stack"/>
                        <img src="https://i.pravatar.cc/150?img=59" alt="User" className="he-avatar-stack"/>
                        <div className="he-avatar-stack bg-dark text-white d-flex align-items-center justify-content-center small border-0" style={{fontSize:'0.7rem'}}>+2k</div>
                     </div>
                     <div className="he-proof-text">
                        Trusted by <strong>2,500+</strong> Sneakerheads <br/>
                        <span className="text-warning"><i className="fas fa-star"></i> 4.9/5.0 Rating</span>
                     </div>
                  </div>
                </Fade>
             </div>
          </div>
        </section>

        {/* 2. BRAND MARQUEE */}
        <section className="he-brand-section">
          <div className="he-trust-track-wrapper overflow-hidden">
             <marquee scrollamount="12" className="w-100 d-flex align-items-center">
               <span className="he-brand-text">ADIDAS</span>
               <span className="he-brand-text">NIKE</span>
               <span className="he-brand-text">SKECHERS</span>
               <span className="he-brand-text">PUMA</span>
               <span className="he-brand-text">CONVERSE</span>
               <span className="he-brand-text">VANS</span>
               <span className="he-brand-text">NEW BALANCE</span>
               <span className="he-brand-text">REEBOK</span>
             </marquee>
          </div>
        </section>

        {/* 3. POPULAR STORES */}
        <section className="he-popular-section">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end he-section-header">
              <Fade triggerOnce>
                <div>
                  <span className="he-section-label">Recommended</span>
                  <h2 className="he-section-title">Popular Stores in <span style={{color: 'var(--sb-accent)'}}>JAKARTA TIMUR</span></h2>
                </div>
              </Fade>
              <Link to="/store" className="btn btn-outline-light rounded-pill px-4 d-none d-md-block">
                View All <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>

            <div className="row g-4">
              {(featuredStores.length > 0 ? featuredStores.slice(0, 4) : [1,2,3,4]).map((store, i) => (
                <div className="col-lg-3 col-md-6" key={store.id || i}>
                   <Fade direction="up" delay={i * 100} triggerOnce>
                     {typeof store === 'object' ? (
                       <Link to={`/store/${store.id}`} className="he-store-card">
                         <div className="he-store-img-box">
                           <img 
                              src={store.image_url || (store.storeImages && store.storeImages[0]) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"} 
                              alt={store.store_name} 
                           />
                           <div className="he-store-info-overlay">
                              <h3 className="he-store-name">{store.store_name}</h3>
                              <div className="he-store-loc">
                                <i className="fas fa-map-marker-alt text-primary"></i>
                                <span>{store.city || "Jakarta Timur"}</span>
                              </div>
                              <div className="he-store-badges">
                                <span className="he-badge-pill">
                                  <i className="fas fa-star text-warning me-1"></i> {store.rating || "4.9"}
                                </span>
                                <span className="he-badge-pill">
                                  {store.serviceCount || "11"} Layanan
                                </span>
                              </div>
                           </div>
                         </div>
                       </Link>
                     ) : (
                       <div className="he-store-card">
                          <div className="he-store-img-box">
                            <img src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80" alt="Store" />
                            <div className="he-store-info-overlay">
                              <h3 className="he-store-name">KICK RID Jakarta</h3>
                              <div className="he-store-loc"><i className="fas fa-map-marker-alt text-primary"></i> Condet Raya, Jaktim</div>
                              <div className="he-store-badges">
                                <span className="he-badge-pill">011 Layanan</span>
                              </div>
                            </div>
                          </div>
                       </div>
                     )}
                   </Fade>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. QUOTE SECTION */}
        <section className="he-quote-section">
          <div className="he-quote-bg"></div>
          <div className="container he-quote-content">
            <Fade direction="up" triggerOnce>
              <i className="fas fa-quote-left he-quote-icon"></i>
              <h2 className="he-quote-text">
                "Quality is not an act,<br /> it is a habit."
              </h2>
              <p className="he-quote-author">— Aristotle, Greek Philosopher</p>
            </Fade>
          </div>
        </section>

        {/* 5. SERVICES */}
        <section className="he-services-section">
          <div className="he-orb he-orb-1"></div>
          <div className="he-orb he-orb-2"></div>
          
          <div className="container position-relative">
            <div className="text-center mb-5">
              <Fade direction="down" triggerOnce>
                <span className="he-section-label">Expertise</span>
                <h2 className="he-section-title">Layanan <br/>KOMPREHENSIF</h2>
              </Fade>
            </div>

            <div className="row g-4">
              {v3Services.map((srv, i) => (
                <div className="col-md-3" key={i}>
                  <Fade direction="up" delay={i * 100} triggerOnce className="h-100">
                    <div className="he-srv-card">
                       <div className="he-srv-icon-box">
                         <i className={`fas ${srv.icon}`}></i>
                       </div>
                       <h4 className="he-srv-title">{srv.title}</h4>
                       <p className="he-srv-desc">{srv.desc}</p>
                    </div>
                  </Fade>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. TECH SECTION */}
        <section className="he-tech-section">
          <div className="container">
             <div className="he-tech-wrapper">
                <div className="order-2 order-lg-1">
                   <Slide direction="left" triggerOnce>
                      <span className="he-section-label">Innovation</span>
                      <h2 className="he-tech-head">Teknologi Canggih,<br/>Hasil Maksimal.</h2>
                      <p className="he-tech-desc">
                        Kami menggunakan peralatan modern dan formula pembersih premium yang aman.
                      </p>
                      <ul className="list-unstyled he-tech-list">
                         <li><i className="fas fa-check-circle"></i> UV Sterilization</li>
                         <li><i className="fas fa-check-circle"></i> Premium Saphir Chemicals</li>
                      </ul>
                      <Link to="/about" className="he-btn-outline mt-4">
                        Discover Tech
                      </Link>
                   </Slide>
                </div>
                <div className="he-tech-visual order-1 order-lg-2">
                   <Slide direction="right" triggerOnce>
                      <img 
                        src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000&auto=format&fit=crop" 
                        alt="Technology" 
                      />
                   </Slide>
                </div>
             </div>
          </div>
        </section>

      </div>
    );
  };

  return (
    <div className="homepage-mobile-container">
      {/* Header Mobile */}
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

      {/* Konten Utama (Desktop) */}
      <div className="d-none d-lg-block">
        {homePageTheme === "modern"
          ? renderModernHomepage()
          : homePageTheme === "elevate"
          ? renderElevateHomepage()
          : renderClassicHomepage()}
      </div>
      {/* Konten Mobile (selalu classic) */}
      <div className="d-lg-none">{renderClassicHomepage()}</div>
    </div>
  );
};

export default HomePage;
