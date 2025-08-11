// File: stridebase-app-render/client/src/pages/PrivacyPolicyPage.jsx

import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Kebijakan Privasi</h1>
        <p className="lead text-muted">
          Terakhir diperbarui: 12 Agustus 2025
        </p>
      </div>

      <div className="legal-content-card">
        <h5>1. Informasi yang Kami Kumpulkan</h5>
        <p>
          Kami mengumpulkan informasi yang Anda berikan langsung kepada kami
          saat Anda mendaftar, melakukan pemesanan, atau berkomunikasi dengan
          kami. Ini termasuk nama, alamat email, nomor telepon, dan alamat
          pengiriman. Kami juga dapat mengumpulkan informasi teknis seperti
          alamat IP dan data penjelajahan untuk meningkatkan layanan kami.
        </p>

        <h5>2. Bagaimana Kami Menggunakan Informasi Anda</h5>
        <p>
          Informasi Anda digunakan untuk memproses transaksi, mengelola akun
          Anda, mengirimkan notifikasi terkait pesanan, dan menyediakan
          dukungan pelanggan. Kami juga dapat menggunakannya untuk tujuan
          pemasaran internal dan analisis untuk meningkatkan platform
          StrideBase.
        </p>

        <h5>3. Pembagian Informasi</h5>
        <p>
          Kami tidak menjual atau menyewakan informasi pribadi Anda kepada
          pihak ketiga. Kami hanya membagikan informasi yang diperlukan kepada
          mitra toko (misalnya, nama dan detail pesanan) untuk memenuhi
          layanan yang Anda pesan.
        </p>

        <h5>4. Keamanan Data</h5>
        <p>
          Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi
          informasi Anda dari akses, penggunaan, atau pengungkapan yang tidak
          sah. Namun, tidak ada metode transmisi melalui internet atau metode
          penyimpanan elektronik yang 100% aman.
        </p>

        <h5>5. Perubahan pada Kebijakan Ini</h5>
        <p>
          Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu.
          Kami akan memberitahu Anda tentang perubahan apa pun dengan
          memposting kebijakan baru di halaman ini.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;