// File: client/src/pages/AboutPage.jsx

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Fade, Slide, Zoom } from "react-awesome-reveal";
import Navbar from "../components/Navbar";
import "./AboutPageElevate.css";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pe-dashboard-wrapper luxury-blue-theme">
      {/* Navbar otomatis dari App.jsx */}

      {/* --- 1. HERO SECTION (TYPOGRAPHY ONLY) --- */}
      <section className="lx-hero-clean">
        {/* Ambient Blue Orbs */}
        <div className="lx-orb orb-1"></div>
        <div className="lx-orb orb-2"></div>

        <div className="container position-relative z-2 h-100 d-flex flex-column justify-content-center align-items-center">
          <Fade direction="up" cascade damping={0.1} triggerOnce>
            <div className="lx-hero-badge">EST. 2024 • JAKARTA</div>
            <h1 className="lx-hero-title-clean text-center">
              WE ARE <br />
              <span className="lx-text-blue-gradient">STRIDEBASE.</span>
            </h1>
            <p className="lx-hero-desc text-center">
              The first tech-enabled premium shoe care ecosystem.
            </p>
          </Fade>
        </div>
      </section>

      {/* --- 2. MANIFESTO (TEXT FOCUS) --- */}
      <section className="lx-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <Fade triggerOnce>
                <h2 className="lx-quote">
                  "Sepatu bukan sekadar alas kaki. Ia adalah{" "}
                  <span className="lx-highlight-blue">saksi bisu</span>{" "}
                  perjalanan Anda. Kami hadir untuk memastikan cerita itu tidak
                  pudar."
                </h2>
              </Fade>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. THE CRAFT (DARK CARDS WITH BLUE GLOW) --- */}
      <section className="lx-section">
        <div className="container">
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-md-6">
              <Slide direction="left" triggerOnce>
                <div className="lx-feature-card">
                  <div className="lx-card-number">01</div>
                  <h3 className="lx-card-title">Artisan Touch</h3>
                  <p className="lx-card-text">
                    Dikerjakan manual oleh tangan ahli yang memahami material
                    Suede, Nubuck, hingga Leather. Bukan mesin, melainkan seni.
                  </p>
                  <div className="lx-card-glow"></div>
                </div>
              </Slide>
            </div>

            {/* Card 2 */}
            <div className="col-md-6">
              <Slide direction="right" triggerOnce>
                <div className="lx-feature-card">
                  <div className="lx-card-number">02</div>
                  <h3 className="lx-card-title">Smart Tech</h3>
                  <p className="lx-card-text">
                    Lacak progres cuci secara real-time. Transparansi total dari
                    penjemputan hingga pengantaran kembali ke rak sepatu Anda.
                  </p>
                  <div className="lx-card-glow"></div>
                </div>
              </Slide>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. STATS (MINIMAL BLUE) --- */}
      <section className="lx-section pt-5 pb-5">
        <div className="container">
          <div className="lx-stats-grid">
            <div className="lx-stat-item">
              <span className="lx-stat-val">50+</span>
              <span className="lx-stat-label">Mitra Bengkel</span>
            </div>
            <div className="lx-stat-divider"></div>
            <div className="lx-stat-item">
              <span className="lx-stat-val">12K</span>
              <span className="lx-stat-label">Sepatu Direstorasi</span>
            </div>
            <div className="lx-stat-divider"></div>
            <div className="lx-stat-item">
              <span className="lx-stat-val">4.9</span>
              <span className="lx-stat-label">Rating User</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. CTA (BLUE GRADIENT) --- */}
      <section className="lx-cta-section-blue">
        <div className="container text-center">
          <Zoom triggerOnce>
            <h2 className="lx-cta-title">Ready to Upgrade?</h2>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Link to="/store" className="lx-btn-primary-blue">
                Book Service
              </Link>
              <Link to="/contact" className="lx-btn-outline-blue">
                Contact Us
              </Link>
            </div>
          </Zoom>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
