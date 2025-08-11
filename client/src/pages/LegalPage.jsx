// File: stridebase-app-render/client/src/pages/LegalPage.jsx

import React from "react";

const LegalPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Pemberitahuan Hukum</h1>
        <p className="lead text-muted">Informasi mengenai hak cipta dan merek dagang.</p>
      </div>

      <div className="legal-content-card">
        <h5>1. Hak Cipta</h5>
        <p>
          Seluruh konten yang terdapat dalam platform ini, termasuk namun
          tidak terbatas pada teks, grafik, logo, ikon, gambar, dan perangkat
          lunak, adalah milik StrideBase atau pemasok kontennya dan dilindungi
          oleh undang-undang hak cipta Indonesia dan internasional.
        </p>

        <h5>2. Merek Dagang</h5>
        <p>
          Nama "StrideBase" dan logonya adalah merek dagang terdaftar. Merek
          dagang ini tidak boleh digunakan sehubungan dengan produk atau
          layanan apa pun yang bukan milik StrideBase, dengan cara apa pun
          yang dapat menyebabkan kebingungan di antara pelanggan, atau dengan
          cara apa pun yang meremehkan atau mendiskreditkan StrideBase.
        </p>

        <h5>3. Ketergantungan pada Informasi</h5>
        <p>
          Informasi yang disediakan di platform ini hanya untuk tujuan
          informasi umum. Kami tidak memberikan jaminan atas kelengkapan atau
          keakuratan informasi ini. Setiap tindakan yang Anda ambil atas
          informasi di situs web ini adalah risiko Anda sendiri.
        </p>
      </div>
    </div>
  );
};

export default LegalPage;