// src/components/HeroCarousel.jsx

import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Autoplay, Pagination } from 'swiper/modules';
// Import React Router Link (asumsi Anda menggunakannya untuk navigasi)
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// === DATA BANNER ===
// Ganti ini dengan data dinamis Anda (misalnya dari API atau state)
// Ini adalah banner-banner yang Anda sebutkan
const banners = [
  {
    id: 1,
    imageUrl: 'https://example.com/path/ke/banner-desktop-1.jpg', // Ganti URL
    alt: 'Promo Cuci Sepatu 1'
  },
  {
    id: 2,
    imageUrl: 'https://example.com/path/ke/banner-desktop-2.jpg', // Ganti URL
    alt: 'Layanan Cepat 2'
  },
  {
    id: 3,
    imageUrl: 'https://example.com/path/ke/banner-desktop-3.jpg', // Ganti URL
    alt: 'Promo Spesial 3'
  }
];

// Kita buat file CSS terpisah untuk styling
import './HeroCarousel.css';

const HeroCarousel = () => {
  return (
    // Wrapper ini akan kita gunakan untuk styling desktop-only
    <div className="hero-carousel-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}    // Tidak ada jarak antar slide
        slidesPerView={1}   // Tampilkan 1 slide penuh
        loop={true}           // Mengulang dari awal
        autoplay={{
          delay: 4000, // Pindah slide setiap 4 detik
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true, // Agar titik-titik di bawah bisa diklik
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {/* Setiap slide adalah Link ke halaman store */}
            <Link to="/store">
              <img src={banner.imageUrl} alt={banner.alt} className="carousel-image" />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;