import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StoreCard from "../components/StoreCard";

// Definisikan tipe untuk data yang akan kita gunakan
interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  servicesAvailable: number;
  images: string[];
}

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
}

const HomePage = () => {
  // Terapkan tipe data pada state
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const [storesRes, bannersRes] = await Promise.all([
          fetch("/api/stores"),
          fetch("/api/banners"),
        ]);

        if (!storesRes.ok || !bannersRes.ok) {
          throw new Error("Gagal mengambil data untuk homepage.");
        }

        // Beri tahu TypeScript bentuk data yang diharapkan dari JSON
        const storesData = (await storesRes.json()) as Store[];
        const bannersData = (await bannersRes.json()) as Banner[];

        setFeaturedStores(storesData.slice(0, 3));
        setBanners(bannersData);
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
      <section className="hero-section text-center text-lg-start pt-5 pb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Solusi Perawatan Sepatu, <br />
                <span className="text-primary">Tepat di Ujung Jari Anda.</span>
              </h1>
              <p className="lead text-muted mb-4">
                Temukan jasa cuci sepatu profesional terdekat, bandingkan
                layanan, dan booking dengan mudah melalui StrideBase.
              </p>
              <Link to="/store" className="btn btn-primary btn-lg px-4">
                Cari Toko Sekarang
              </Link>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              {banners.length > 0 && (
                <div
                  id="heroBannerCarousel"
                  className="carousel slide shadow-lg rounded-3"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner rounded-3">
                    {banners.map((banner, index) => (
                      <div
                        className={`carousel-item ${
                          index === 0 ? "active" : ""
                        }`}
                        key={banner.id}
                      >
                        <Link to={banner.linkUrl}>
                          <img
                            src={`http://localhost:5000${banner.imageUrl}`}
                            className="d-block w-100"
                            alt={`Banner ${index + 1}`}
                            style={{ height: "350px", objectFit: "cover" }}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#heroBannerCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#heroBannerCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="featured-stores py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
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
                  {/* Di sini, TypeScript akan memastikan 'store' yang dikirim ke StoreCard sesuai dengan tipenya */}
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/store" className="btn btn-outline-dark">
              Lihat Semua Toko
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
