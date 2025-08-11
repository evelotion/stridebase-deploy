// File: stridebase-app-render/client/src/pages/TermsConditionsPage.jsx

import React from "react";

const TermsConditionsPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Syarat & Ketentuan</h1>
        <p className="lead text-muted">
          Mohon baca syarat dan ketentuan kami dengan saksama.
        </p>
      </div>

      <div className="legal-content-card">
        <h5>1. Penerimaan Persyaratan</h5>
        <p>
          Dengan mengakses atau menggunakan platform StrideBase, Anda setuju
          untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju
          dengan bagian mana pun dari persyaratan ini, Anda tidak diizinkan
          untuk menggunakan layanan kami.
        </p>

        <h5>2. Deskripsi Layanan</h5>
        <p>
          StrideBase menyediakan marketplace online yang menghubungkan
          pengguna dengan penyedia jasa cuci sepatu pihak ketiga ("Mitra
          Toko"). StrideBase tidak bertanggung jawab langsung atas layanan
          yang diberikan oleh Mitra Toko, namun kami memfasilitasi pemesanan,
          pembayaran, dan komunikasi.
        </p>

        <h5>3. Akun Pengguna</h5>
        <p>
          Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi
          Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas
          yang terjadi di bawah akun Anda.
        </p>

        <h5>4. Pembayaran dan Pembatalan</h5>
        <p>
          Semua pembayaran akan diproses melalui gateway pembayaran yang kami
          sediakan. Kebijakan pembatalan dan pengembalian dana ditentukan oleh
          masing-masing Mitra Toko dan akan ditampilkan selama proses
          pemesanan.
        </p>

        <h5>5. Batasan Tanggung Jawab</h5>
        <p>
          StrideBase tidak akan bertanggung jawab atas kerusakan tidak
          langsung, insidental, atau konsekuensial yang timbul dari penggunaan
          layanan atau kualitas pekerjaan yang dilakukan oleh Mitra Toko.
        </p>
      </div>
    </div>
  );
};

export default TermsConditionsPage;