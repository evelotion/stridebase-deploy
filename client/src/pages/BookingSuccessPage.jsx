import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;

  // Gunakan useEffect untuk memeriksa data setelah render
  useEffect(() => {
    // Jika tidak ada data booking setelah komponen dimuat,
    // kembalikan pengguna ke halaman utama untuk mencegah error.
    if (!bookingData) {
      console.error(
        "Tidak ada data booking yang diterima di halaman sukses. Mengarahkan kembali..."
      );
      navigate("/");
    }
  }, [bookingData, navigate]);

  // Tampilkan loading atau fallback jika data belum siap,
  // ini mencegah error 'toLocaleString' of undefined
  if (!bookingData) {
    return (
      <div className="container py-5 text-center">
        <p>Memuat hasil booking...</p>
      </div>
    );
  }

  return (
    <main className="container success-container d-flex align-items-center justify-content-center">
      <div className="success-box text-center">
        <div className="success-icon-wrapper">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2 className="success-title">Pemesanan Berhasil!</h2>
        <p className="success-details mb-4">
          Terima kasih! Pesanan Anda telah kami konfirmasi dan teruskan ke toko.
        </p>

        <div className="booking-recap">
          <h6 className="recap-title">Ringkasan Pesanan</h6>
          <ul className="list-group text-start">
            <li className="list-group-item">
              <i className="fas fa-store me-2 text-muted"></i>
              <strong>Toko:</strong> {bookingData.storeName}
            </li>
            <li className="list-group-item">
              <i className="fas fa-calendar-alt me-2 text-muted"></i>
              <strong>Jadwal:</strong> {bookingData.schedule}
            </li>
            <li className="list-group-item">
              <i className="fas fa-receipt me-2 text-muted"></i>
              <strong>Total Bayar:</strong> Rp{" "}
              {bookingData.totalPrice.toLocaleString("id-ID")}
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-4">
          <Link to="/dashboard" className="btn btn-dark btn-rounded">
            Lihat Dashboard
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-rounded">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
};

export default BookingSuccessPage;
