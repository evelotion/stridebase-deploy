import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const BookingConfirmationPage = ({ showMessage }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [redeemedPromos, setRedeemedPromos] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedBooking = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Sesi Anda telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    const fetchRedeemedPromos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/redeemed-promos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRedeemedPromos(data);
        }
      } catch (err) {
        console.error("Gagal mengambil promo:", err);
      }
    };

    fetchRedeemedPromos();

    if (savedBooking) {
      const bookingData = JSON.parse(savedBooking);
       if (!bookingData.storeId || !bookingData.service) {
        showMessage("Detail layanan tidak lengkap. Silakan ulangi proses pemesanan.");
        navigate(`/store/${bookingData.storeId || ""}`);
        return;
      }
      if (bookingData.deliveryOption === "pickup" && !bookingData.addressId) {
        showMessage("Alamat penjemputan belum dipilih. Silakan lengkapi detail pesanan Anda.");
        navigate(`/store/${bookingData.storeId}`);
        return;
      }
      if (bookingData.schedule && bookingData.schedule.date) {
        bookingData.schedule.date = new Date(bookingData.schedule.date);
      }
      setBookingDetails(bookingData);

      if (bookingData.deliveryOption === "pickup" && bookingData.addressId) {
        const fetchAddress = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/user/addresses`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const addresses = await res.json();
              const foundAddress = addresses.find(addr => addr.id === bookingData.addressId);
              if (foundAddress) {
                setSelectedAddress(foundAddress);
              }
            } else {
              console.error("Gagal mengambil daftar alamat.");
            }
          } catch (error) {
            console.error("Error fetching address:", error);
          }
        };
        fetchAddress();
      }
    } else {
      showMessage("Tidak ada detail booking ditemukan. Silakan ulangi proses.");
      navigate("/");
    }
  }, [navigate, showMessage]);

  const handleApplyPromoFromModal = (code) => {
    setPromoCode(code);
    setShowPromoModal(false);
    setTimeout(() => {
      handleApplyPromo(code);
    }, 100);
  };

  const handleApplyPromo = async (codeToApply = promoCode) => {
    setPromoError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/promos/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: codeToApply }),
      });
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

     const finalBookingDetails = {
      ...bookingDetails,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(finalBookingDetails),
      });

      const newBookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(newBookingData.message || "Gagal membuat pesanan.");
      }

      const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/create-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: newBookingData.id }),
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Gagal memulai sesi pembayaran.");
      }

      localStorage.removeItem("pendingBooking");
      window.location.href = paymentData.redirectUrl;

    } catch (error) {
      showMessage(error.message);
      setIsSubmitting(false);
    }
  };


  if (!bookingDetails) {
    return (
      <div className="container py-5 text-center">
        <p>Memuat detail booking...</p>
      </div>
    );
  }

  const { storeName, service, shoeType, deliveryOption, schedule } = bookingDetails;
  const handlingFee = 2000;
  const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
  const subtotal = service?.price || 0;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === "percentage") {
      discountAmount = (subtotal * appliedPromo.value) / 100;
    } else {
      discountAmount = appliedPromo.value;
    }
  }

  const totalCost = subtotal + handlingFee + deliveryFee - discountAmount;

  return (
    <main className="page-content-booking container">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Satu Langkah Lagi!</h2>
        <p className="text-muted">
          Pesanan Anda hampir selesai. Konfirmasi detail di "tiket" Anda di bawah ini.
        </p>
      </div>

      <div className="booking-ticket">
        <div className="ticket-main">
          <div className="ticket-header">
            <h5 className="ticket-eyebrow">StrideBase Service Ticket</h5>
            <h3 className="ticket-store-name">{storeName}</h3>
          </div>
          <div className="ticket-body">
            <div className="ticket-section">
              <span className="ticket-label">Layanan</span>
              <span className="ticket-value">{service?.name || 'N/A'} ({shoeType})</span>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Pengantaran</span>
              <span className="ticket-value">{deliveryOption === "pickup" ? "Diambil Kurir" : "Antar Sendiri"}</span>
            </div>
            <div className="ticket-section">
              <span className="ticket-label">Jadwal</span>
              <span className="ticket-value">
                {schedule ? `${schedule.date.toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })} @ ${schedule.time}` : 'Langsung ke Toko'}
              </span>
            </div>
             {selectedAddress && (
              <div className="ticket-section ticket-address">
                <span className="ticket-label">Alamat Jemput</span>
                <span className="ticket-value small">
                  {selectedAddress.recipientName}, {selectedAddress.fullAddress}, {selectedAddress.city}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="ticket-stub">
          <div className="stub-qr">
             <i className="fas fa-qrcode"></i>
             <span className="qr-text">Tunjukkan di Toko</span>
          </div>
           <div className="stub-price">
             <span className="price-label">Total Bayar</span>
             <span className="price-amount">Rp {totalCost.toLocaleString("id-ID")}</span>
           </div>
           <button onClick={handleConfirmAndPay} className="btn btn-primary btn-block btn-confirm" disabled={isSubmitting}>
             {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
           </button>
        </div>
      </div>
    </main>
  );
};

export default BookingConfirmationPage;