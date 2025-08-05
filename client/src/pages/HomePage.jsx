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
            ? fetch(`${API_BASE_URL}/api/user/recommendations`, { headers }) // <-- UBAH JUGA DI SINI
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
    <>
      <section className="hero-section text-center text-lg-start">
        <div className="container">
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
                  {/* Bagian 1: Indikator Lingkaran Ditambahkan di Sini */}
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

                  {/* Bagian 2: Isi Carousel (Tidak Berubah) */}
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
                            className="d-block w-100 hero-banner-img" // Perubahan di sini
                            alt={`Banner ${index + 1}`}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Bagian 3: Tombol Panah Kiri dan Kanan Dihapus */}
                  {/* Kode <button> untuk carousel-control-prev dan carousel-control-next sudah dihapus dari sini */}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
          <div className="text-center mb-5 section-header">
            <h2 className="fw-bold">Toko Populer Pilihan Kami</h2>
            <p className="text-muted">
              Jelajahi beberapa mitra terbaik yang siap melayani Anda.
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
    </>
  );
};

export default HomePage;
