// File: client/src/pages/ContactPage.jsx

import React, { useState } from "react";
import { Fade, Slide } from "react-awesome-reveal";
import "./HomePageElevate.css";

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
    // UBAH 1: Background pakai variabel --pe-bg
    <div
      className="home-elevate-wrapper position-relative overflow-hidden"
      style={{
        minHeight: "100vh",
        background: "var(--pe-bg, #050505)",
        color: "var(--pe-text-main, #fff)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Background Blobs */}
      <div
        className="he-glow-blob"
        style={{
          top: "-10%",
          left: "-10%",
          width: "800px",
          height: "800px",
          opacity: 0.3,
          background:
            "radial-gradient(circle, var(--sb-primary, #3b82f6) 0%, transparent 70%)",
        }}
      ></div>
      <div
        className="he-glow-blob"
        style={{
          bottom: "-10%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, var(--sb-accent, #fbbf24) 0%, transparent 70%)",
          opacity: 0.15,
        }}
      ></div>

      {/* Hero Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center position-relative"
        style={{ minHeight: "50vh", paddingTop: "100px" }}
      >
        <Fade direction="up" cascade damping={0.2} triggerOnce>
          <span
            className="he-section-label mb-3"
            style={{ letterSpacing: "5px", color: "var(--sb-accent, #fbbf24)" }}
          >
            GET IN TOUCH
          </span>
          <h1
            className="display-1 fw-bold mb-4"
            style={{
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "-2px",
              color: "var(--pe-text-main, #fff)",
            }}
          >
            Let's Start a <br />
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "2px var(--sb-accent, #fbbf24)",
              }}
            >
              Conversation.
            </span>
          </h1>
          <p
            className="fs-5"
            style={{
              maxWidth: "600px",
              color: "var(--pe-text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            Punya pertanyaan tentang layanan atau ingin bermitra? Kami siap
            mendengar cerita sepatu Anda.
          </p>
        </Fade>
      </section>

      {/* Form Section */}
      <section className="position-relative" style={{ paddingBottom: "8rem" }}>
        <div className="container">
          <div className="row g-0 justify-content-center">
            <div className="col-lg-10 position-relative z-2">
              <Slide direction="up" triggerOnce>
                <div
                  className="he-promo-card p-0 overflow-hidden border-0"
                  style={{
                    backdropFilter: "blur(30px)",
                    background: "var(--pe-card-bg, rgba(255,255,255,0.02))",
                    borderRadius: "30px",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.1)",
                    border: "1px solid var(--pe-border, rgba(255,255,255,0.1))",
                  }}
                >
                  <div className="row g-0">
                    {/* Left Column: Info */}
                    <div
                      className="col-lg-5 p-5 d-flex flex-column justify-content-between position-relative"
                      style={{
                        background: "var(--pe-sidebar-bg, rgba(0,0,0,0.2))",
                        borderRight:
                          "1px solid var(--pe-border, rgba(255,255,255,0.1))",
                      }}
                    >
                      <div>
                        <h3
                          className="fw-bold mb-5"
                          style={{ color: "var(--pe-text-main, #fff)" }}
                        >
                          Contact Info
                        </h3>

                        {[
                          {
                            icon: "map-marker-alt",
                            title: "Visit Us",
                            desc: "Grand Indonesia, East Mall Lv 3A<br/>Jakarta Pusat, 10310",
                          },
                          {
                            icon: "envelope",
                            title: "Email Us",
                            desc: "support@stridebase.com",
                          },
                          {
                            icon: "phone-alt",
                            title: "Call Us",
                            desc: "+62 21 5555 0199",
                          },
                        ].map((item, idx) => (
                          <div className="mb-4 d-flex gap-3" key={idx}>
                            <div
                              className="he-service-icon-box"
                              style={{
                                width: "50px",
                                height: "50px",
                                fontSize: "1.2rem",
                                marginBottom: 0,
                                background: "var(--pe-card-bg)",
                                color: "var(--sb-accent)",
                                border: "1px solid var(--pe-border)",
                              }}
                            >
                              <i className={`fas fa-${item.icon}`}></i>
                            </div>
                            <div>
                              <h6
                                className="fw-bold mb-1"
                                style={{ color: "var(--pe-text-main)" }}
                              >
                                {item.title}
                              </h6>
                              <p
                                className="small mb-0"
                                style={{ color: "var(--pe-text-secondary)" }}
                                dangerouslySetInnerHTML={{ __html: item.desc }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Social Media */}
                      <div className="mt-5">
                        <h6
                          className="text-uppercase small mb-3 fw-bold"
                          style={{ color: "var(--pe-text-secondary)" }}
                        >
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
                                  color: "var(--pe-text-main)",
                                  border: "1px solid var(--pe-border)",
                                }}
                              >
                                <i className={`fab fa-${social}`}></i>
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="col-lg-7 p-5">
                      <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                          {[
                            {
                              label: "FULL NAME",
                              name: "name",
                              type: "text",
                              placeholder: "John Doe",
                            },
                            {
                              label: "EMAIL ADDRESS",
                              name: "email",
                              type: "email",
                              placeholder: "john@example.com",
                            },
                          ].map((field) => (
                            <div className="col-md-6" key={field.name}>
                              <label
                                className="he-form-label text-xs tracking-widest mb-2"
                                style={{ color: "var(--pe-text-secondary)" }}
                              >
                                {field.label}
                              </label>
                              <input
                                type={field.type}
                                name={field.name}
                                className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                                style={{
                                  borderTop: "none",
                                  borderLeft: "none",
                                  borderRight: "none",
                                  borderBottom:
                                    "1px solid var(--pe-border, rgba(255,255,255,0.2))",
                                  color: "var(--pe-text-main)",
                                  boxShadow: "none",
                                }}
                                placeholder={field.placeholder}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          ))}

                          <div className="col-12">
                            <label
                              className="he-form-label text-xs tracking-widest mb-2"
                              style={{ color: "var(--pe-text-secondary)" }}
                            >
                              SUBJECT
                            </label>
                            <select
                              name="subject"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderBottom:
                                  "1px solid var(--pe-border, rgba(255,255,255,0.2))",
                                color: "var(--pe-text-main)",
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
                            <label
                              className="he-form-label text-xs tracking-widest mb-2"
                              style={{ color: "var(--pe-text-secondary)" }}
                            >
                              MESSAGE
                            </label>
                            <textarea
                              name="message"
                              className="he-form-control bg-transparent border-bottom rounded-0 px-0 py-2"
                              style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderBottom:
                                  "1px solid var(--pe-border, rgba(255,255,255,0.2))",
                                color: "var(--pe-text-main)",
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

      {/* Map Section */}
      <section
        className="position-relative"
        style={{
          height: "400px",
          borderTop: "1px solid var(--pe-border, rgba(255,255,255,0.1))",
        }}
      >
        <div
          className="he-map-container h-100 rounded-0 mt-0"
          style={{
            // UBAH 2: Map jadi normal (tidak invert) saat light mode
            filter:
              "grayscale(100%) var(--pe-map-filter, invert(90%) contrast(90%))",
          }}
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

        <div
          className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none"
          style={{
            background: "var(--pe-card-bg, rgba(0,0,0,0.8))",
            padding: "20px 40px",
            borderRadius: "50px",
            backdropFilter: "blur(5px)",
            border: "1px solid var(--pe-border, rgba(255,255,255,0.2))",
            color: "var(--pe-text-main)",
          }}
        >
          <h4
            className="fw-bold mb-0"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            JAKARTA HQ
          </h4>
          <small style={{ color: "var(--pe-text-secondary)" }}>
            Open in Maps <i className="fas fa-external-link-alt ms-1"></i>
          </small>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
