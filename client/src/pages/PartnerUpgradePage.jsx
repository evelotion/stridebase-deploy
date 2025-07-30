import React, { useState } from "react";
import { Link } from "react-router-dom";

const PartnerUpgradePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpgradeClick = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
<<<<<<< HEAD
      const response = await fetch("/api/partner/upgrade/create-transaction", {
=======
      const response = await fetch("import.meta.env.VITE_API_BASE_URL + "/api/partner/upgrade/create-transaction", {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memulai proses upgrade.");
      }

      // Arahkan pengguna ke halaman pembayaran
      window.location.href = data.redirectUrl;
    } catch (error) {
<<<<<<< HEAD
      alert(`Error: ${error.message}`);
=======
      showMessage(`Error: ${error.message}`);
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="text-center p-4 p-md-5">
        <span className="badge bg-info text-dark mb-3">StrideBase PRO</span>
        <h1 className="display-5 fw-bold">Buka Potensi Penuh Toko Anda</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4 text-muted">
            Tingkatkan keanggotaan Anda ke PRO untuk mendapatkan akses ke
            fitur-fitur eksklusif yang dirancang untuk meningkatkan visibilitas
            dan pendapatan toko Anda.
          </p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th style={{ width: "34%" }}></th>
                  <th style={{ width: "33%" }}>
                    <h5 className="mb-0">BASIC</h5>
                    <small className="text-muted">Gratis</small>
                  </th>
                  <th style={{ width: "33%" }} className="bg-light">
                    <h5 className="mb-0 text-info">PRO</h5>
                    <small className="text-muted">Rp 99.000 / bulan</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="text-start">
                    Manajemen Layanan & Pesanan
                  </th>
                  <td>
                    <i className="fas fa-check text-success"></i>
                  </td>
                  <td>
                    <i className="fas fa-check text-success"></i>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-start">
                    Dasbor Analitik Dasar
                  </th>
                  <td>
                    <i className="fas fa-check text-success"></i>
                  </td>
                  <td>
                    <i className="fas fa-check text-success"></i>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-start">
                    Tampil di Halaman Utama
                  </th>
                  <td>
                    <i className="fas fa-times text-danger"></i>
                  </td>
                  <td className="bg-light">
                    <i className="fas fa-check text-success"></i>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-start">
                    Laporan Analitik Mendalam
                  </th>
                  <td>
                    <i className="fas fa-times text-danger"></i>
                  </td>
                  <td className="bg-light">
                    <i className="fas fa-check text-success"></i>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-start">
                    Prioritas Dukungan Pelanggan
                  </th>
                  <td>
                    <i className="fas fa-times text-danger"></i>
                  </td>
                  <td className="bg-light">
                    <i className="fas fa-check text-success"></i>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td className="bg-light">
                    <button
                      className="btn btn-info"
                      onClick={handleUpgradeClick}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Memproses..." : "Upgrade Sekarang"}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerUpgradePage;
