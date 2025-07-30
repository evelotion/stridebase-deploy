import React from "react";
import { Link } from "react-router-dom";

const MaintenanceNoticePage = () => {
  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">
          <i className="fas fa-tools"></i>
        </h1>
        <p className="fs-3">
          {" "}
          <span className="text-warning">Oops!</span> Halaman ini sedang dalam
          perbaikan.
        </p>
        <p className="lead">
          Tim kami sedang bekerja keras untuk membuat halaman ini lebih baik.
          Silakan kembali lagi nanti.
        </p>
        <Link to="/" className="btn btn-dark mt-3">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default MaintenanceNoticePage;
