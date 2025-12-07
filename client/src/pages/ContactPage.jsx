// File: client/src/pages/ContactPage.jsx

import React, { useState } from "react";
import { Fade, Slide } from "react-awesome-reveal";
import "./HomePageElevate.css"; // Pastikan CSS Elevate terhubung

const ContactPage = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulasi pengiriman pesan
    setTimeout(() => {
      setIsSubmitting(false);
      if (showMessage)
        showMessage(
          "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.",
          "Sukses"
        );
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    // WRAPPER UTAMA: Background Hitam Pekat dengan Aksen Glow
    <div
      className="home-elevate-wrapper position-relative overflow-hidden"
      style={{ minHeight: "100vh", background: "#050505" }}
    >
      {/* BACKGROUND DECORATIONS (BLOBS) */}
      <div
        className="he-glow-blob"
        style={{
          top: "-10%",
          left: "-10%",
          width: "800px",
          height: "800px",
          opacity: 0.3,
        }}
      ></div>
      <div
        className="he-glow-blob"
        style={{
          bottom: "-10%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
          opacity: 0.15,
        }}
      ></div>

      {/* 1. HERO SECTION (TYPOGRAPHIC CENTERED) */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center position-relative"
        style={{ minHeight: "50vh", paddingTop: "100px" }}
      >
        <Fade direction="up" cascade damping={0.2} triggerOnce>
          <span
            className="he-section-label mb-3"
            style={{ letterSpacing: "5px" }}
          >
            GET IN TOUCH
          </span>
          <h1
            className="display-1 fw-bold text-white mb-4"
            style={{
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "-2px",
              textShadow: "0 0 40px rgba(59, 130, 246, 0.4)",
            }}
          >
            Let's Start a <br />
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "2px var(--sb-accent)",
              }}
            >
              Conversation.
            </span>
          </h1>
          <p className="text-white-50 fs-5" style={{ maxWidth: "600px" }}>
            Punya pertanyaan tentang layanan atau ingin bermitra? Kami siap
            mendengar cerita sepatu Anda.
          </p>
        </Fade>
      </section>

      {/* 2. OVERLAPPING CONTENT SECTION */}
      <section className="position-relative" style={{ paddingBottom: "8rem" }}>
        <div className="container">
          <div className="row g-0 justify-content-center">
            {/* KARTU FORM (GLASS CENTER) */}
            <div className="col-lg-10 position-relative z-2">
              <Slide direction="up" triggerOnce>
                <div
                  className="he-promo-card p-0 overflow-hidden border-0"
                  style={{
                    backdropFilter: "blur(30px)",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "30px",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="row g-0">
                    {/* KOLOM KIRI: INFO KONTAK (DARKER GLASS) */}
                    <div
                      className="col-lg-5 p-5 d-flex flex-column justify-content-between position-relative"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <div>
                        <h3 className="text-white fw-bold mb-5">
                          Contact Info
                        </h3>

                        <div className="mb-4 d-flex gap-3">
                          <div
                            className="he-service-icon-box"
                            style={{
                              width: "50px",
                              height: "50px",
                              fontSize: "1.2rem",
                              marginBottom: 0,
                            }}
                          >
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div>
                            <h6 className="text-white fw-bold mb-1">
                              Visit Us
                            </h6>
                            <p className="text-white-50 small mb-0">
                              Grand Indonesia, East Mall Lv 3A
                              <br />
                              Jakarta Pusat, 10310
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 d-flex gap-3">
                          <div
                            className="he-service-icon-box"
                            style={{
                              width: "50px",
                              height: "50px",
                              fontSize: "1.2rem",
                              marginBottom: 0,
                            }}
                          >
                            <i className="fas fa-envelope"></i>
                          </div>
                          <div>
                            <h6 className="text-white fw-bold mb-1">
                              Email Us
                            </h6>
                            <p className="text-white-50 small mb-0">
                              support@stridebase.com
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 d-flex gap-3">
                          <div
                            className="he-service-icon-box"
                            style={{
                              width: "50px",
                              height: "50px",
                              fontSize: "1.2rem",
                              marginBottom: 0,
                            }}
                          >
                            <i className="fas fa-phone-alt"></i>
                          </div>
                          <div>
                            <h6 className="text-white fw-bold mb-1">Call Us</h6>
                            <p className="text-white-50 small mb-0">
                              +62 21 5555 0199
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Social Media Links */}
                      <div className="mt-5">
                        <h6 className="text-uppercase text-white-50 small mb-3 fw-bold">
                          Follow Our Journey
                        </h6>
                        <div className="d-flex gap-3">
                          {["instagram", "twitter", "facebook", "linkedin"].map(
                            (social) => (
                              <a
                                key={social}
                                href="#"
                                className="he-page-btn"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "12px",
                                }}
                              >
                                <i className={`fab fa-${social}`}></i>
                              </a>
                            )
                          )}
                        </div>
                      </div>

                      {/* Dekorasi Garis */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          width: "1px",
                          background:
                            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)",
                        }}
                      ></div>
                    </div>

                    {/* KOLOM KANAN: FORMULIR */}
                    <div className="col-lg-7 p-5">
                      <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                          <div className="col-md-6">
                            <label className="he-form-label text-xs tracking-widest text-white-50 mb-2">
                              FULL NAME
                            </label>
                            <input
                              type="text"
                              name="name"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderColor: "rgba(255,255,255,0.2)",
                              }}
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="he-form-label text-xs tracking-widest text-white-50 mb-2">
                              EMAIL ADDRESS
                            </label>
                            <input
                              type="email"
                              name="email"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderColor: "rgba(255,255,255,0.2)",
                              }}
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="col-12">
                            <label className="he-form-label text-xs tracking-widest text-white-50 mb-2">
                              SUBJECT
                            </label>
                            <select
                              name="subject"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2 text-white"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderColor: "rgba(255,255,255,0.2)",
                                appearance: "auto",
                              }}
                              value={formData.subject}
                              onChange={handleChange}
                              required
                            >
                              <option value="" className="text-dark">
                                Select a Topic
                              </option>
                              <option value="Partnership" className="text-dark">
                                Partnership Inquiry
                              </option>
                              <option value="Support" className="text-dark">
                                Customer Support
                              </option>
                              <option value="Feedback" className="text-dark">
                                Feedback & Suggestions
                              </option>
                            </select>
                          </div>
                          <div className="col-12">
                            <label className="he-form-label text-xs tracking-widest text-white-50 mb-2">
                              MESSAGE
                            </label>
                            <textarea
                              name="message"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderColor: "rgba(255,255,255,0.2)",
                              }}
                              rows="4"
                              placeholder="Tell us more about your inquiry..."
                              value={formData.message}
                              onChange={handleChange}
                              required
                            ></textarea>
                          </div>
                          <div className="col-12 mt-4">
                            <button
                              type="submit"
                              className="he-btn-primary-glow border-0 px-5 py-3 w-100 d-flex justify-content-between align-items-center"
                              disabled={isSubmitting}
                            >
                              <span className="fw-bold">
                                {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                              </span>
                              <i className="fas fa-arrow-right"></i>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Slide>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAP SECTION (FULL WIDTH DARK) */}
      <section
        className="position-relative"
        style={{
          height: "400px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="he-map-container h-100 rounded-0 mt-0"
          style={{ filter: "grayscale(100%) invert(90%) contrast(90%)" }}
        >
          <iframe
            title="Lokasi Kantor"
            src="https://maps.google.com/maps?q=Grand%20Indonesia&t=m&z=15&output=embed&iwloc=near"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* Map Overlay Text */}
        <div
          className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.8)",
            padding: "20px 40px",
            borderRadius: "50px",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <h4
            className="text-white fw-bold mb-0"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            JAKARTA HQ
          </h4>
          <small className="text-white-50">
            Open in Maps <i className="fas fa-external-link-alt ms-1"></i>
          </small>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
