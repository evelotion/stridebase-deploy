// File: client/src/pages/HomePage.jsx

import React, { useState, useEffect, useMemo } from "react"; // Tambahkan useMemo
import { Link, useNavigate } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";
import GlobalAnnouncement from "../components/GlobalAnnouncement";
import { Fade, Slide, Zoom } from "react-awesome-reveal";
import "./HomePageElevate.css";

// Import Swiper & Modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Carousel } from "bootstrap";

// --- HELPER: COUNTDOWN TIMER ---
const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate, targetDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
  if (countDown < 0) {
    return [0, 0, 0, 0];
  }
  // Hitung hari, jam, menit, detik
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

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
  const [featuredStores, setFeaturedStores] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendedStores, setRecommendedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true);

  const navigate = useNavigate();

  // 1. Fetch Data Umum Homepage
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

  // 2. Fetch Promo Dinamis
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/promos`);
        const data = await res.json();
        if (res.ok) {
          // Filter hanya promo aktif yang belum kadaluarsa
          const activePromos = data.filter((p) => {
            if (p.status !== "active") return false;
            if (p.endDate && new Date(p.endDate) < new Date()) return false;
            return true;
          });
          setPromos(activePromos);
        }
      } catch (err) {
        console.error("Gagal ambil promo", err);
      }
    };
    fetchPromos();
  }, []);

  // 3. Fetch Active Order
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!user || user.role === "admin" || user.role === "developer") return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/bookings/active/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveOrder(data);
        }
      } catch (err) {
        console.error("Gagal ambil active order", err);
      }
    };
    fetchActiveOrder();
  }, [user]);

  // --- LOGIC PEMILIHAN PROMO UTAMA (FEATURED) ---
  const featuredPromo = useMemo(() => {
    if (promos.length === 0) return null;
    // Prioritaskan promo dengan nilai diskon terbesar atau yang akan segera berakhir
    return promos.reduce((prev, current) =>
      (prev.value || 0) > (current.value || 0) ? prev : current
    );
  }, [promos]);

  // Hook Countdown untuk Promo Utama
  const [days, hours, minutes, seconds] = useCountdown(
    featuredPromo?.endDate || null
  );

  // --- INISIALISASI CAROUSEL ---
  useEffect(() => {
   if (banners.length > 1) {
      const carouselElement = document.getElementById("elevateCarousel");
      if (carouselElement) {
        new Carousel(carouselElement, {
          interval: 5000,
          ride: "carousel",
          pause: false,
          wrap: true,
        });
      }
    }
  }, [banners]);

  // ... (Fungsi renderClassicHomepage & renderModernHomepage SAMA SEPERTI SEBELUMNYA - DILEWATI AGAR SINGKAT) ...
  const renderClassicHomepage = () => <></>; // Placeholder agar tidak error, kode asli tetap ada
  const renderModernHomepage = () => <></>; // Placeholder

  // --- 3. RENDER DESKTOP ELEVATE (DIPERBARUI DINAMIS) ---
  const renderElevateHomepage = () => {
    const v3Services = [
      {
        title: "Unyellowing",
        icon: "fa-sun",
        desc: "Mengembalikan warna sol sepatu yang menguning menjadi putih kembali.",
      },
      {
        title: "Deep Cleaning",
        icon: "fa-hands-wash",
        desc: "Pembersihan mendalam untuk semua material (Canvas, Suede, Leather).",
      },
      {
        title: "Repaint",
        icon: "fa-paint-brush",
        desc: "Pewarnaan ulang sepatu pudar agar terlihat baru dan segar.",
      },
      {
        title: "Repair",
        icon: "fa-hammer",
        desc: "Perbaikan struktural seperti reglue sol dan jahitan.",
      },
    ];

    return (
      <div className="home-elevate-wrapper">
        {/* HERO SECTION (Sama) */}
        <section className="he-hero-section">
          <div
            id="elevateCarousel"
            className="carousel slide carousel-fade he-full-bleed-carousel"
            data-bs-ride="carousel"
            data-bs-interval="5000"
          >
            <div className="carousel-indicators he-custom-indicators">
              {banners.length > 0 &&
                banners.map((_, index) => (
                  <button
                    type="button"
                    data-bs-target="#elevateCarousel"
                    data-bs-slide-to={index}
                    className={`he-indicator-dot ${
                      index === 0 ? "active" : ""
                    }`}
                    key={index}
                  ></button>
                ))}
            </div>
            <div className="carousel-inner h-100">
              {banners.length > 0 ? (
                banners.map((b, i) => (
                  <div
                    className={`carousel-item h-100 ${i === 0 ? "active" : ""}`}
                    key={b.id}
                  >
                    <img
                      src={b.imageUrl}
                      className="he-hero-img"
                      alt="Hero Banner"
                    />
                  </div>
                ))
              ) : (
                <div className="carousel-item active h-100">
                  <img
                    src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1920"
                    className="he-hero-img"
                    alt="Hero Default"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="he-hero-overlay-gradient"></div>
          <div className="he-hero-content-left">
            <div className="he-hero-text-box">
              <Fade direction="up" cascade damping={0.2} triggerOnce>
                <h1 className="he-hero-headline">
                  Choose shops that <br />
                  <span className="text-highlight">match your style</span>{" "}
                  <br />
                  and budget.
                </h1>
                <div className="he-hero-actions">
                  <Link to="/store" className="he-btn-primary-glow">
                    <i className="fas fa-search"></i> Find Store
                  </Link>
                  <a href="#how-it-works" className="he-btn-glass">
                    How it Works
                  </a>
                </div>
              </Fade>
            </div>
          </div>
        </section>

        {/* BRAND MARQUEE (Sama) */}
        <section className="he-brand-section">
          <div className="he-trust-track-wrapper overflow-hidden">
            <marquee
              scrollamount="10"
              className="w-100 d-flex align-items-center"
            >
              <span className="he-brand-text">ADIDAS</span>
              <span className="he-brand-text">NIKE</span>
              <span className="he-brand-text">SKECHERS</span>
              <span className="he-brand-text">PUMA</span>
              <span className="he-brand-text">CONVERSE</span>
              <span className="he-brand-text">VANS</span>
            </marquee>
          </div>
        </section>

        {/* POPULAR STORES (Sama) */}
        <section className="he-popular-section">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end he-section-header">
              <Fade triggerOnce>
                <div>
                  <span className="he-section-label">Curated Selection</span>
                  <h2 className="he-section-title">
                    Popular Stores in{" "}
                    <span style={{ color: "var(--sb-accent)" }}>JAKARTA</span>
                  </h2>
                </div>
              </Fade>
              <Link
                to="/store"
                className="btn btn-outline-light rounded-pill px-4 d-none d-md-block fw-bold"
              >
                View All <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
            <div className="row g-4">
              {(featuredStores.length > 0
                ? featuredStores.slice(0, 3)
                : []
              ).map((store, i) => (
                <div className="col-lg-4 col-md-6" key={store.id || i}>
                  <Fade direction="up" delay={i * 100} triggerOnce>
                    <Link
                      to={`/store/${store.id}`}
                      className="he-store-card-wide"
                    >
                      <div className="he-store-top-badge">
                        <i className="fas fa-star"></i>{" "}
                        {store.rating ? store.rating.toFixed(1) : "New"}
                      </div>
                      <img
                        src={
                          store.headerImageUrl ||
                          (store.images && store.images[0]) ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                        }
                        alt={store.name}
                        className="he-store-wide-img"
                      />
                      <div className="he-store-floating-panel">
                        <div className="he-store-info-left">
                          <h3 className="he-store-name-wide text-truncate">
                            {store.name}
                          </h3>
                          <div className="he-store-meta-wide d-flex align-items-start">
                            <i className="fas fa-map-marker-alt mt-1 me-2 flex-shrink-0"></i>
                            <span className="text-truncate">
                              {store.location || "Lokasi tidak tersedia"}
                            </span>
                          </div>
                        </div>
                        <div className="he-store-action-btn flex-shrink-0">
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </div>
                    </Link>
                  </Fade>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES (Sama) */}
        <section className="he-services-section">
          <div className="he-glow-blob he-blob-left"></div>
          <div className="he-glow-blob he-blob-right"></div>
          <div className="container position-relative">
            <div className="text-center mb-5">
              <Fade direction="down" triggerOnce>
                <span className="he-section-label">Our Expertise</span>
                <h2 className="he-section-title">
                  Layanan <br /> KOMPREHENSIF
                </h2>
              </Fade>
            </div>
            <div className="row g-4">
              {v3Services.map((srv, i) => (
                <div className="col-md-3 col-sm-6" key={i}>
                  <Fade
                    direction="up"
                    delay={i * 100}
                    triggerOnce
                    className="h-100"
                  >
                    <div className="he-service-card-premium">
                      <div className="he-service-icon-box">
                        <i className={`fas ${srv.icon}`}></i>
                      </div>
                      <h4 className="he-service-title">{srv.title}</h4>
                      <p className="he-service-desc">{srv.desc}</p>
                      <div className="he-service-arrow">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </div>
                  </Fade>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [UPDATED] PROMO SECTION DINAMIS */}
        {featuredPromo ? (
          <section className="he-promo-section">
            <div className="container">
              <div className="row g-4 align-items-stretch">
                <div className="col-lg-6">
                  <Fade direction="left" triggerOnce className="h-100">
                    <div className="he-promo-card">
                      <div className="he-promo-tag">
                        <i className="fas fa-fire me-2"></i> Special Offer
                      </div>
                      <h2 className="he-promo-big-text">
                        {featuredPromo.discountType === "PERCENTAGE"
                          ? `${featuredPromo.value}% OFF`
                          : `Rp ${(featuredPromo.value / 1000).toLocaleString(
                              "id-ID"
                            )}K OFF`}
                      </h2>
                      <p className="he-promo-sub">
                        {featuredPromo.description ||
                          "Dapatkan diskon spesial untuk layanan pilihan Anda."}
                      </p>
                      <div className="d-flex gap-3 align-items-center">
                        <div
                          className="px-3 py-2 border rounded-3 text-white font-monospace"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            borderColor: "var(--sb-accent)",
                          }}
                        >
                          {featuredPromo.code}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(featuredPromo.code);
                            alert("Kode promo disalin!");
                          }}
                          className="he-btn-primary-glow border-0 py-2 px-4"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  </Fade>
                </div>

                {/* Tampilkan Timer HANYA jika ada End Date */}
                {featuredPromo.endDate && (
                  <div className="col-lg-6">
                    <Fade direction="right" triggerOnce className="h-100">
                      <div
                        className="he-promo-card text-center"
                        style={{ alignItems: "center" }}
                      >
                        <h4
                          className="he-section-label mb-2"
                          style={{ opacity: 0.8 }}
                        >
                          Penawaran Berakhir Dalam
                        </h4>
                        <div className="he-timer-wrap">
                          <div className="he-timer-box">
                            <div className="he-timer-num">
                              {days < 10 ? `0${days}` : days}
                            </div>
                            <div className="he-timer-label">Days</div>
                          </div>
                          <div className="he-timer-sep">:</div>
                          <div className="he-timer-box">
                            <div className="he-timer-num">
                              {hours < 10 ? `0${hours}` : hours}
                            </div>
                            <div className="he-timer-label">Hours</div>
                          </div>
                          <div className="he-timer-sep">:</div>
                          <div className="he-timer-box">
                            <div className="he-timer-num">
                              {minutes < 10 ? `0${minutes}` : minutes}
                            </div>
                            <div className="he-timer-label">Mins</div>
                          </div>
                        </div>
                        <small
                          className="mt-3 d-block"
                          style={{
                            color: "var(--sb-text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          Berlaku hingga{" "}
                          {new Date(featuredPromo.endDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </small>
                      </div>
                    </Fade>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* Fallback jika tidak ada promo aktif */
          <div className="py-5 bg-dark d-none"></div>
        )}

        {/* PROCESS SECTION (Sama) */}
        <section id="how-it-works" className="he-process-section">
          <div className="he-process-blob he-proc-blob-1"></div>
          <div className="he-process-blob he-proc-blob-2"></div>
          <div className="container position-relative">
            <div className="he-process-glass-card">
              <Fade direction="up" triggerOnce>
                <h2 className="he-process-title">How It Works</h2>
              </Fade>
              <div className="row justify-content-center g-5">
                {[
                  {
                    num: "01",
                    title: "Find Store",
                    icon: "fa-search-location",
                    desc: "Cari mitra cuci sepatu terdekat.",
                  },
                  {
                    num: "02",
                    title: "Book & Drop",
                    icon: "fa-calendar-check",
                    desc: "Jadwalkan layanan dan antar sepatu.",
                  },
                  {
                    num: "03",
                    title: "Clean & Fresh",
                    icon: "fa-sparkles",
                    desc: "Tunggu notifikasi sepatu Anda selesai.",
                  },
                ].map((step, i) => (
                  <div className="col-md-4" key={i}>
                    <Fade direction="up" delay={i * 150} triggerOnce>
                      <div className="he-process-card">
                        <span className="he-process-number">{step.num}</span>
                        <div className="he-process-icon">
                          <i className={`fas ${step.icon}`}></i>
                        </div>
                        <h4 className="he-process-step">{step.title}</h4>
                        <p className="he-process-desc">{step.desc}</p>
                      </div>
                    </Fade>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ... (renderMobileElevateHomepage SAMA SEPERTI SEBELUMNYA) ...
  const renderMobileElevateHomepage = () => {
    // Logic Role untuk Tampilan
    const shouldShowWidget =
      user && user.role !== "admin" && user.role !== "developer" && activeOrder;

    return (
      <div className="he-mobile-wrapper">
        {/* HEADER STICKY */}
        <header className="he-mobile-header-sticky">
          <div className="d-flex justify-content-between align-items-center mb-3 he-mobile-greeting">
            <div>
              <small className="d-block mb-1" style={{ opacity: 0.8 }}>
                Lokasi Saat Ini
              </small>
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <i className="fas fa-map-marker-alt text-danger"></i> Jakarta
                Selatan
                <i
                  className="fas fa-chevron-down small opacity-50"
                  style={{ fontSize: "0.8rem" }}
                ></i>
              </h5>
            </div>
            <div className="d-flex gap-2">
              <Link
                to="/notifications"
                className="sb-btn-icon position-relative"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "var(--sb-card-bg)",
                  border: "1px solid var(--sb-card-border)",
                }}
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="sb-notification-badge"></span>
                )}
              </Link>
            </div>
          </div>

          <div
            className="he-mobile-search-box"
            onClick={() => navigate("/store")}
          >
            <i
              className="fas fa-search"
              style={{ color: "var(--sb-accent)" }}
            ></i>
            <span>Mau cuci sepatu apa hari ini?</span>
          </div>
        </header>

        {/* CONTENT SCROLLABLE */}
        <div className="he-mobile-content-scroll pt-1">
          {/* SECTION 0: LIVE ACTIVITY */}
          {shouldShowWidget && (
            <section className="px-3 mb-3">
              <div className="he-mobile-track-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    <i className="fas fa-sync fa-spin me-1"></i>{" "}
                    {activeOrder.status}
                  </span>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    #{activeOrder.displayId || activeOrder.id.slice(0, 8)}
                  </small>
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div className="he-track-icon-box">
                    <i className="fas fa-tshirt"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold fs-6">{activeOrder.service}</h6>
                    <small className="text-muted d-block">
                      {activeOrder.store}
                    </small>
                  </div>
                  <Link
                    to={`/track/${activeOrder.id}`}
                    className="btn btn-sm btn-dark rounded-pill px-3"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Lacak
                  </Link>
                </div>
                <div
                  className="progress mt-3"
                  style={{ height: "4px", backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${activeOrder.progress}%` }}
                  ></div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 1: HERO BANNER */}
          <section className="mb-2">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={12}
              slidesPerView={1.08}
              centeredSlides={true}
             loop={banners.length > 1}
              autoplay={{ delay: 4000 }}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="he-mobile-banner-swiper px-1"
            >
              {banners.length > 0 ? (
                banners.map((b) => (
                  <SwiperSlide key={b.id}>
                    <div className="he-mobile-banner-card">
                      <img src={b.imageUrl} alt={b.title} />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="he-mobile-banner-card">
                    <img
                      src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800"
                      alt="Promo"
                    />
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          </section>

          {/* SECTION 2: SERVICES */}
          <section className="mb-3">
            <h6 className="he-mobile-section-title px-3 mb-2">Layanan Kami</h6>
            <div className="he-mobile-services-grid px-3">
              {serviceCategories.map((cat, idx) => (
                <Link
                  to={cat.link}
                  key={idx}
                  className="he-mobile-service-item-compact"
                >
                  <div className="he-mobile-service-icon-compact">
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                  <span className="he-mobile-service-label-compact">
                    {cat.name}
                  </span>
                </Link>
              ))}
              <Link to="/store" className="he-mobile-service-item-compact">
                <div
                  className="he-mobile-service-icon-compact"
                  style={{
                    background: "var(--sb-bg-tertiary)",
                    borderStyle: "dashed",
                  }}
                >
                  <i className="fas fa-ellipsis-h text-muted"></i>
                </div>
                <span className="he-mobile-service-label-compact">Lainnya</span>
              </Link>
            </div>
          </section>

          {/* SECTION 3: VOUCHER SCROLL */}
          {promos.length > 0 && (
            <section className="mb-3 ps-3">
              <h6 className="he-mobile-section-title mb-3">Voucher Spesial</h6>
              <div className="he-mobile-voucher-scroll pe-3">
                {promos.map((promo, i) => {
                  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
                  const cardColor = colors[i % colors.length];

                  return (
                    <div
                      key={promo.id || i}
                      className="he-mobile-voucher-card"
                      style={{ borderLeft: `4px solid ${cardColor}` }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <div
                            className="he-voucher-code"
                            style={{ letterSpacing: "1px" }}
                          >
                            <i className="fas fa-ticket-alt me-1"></i>{" "}
                            {promo.code}
                          </div>
                          <div className="he-voucher-title">
                            {promo.discountType === "PERCENTAGE"
                              ? `${promo.value}% OFF`
                              : `Rp ${promo.value / 1000}K OFF`}
                          </div>
                          <div
                            className="he-voucher-desc text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            {promo.description || "Potongan Spesial"}
                          </div>
                          <small
                            className="text-muted d-block mt-1"
                            style={{ fontSize: "0.6rem" }}
                          >
                            Min.{" "}
                            {promo.minTransaction
                              ? `blj ${promo.minTransaction / 1000}k`
                              : "0"}
                          </small>
                        </div>
                        <div className="he-voucher-action">
                          <i
                            className="fas fa-plus-circle"
                            style={{ color: cardColor }}
                          ></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 5: POPULAR STORES */}
          <section className="px-3 pb-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="he-mobile-section-title mb-0">Mitra Pilihan</h6>
              <Link
                to="/store"
                className="text-decoration-none small fw-bold"
                style={{ color: "var(--sb-accent)" }}
              >
                Lihat Semua
              </Link>
            </div>
            <div className="d-flex flex-column gap-2">
              {loading ? (
                <p className="text-center text-muted py-4">Memuat toko...</p>
              ) : (
                featuredStores.map((store) => (
                  <Link
                    to={`/store/${store.id}`}
                    key={store.id}
                    className="he-mobile-store-card"
                  >
                    <div className="he-mobile-store-img-wrapper">
                      <img
                        src={
                          store.headerImageUrl ||
                          (store.images && store.images[0]) ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
                        }
                        alt={store.name}
                      />
                      <div className="he-mobile-rating-badge">
                        ★ {store.rating ? store.rating.toFixed(1) : "New"}
                      </div>
                    </div>

                    <div className="he-mobile-store-info">
                      <h6 className="he-mobile-store-name">{store.name}</h6>
                      <div className="he-mobile-store-loc mb-2">
                        <i className="fas fa-map-marker-alt text-danger me-1"></i>
                        <span className="text-truncate">
                          {store.location || "Jakarta"}
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <span
                          className="badge bg-secondary-subtle text-secondary"
                          style={{ fontSize: "0.6rem" }}
                        >
                          Cuci Cepat
                        </span>
                        <span
                          className="badge bg-secondary-subtle text-secondary"
                          style={{ fontSize: "0.6rem" }}
                        >
                          Repair
                        </span>
                      </div>
                    </div>

                    <div className="align-self-center text-muted opacity-50">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div style={{ height: "60px" }}></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="d-lg-none">{renderMobileElevateHomepage()}</div>
      <div className="d-none d-lg-block">
        {homePageTheme === "modern"
          ? renderModernHomepage()
          : homePageTheme === "elevate"
          ? renderElevateHomepage()
          : renderClassicHomepage()}
      </div>
    </>
  );
};

export default HomePage;
