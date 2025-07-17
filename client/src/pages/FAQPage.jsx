import React from 'react';

const FAQPage = () => {
  const faqs = [
    {
      question: "Apa itu StrideBase?",
      answer: "StrideBase adalah sebuah marketplace online yang menghubungkan Anda dengan penyedia jasa cuci sepatu profesional terdekat. Kami memudahkan Anda untuk mencari, membandingkan, dan memesan layanan perawatan sepatu berkualitas."
    },
    {
      question: "Bagaimana cara memesan layanan?",
      answer: "Sangat mudah! Cukup cari toko di halaman 'Store', pilih toko yang Anda inginkan, pilih jenis sepatu dan layanan yang dibutuhkan, lalu ikuti langkah-langkah untuk menyelesaikan pemesanan."
    },
    {
      question: "Apakah toko-toko di StrideBase terpercaya?",
      answer: "Ya. Semua mitra toko yang terdaftar di platform kami telah melalui proses verifikasi untuk memastikan kualitas layanan dan kepuasan pelanggan."
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer: "Saat ini kami masih dalam tahap pengembangan. Fitur pembayaran akan segera diimplementasikan. Untuk sekarang, pembayaran dilakukan langsung antara Anda dan pihak toko."
    },
    {
      question: "Bagaimana jika saya tidak puas dengan hasilnya?",
      answer: "Kepuasan Anda adalah prioritas kami. Silakan hubungi tim dukungan pelanggan kami melalui halaman 'Hubungi Kami' dan kami akan membantu mencari solusi terbaik."
    }
  ];

  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Pertanyaan Umum (FAQ)</h1>
        <p className="lead text-muted">Temukan jawaban untuk pertanyaan yang paling sering diajukan.</p>
      </div>

      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button 
                className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`} 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target={`#collapse${index}`} 
                aria-expanded={index === 0} 
                aria-controls={`collapse${index}`}
              >
                {faq.question}
              </button>
            </h2>
            <div 
              id={`collapse${index}`} 
              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
              aria-labelledby={`heading${index}`} 
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;