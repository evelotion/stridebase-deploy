// File: client/src/pages/PrivacyPolicyPage.jsx

import React from "react";
import { Fade } from "react-awesome-reveal";
import "./HomePageElevate.css";

const PrivacyPolicyPage = () => {
  return (
    <div
      className="home-elevate-wrapper"
      style={{ minHeight: "100vh", paddingTop: "100px" }}
    >
      {/* Header Dokumen */}
      <div className="bg-dark border-bottom border-secondary border-opacity-25 py-5 mb-5">
        <div className="container text-center">
          <Fade direction="down" triggerOnce>
            <h1 className="fw-bold text-white mb-2">Kebijakan Privasi</h1>
            <p className="text-white-50 mb-0">
              Terakhir diperbarui: 25 November 2025
            </p>
          </Fade>
        </div>
      </div>

      {/* Konten Dokumen */}
      <div className="container pb-5" style={{ maxWidth: "800px" }}>
        <Fade direction="up" cascade damping={0.1} triggerOnce>
          <div
            className="he-doc-content text-white-50"
            style={{ fontSize: "1.05rem", lineHeight: "1.8" }}
          >
            <section className="mb-5">
              <h4 className="text-white fw-bold mb-3">1. Pendahuluan</h4>
              <p>
                StrideBase ("kami") menghargai privasi Anda. Kebijakan Privasi
                ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan
                melindungi informasi pribadi Anda saat menggunakan platform
                kami.
              </p>
            </section>

            <section className="mb-5">
              <h4 className="text-white fw-bold mb-3">
                2. Data yang Kami Kumpulkan
              </h4>
              <ul className="ps-3">
                <li className="mb-2">
                  <strong>Informasi Akun:</strong> Nama, alamat email, nomor
                  telepon, dan password terenkripsi.
                </li>
                <li className="mb-2">
                  <strong>Data Transaksi:</strong> Detail booking, riwayat
                  pembayaran, dan alamat penjemputan/pengiriman.
                </li>
                <li className="mb-2">
                  <strong>Data Teknis:</strong> Alamat IP, jenis perangkat, dan
                  data penggunaan aplikasi untuk tujuan analitik.
                </li>
              </ul>
            </section>

            <section className="mb-5">
              <h4 className="text-white fw-bold mb-3">3. Penggunaan Data</h4>
              <p>
                Kami menggunakan data Anda semata-mata untuk memproses pesanan,
                menghubungkan Anda dengan mitra toko, dan meningkatkan kualitas
                layanan. Kami <strong>tidak akan pernah</strong> menjual data
                pribadi Anda kepada pihak ketiga.
              </p>
            </section>

            <section className="mb-5">
              <h4 className="text-white fw-bold mb-3">4. Keamanan</h4>
              <p>
                Kami menerapkan standar keamanan industri (enkripsi SSL, hashing
                password) untuk melindungi data Anda dari akses yang tidak sah.
                Namun, tidak ada metode transmisi internet yang 100% aman.
              </p>
            </section>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
