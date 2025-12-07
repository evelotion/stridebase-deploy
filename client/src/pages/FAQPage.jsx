// File: client/src/pages/FAQPage.jsx

import React from "react";
import { Fade } from "react-awesome-reveal";
import { Link } from "react-router-dom";
import "./HomePageElevate.css";

const faqs = [
  {
    question: "Bagaimana cara kerja Pickup & Delivery?",
    answer:
      "Pilih layanan 'Pickup & Delivery' saat booking. Kurir mitra kami akan menjemput sepatu kotor Anda dan mengantarkannya kembali setelah bersih.",
  },
  {
    question: "Berapa lama proses pengerjaan?",
    answer:
      "Fast Clean: 24 jam. Deep Clean: 2-3 hari. Repaint/Repair: 3-7 hari tergantung tingkat kesulitan.",
  },
  {
    question: "Apakah ada garansi kerusakan?",
    answer:
      "Ya, kami menyediakan asuransi perlindungan hingga Rp 1.000.000 per pasang sepatu jika terjadi kerusakan akibat kelalaian mitra.",
  },
  {
    question: "Metode pembayaran apa saja?",
    answer:
      "Kami mendukung QRIS, Virtual Account (BCA, Mandiri, BNI, BRI), dan E-Wallet melalui Midtrans gateway.",
  },
];

const FAQPage = () => {
  return (
    <div className="home-elevate-wrapper he-faq-wrapper">
      <div className="d-none d-lg-block" style={{ height: "120px" }}></div>

      {/* MOBILE HEADER */}
      <div className="d-lg-none p-4 pt-5 pb-0">
        <Link to="/" className="text-decoration-none text-muted mb-3 d-block">
          <i className="fas fa-arrow-left"></i> Kembali
        </Link>
      </div>

      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-5 px-3">
          <Fade direction="down" triggerOnce>
            <span className="he-section-label mb-2 d-block">SUPPORT</span>
            <h2 className="he-section-title mb-3">Pertanyaan Umum</h2>
            <p className="he-service-desc mx-auto">
              Temukan jawaban cepat seputar layanan dan pembayaran.
            </p>
          </Fade>
        </div>

        <div className="accordion he-accordion px-3" id="faqAccordion">
          {faqs.map((faq, index) => (
            <Fade key={index} direction="up" delay={index * 100} triggerOnce>
              <div className="accordion-item mb-3">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                  >
                    <span className="he-faq-number">0{index + 1}</span>
                    {faq.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">{faq.answer}</div>
                </div>
              </div>
            </Fade>
          ))}
        </div>

        <div className="text-center mt-5 pt-4 pb-5 px-3">
          <div className="p-4 rounded-4 he-faq-contact-card">
            <p className="mb-3 fw-bold text-main">
              Masih punya pertanyaan lain?
            </p>
            <Link to="/contact" className="btn btn-primary rounded-pill px-4">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
