// File: client/src/pages/BookingConfirmationPage.jsx (Perbaikan Final V2)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { getStoreServices, getUserAddresses } from "../services/apiService";

const BookingConfirmationPage = ({ showMessage }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");

    if (!token || !savedBooking) {
      showMessage("Sesi tidak valid atau data booking hilang.", "Error");
      navigate("/login");
      return;
    }

    const bookingData = JSON.parse(savedBooking);
    setBookingDetails(bookingData);

    const fetchExtraData = async () => {
      try {
        const allServices = await getStoreServices(bookingData.storeId);
        const foundService = allServices.find(
          (s) => s.id === bookingData.serviceId
        );
        if (!foundService) throw new Error("Layanan tidak ditemukan.");
        setServiceDetails(foundService);

        if (bookingData.deliveryOption === "pickup" && bookingData.addressId) {
          const addresses = await getUserAddresses();
          const foundAddress = addresses.find(
            (addr) => addr.id === bookingData.addressId
          );
          setSelectedAddress(foundAddress);
        }
      } catch (err) {
        showMessage(err.message, "Error");
        navigate(`/store/${bookingData.storeId || ""}`);
      }
    };

    fetchExtraData();
  }, [navigate, showMessage]);

  const handleApplyPromo = async (codeToApply = promoCode) => {
    setPromoError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/promos/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: codeToApply }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppliedPromo(data);
    } catch (error) {
      setPromoError(error.message);
      setAppliedPromo(null);
    }
  };

  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      // --- AWAL PERBAIKAN ---

      // 1. Siapkan payload yang benar untuk dikirim ke server.
      const payload = {
        ...bookingDetails,
        // Ambil 'date' dari objek 'schedule' dan jadikan 'scheduleDate'
        scheduleDate: bookingDetails.schedule?.date,
        promoCode: appliedPromo ? appliedPromo.code : undefined,
      };
      // Hapus objek 'schedule' yang sudah tidak diperlukan
      delete payload.schedule;

      // Langkah 1: Buat booking dengan payload yang sudah diperbaiki
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // 2. Gunakan payload yang sudah benar
        body: JSON.stringify(payload),
      });

      // --- AKHIR PERBAIKAN ---

      const newBookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(newBookingData.message || "Gagal membuat pesanan.");
      }

      // Langkah 2: Buat transaksi pembayaran untuk mendapatkan ID-nya
      await fetch(`${API_BASE_URL}/api/payments/create-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: newBookingData.id }),
      });

      // Langkah 3: Gunakan React Router (navigate) untuk pindah halaman
      localStorage.removeItem("pendingBooking");
      navigate(`/payment-simulation/${newBookingData.id}`);
    } catch (error) {
      showMessage(error.message, "Error");
      setIsSubmitting(false);
    }
  };

  if (!bookingDetails || !serviceDetails) {
    return (
      <div className="container py-5 text-center">
        Memuat detail konfirmasi...
      </div>
    );
  }

  const { storeName, deliveryOption } = bookingDetails;
  const handlingFee = 2000;
  const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
  const subtotal = serviceDetails.price || 0;
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount =
      appliedPromo.discountType === "PERCENTAGE"
        ? (subtotal * appliedPromo.value) / 100
        : appliedPromo.value;
  }
  const totalCost = subtotal + handlingFee + deliveryFee - discountAmount;

  return (
    <main className="page-content-booking container">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Satu Langkah Lagi!</h2>
        <p className="text-muted">
          Konfirmasi detail pesanan Anda di bawah ini.
        </p>
      </div>
      <div className="booking-ticket">
        <div className="ticket-main">
          <div className="ticket-header">
            <h5 className="ticket-eyebrow">STRIDEBASE SERVICE TICKET</h5>
            <h3 className="ticket-store-name">{storeName}</h3>
          </div>
          <div className="ticket-body">
            <div className="ticket-section">
              <span className="ticket-label">Layanan</span>
              <span className="ticket-value">
                {serviceDetails.name} ({serviceDetails.shoeType})
              </span>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Pengantaran</span>
              <span className="ticket-value">
                {deliveryOption === "pickup"
                  ? "Antar Jemput"
                  : "Langsung ke Toko"}
              </span>
            </div>
            {selectedAddress && (
              <div className="ticket-section ticket-address">
                <span className="ticket-label">Alamat Jemput</span>
                <span className="ticket-value small">
                  {selectedAddress.recipientName}, {selectedAddress.street},{" "}
                  {selectedAddress.city}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="ticket-stub">
          <div className="stub-promo-section">
            <h6 className="promo-title">Gunakan Voucher</h6>
            <div className="promo-input-wrapper">
              <input
                type="text"
                className="form-control"
                placeholder="Kode Voucher"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => handleApplyPromo()}
              >
                Pakai
              </button>
            </div>
            {appliedPromo && (
              <div className="text-success small mt-2">
                <i className="fas fa-check-circle me-1"></i> Diskon Rp{" "}
                {discountAmount.toLocaleString("id-ID")} diterapkan!
              </div>
            )}
            {promoError && (
              <div className="text-danger small mt-2">
                <i className="fas fa-exclamation-triangle me-1"></i>{" "}
                {promoError}
              </div>
            )}
          </div>
          <div className="stub-price">
            <span className="price-label">Total Bayar</span>
            <span className="price-amount">
              Rp {totalCost.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={handleConfirmAndPay}
            className="btn btn-dark btn-block btn-confirm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default BookingConfirmationPage;