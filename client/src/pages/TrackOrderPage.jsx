// File: client/src/pages/TrackOrderPage.jsx (Versi Final dengan Live Update & Animasi)

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../apiConfig";

// Pindahkan inisialisasi socket ke dalam komponen agar bisa mengakses userId
let socket;

const ProgressStep = ({ icon, title, active }) => (
  <div className={`progress-step ${active ? "active" : ""}`}>
    <div className="progress-step-icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="progress-step-title">{title}</div>
  </div>
);

const TrackOrderPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- PERBAIKAN 1: Definisikan tahapan pengerjaan yang sesuai dengan enum di Prisma ---
  const workStages = useMemo(
    () => [
      { status: "not_started", icon: "fa-receipt", title: "Diterima" },
      { status: "in_progress", icon: "fa-soap", title: "Pencucian" },
      { status: "completed", icon: "fa-clipboard-check", title: "Selesai" },
      {
        status: "pending_verification",
        icon: "fa-box-open",
        title: "Siap Diambil",
      },
    ],
    []
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
      setError("Silakan login untuk melihat detail pesanan.");
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(
            "Pesanan tidak ditemukan atau Anda tidak memiliki akses."
          );
        }
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();

    // --- PERBAIKAN 2: Inisialisasi koneksi socket dengan userId ---
    socket = io(API_BASE_URL, {
      query: { userId: user.id },
    });

    const handleBookingUpdate = (updatedBooking) => {
      if (updatedBooking.id === bookingId) {
        console.log(
          "🔥 Menerima update status pengerjaan:",
          updatedBooking.workStatus
        );
        setBooking((prev) => ({ ...prev, ...updatedBooking }));
      }
    };

    socket.on("bookingUpdated", handleBookingUpdate);

    // Cleanup function untuk memutuskan koneksi saat komponen dilepas
    return () => {
      socket.off("bookingUpdated", handleBookingUpdate);
      socket.disconnect();
    };
  }, [bookingId]);

  // --- PERBAIKAN 3: Logika untuk progress bar animasi ---
  const currentStageIndex = useMemo(() => {
    if (!booking) return -1;
    return workStages.findIndex((stage) => stage.status === booking.workStatus);
  }, [booking, workStages]);

  const progressPercentage = useMemo(() => {
    if (currentStageIndex < 0) return 0;
    return (currentStageIndex / (workStages.length - 1)) * 100;
  }, [currentStageIndex, workStages]);

  if (loading)
    return (
      <div className="container py-5 text-center">
        Memuat detail pelacakan...
      </div>
    );
  if (error)
    return (
      <div className="container py-5 text-center text-danger">{error}</div>
    );
  if (!booking)
    return (
      <div className="container py-5 text-center">
        Data pesanan tidak ditemukan.
      </div>
    );

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white text-center">
              <h4 className="mb-0">Lacak Pesanan Anda</h4>
              <p className="mb-0 small">
                ID Pesanan: #{booking.id.substring(0, 8)}
              </p>
            </div>
            <div className="card-body p-4 p-md-5">
              <div className="mb-5">
                <h5 className="fw-bold">{booking.serviceName}</h5>
                <p className="text-muted mb-0">
                  di <strong>{booking.store.name}</strong>
                </p>
              </div>

              <div className="progress-tracker-container">
                <div
                  className="progress-bar-line"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                {workStages.map((stage, index) => (
                  <ProgressStep
                    key={stage.status}
                    icon={stage.icon}
                    title={stage.title}
                    active={index <= currentStageIndex}
                  />
                ))}
              </div>

              <div className="text-center mt-5 p-3 bg-light rounded">
                <p className="mb-1 text-muted">Status Terkini:</p>
                <h5 className="fw-bold text-primary">
                  {workStages[currentStageIndex]?.title ||
                    "Menunggu Konfirmasi"}
                </h5>
              </div>

              <hr className="my-4" />
              <div className="text-center">
                <Link to="/dashboard" className="btn btn-outline-dark">
                  <i className="fas fa-arrow-left me-2"></i>Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
