import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StoreCard from "../components/StoreCard";
import API_BASE_URL from "../apiConfig";

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
        setFeaturedStores(sortedStores.slice(0, 4));
        setBanners(bannersData);

        if (recommendationsRes && recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendedStores(recommendationsData.slice(0, 4));
        }
      } catch (error) {
        // <<== PERBAIKAN DI SINI: Kurung kurawal ditambahkan
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  return (
    <>
      {/* --- SECTION HERO BARU (DESKTOP & MOBILE) --- */}
      <section className="hero-section-v2">
        <div className="container">
          <div className="hero-content-v2 text-center text-lg-start">
            <h1 className="display-4 fw-bold mb-3">
              Perawatan Sepatu Profesional.
            </h1>
            <p className="lead text-muted mb-4">
              Temukan & Pesan Layanan Terbaik di Dekat Anda.
            </p>
            <Link to="/store" className="btn btn-primary btn-lg px-4 shadow-sm">
              Cari Toko Sekarang <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CARD CAROUSEL BARU --- */}
      {banners.length > 0 && (
        <section className="promo-carousel-section">
          <div className="container">
            <div id="promoCardCarousel" className="carousel slide">
              <div className="carousel-inner">
                {banners.map((banner, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                    key={banner.id}
                  >
                    <Link to={banner.linkUrl} className="promo-card-link">
                      <img
                        src={`${banner.imageUrl}`}
                        alt={`Promo ${index + 1}`}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- REKOMENDASI & TOKO POPULER --- */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {recommendedStores.length > 0 && (
            <section className="stores-section">
              <div className="container">
                <div className="section-header-mobile">
                  <h2 className="section-title-mobile">
                    Rekomendasi Untuk Anda
                  </h2>
                  <Link to="/store" className="section-link-mobile">
                    Lihat Semua
                  </Link>
                </div>
                <div className="row g-3">
                  {recommendedStores.map((store) => (
                    <div className="col-6 col-md-4 col-lg-3" key={store.id}>
                      <StoreCard store={store} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="stores-section bg-light">
            <div className="container">
              <div className="section-header-mobile">
                <h2 className="section-title-mobile">Toko Populer</h2>
                <Link to="/store" className="section-link-mobile">
                  Lihat Semua
                </Link>
              </div>
              <div className="row g-3">
                {featuredStores.map((store) => (
                  <div className="col-6 col-md-4 col-lg-3" key={store.id}>
                    <StoreCard store={store} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default HomePage;
