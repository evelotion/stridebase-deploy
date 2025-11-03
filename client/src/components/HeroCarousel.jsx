// src/components/HeroCarousel.jsx

import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper modules
import { Autoplay, Pagination } from "swiper/modules";
// Import React Router Link
import { Link } from "react-router-dom";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay"; // Pastikan ini diimpor untuk autoplay

// Import CSS kustom kita
import "./HeroCarousel.css";

// Terima 'banners' sebagai prop
const HeroCarousel = ({ banners = [] }) => {
  // Fallback jika banners kosong atau sedang loading
  if (!banners || banners.length === 0) {
    return (
      <div className="hero-carousel-container hero-carousel-loading">
        {/* Tampilkan spinner atau placeholder saat data belum siap */}
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    // Wrapper ini dikontrol oleh CSS (tampil di desktop, sembunyi di mobile)
    <div className="hero-carousel-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0} // Tidak ada jarak antar slide
        slidesPerView={1} // Tampilkan 1 slide penuh
        loop={true} // Mengulang dari awal
        autoplay={{
          delay: 4000, // Pindah slide setiap 4 detik
          disableOnInteraction: false, // Lanjutkan autoplay setelah user interaksi
        }}
        pagination={{
          clickable: true, // Agar titik-titik di bawah bisa diklik
        }}
        className="h-100" // Pastikan swiper mengisi container
      >
        {/* Loop data banner dari props */}
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {/* Setiap slide adalah Link ke halaman /store */}
            <Link to="/store">
              <img
                src={banner.imageUrl}
                alt={banner.altText || "StrideBase Banner"}
                className="carousel-image"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
