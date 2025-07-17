import React from "react";

const AboutPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Tentang StrideBase</h1>
        <p className="lead text-muted">
          Misi kami adalah merevolusi cara Anda merawat sepatu.
        </p>
      </div>

      <div className="row g-5 align-items-center">
        <div className="col-lg-6">
          <h2 className="fw-semibold">Kisah Kami</h2>
          <p>
            StrideBase lahir dari ide sederhana: membuat layanan cuci sepatu
            profesional dapat diakses oleh semua orang, di mana saja. Kami
            melihat banyak orang kesulitan menemukan jasa cuci sepatu yang
            tepercaya dan berkualitas. Di sisi lain, banyak penyedia jasa
            berkualitas yang kesulitan menjangkau pelanggan baru.
          </p>
          <p>
            Oleh karena itu, kami membangun sebuah platform yang menghubungkan
            keduanya. StrideBase bukan hanya sebuah marketplace, tetapi sebuah
            komunitas yang didedikasikan untuk seni merawat sepatu.
          </p>
        </div>
        <div className="col-lg-6">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800"
            className="img-fluid rounded-3 shadow"
            alt="Tentang StrideBase"
          />
        </div>
      </div>

      <div className="row g-5 mt-5 text-center">
        <div className="col-md-4">
          <div
            className="feature-icon-sm bg-primary bg-gradient text-white rounded-3 mb-3 fs-2 d-inline-flex align-items-center justify-content-center"
            style={{ width: "3rem", height: "3rem" }}
          >
            <i className="fas fa-handshake"></i>
          </div>
          <h4 className="fw-semibold">Mitra Terverifikasi</h4>
          <p className="text-muted">
            Kami hanya bekerja sama dengan penyedia jasa cuci sepatu terbaik
            yang telah melalui proses verifikasi ketat.
          </p>
        </div>
        <div className="col-md-4">
          <div
            className="feature-icon-sm bg-primary bg-gradient text-white rounded-3 mb-3 fs-2 d-inline-flex align-items-center justify-content-center"
            style={{ width: "3rem", height: "3rem" }}
          >
            <i className="fas fa-shield-alt"></i>
          </div>
          <h4 className="fw-semibold">Booking Aman</h4>
          <p className="text-muted">
            Proses pemesanan yang mudah dan sistem pembayaran yang aman untuk
            kenyamanan Anda.
          </p>
        </div>
        <div className="col-md-4">
          <div
            className="feature-icon-sm bg-primary bg-gradient text-white rounded-3 mb-3 fs-2 d-inline-flex align-items-center justify-content-center"
            style={{ width: "3rem", height: "3rem" }}
          >
            <i className="fas fa-headset"></i>
          </div>
          <h4 className="fw-semibold">Dukungan Pelanggan</h4>
          <p className="text-muted">
            Tim kami selalu siap membantu jika Anda mengalami kendala atau
            memiliki pertanyaan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
