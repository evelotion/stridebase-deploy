

import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay, Pagination } from "swiper/modules";

import { Link } from "react-router-dom";


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";


import "./HeroCarousel.css";


const HeroCarousel = ({ banners = [] }) => {
 
  if (!banners || banners.length === 0) {
    return (
      <div className="hero-carousel-container hero-carousel-loading">
        {}
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
   
    <div className="hero-carousel-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="h-100"
      >
        {}
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {}
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
