// File: server/controllers/payment.controller.js (MODIFIKASI LENGKAP)
import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";
import { snap } from "../config/midtrans.js"; // Impor Midtrans Snap

// @desc    Create a payment transaction for a booking
// @route   POST /api/payments/create-transaction
export const createPaymentTransaction = async (req, res, next) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID dibutuhkan." });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }, // Ambil data user untuk detail pelanggan
    });

    if (!booking || booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Booking tidak ditemukan atau akses ditolak." });
    }

    const order_id = `BOOK-${booking.id}-${Date.now()}`;

    // Cek mode pembayaran dari environment variable
    if (process.env.PAYMENT_GATEWAY_MODE === "simulation") {
      // --- LOGIKA LAMA (SIMULASI) ---
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          midtransOrderId: order_id,
          amount: booking.totalPrice,
          status: "pending",
          paymentMethod: "Simulasi",
        },
      });

      // Arahkan ke halaman simulasi lama di frontend
      res.json({
        paymentMethod: "simulation",
        bookingId: booking.id,
      });
    } else {
      // --- LOGIKA BARU (MIDTRANS) ---
      const parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: booking.totalPrice,
        },
        customer_details: {
          first_name: booking.user.name,
          email: booking.user.email,
        },
        callbacks: {
          finish: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-finish`,
        },
      };

      const transaction = await snap.createTransaction(parameter);

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          midtransOrderId: order_id,
          amount: booking.totalPrice,
          status: "pending",
          midtransToken: transaction.token,
          paymentMethod: "Midtrans",
        },
      });

      // Kirim token ke frontend untuk dibuka oleh Snap
      res.json({
        paymentMethod: "midtrans",
        token: transaction.token,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook handler for payment notifications from Midtrans
// @route   POST /api/payments/notification
export const paymentNotificationHandler = async (req, res, next) => {
  try {
    // Gunakan snap.notification untuk memverifikasi notifikasi secara aman
    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Menerima notifikasi dari Midtrans untuk Order ID: ${orderId} - Status: ${transactionStatus}`
    );

    const payment = await prisma.payment.findUnique({
      where: { midtransOrderId: orderId },
    });
    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // Ambil status booking saat ini
    const currentBooking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });
    let newPaymentStatus = payment.status;
    let newBookingStatus = currentBooking.status;

    // Logika update status berdasarkan notifikasi Midtrans
    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      if (fraudStatus == "accept") {
        newPaymentStatus = "paid";
        newBookingStatus = "confirmed";
      }
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newPaymentStatus = "failed";
      newBookingStatus = "cancelled";
    }

    // Lakukan update hanya jika ada perubahan status
    if (newPaymentStatus !== payment.status) {
      await prisma.payment.update({
        where: { midtransOrderId: orderId },
        data: { status: newPaymentStatus },
      });
    }

    if (newBookingStatus !== currentBooking.status) {
      const updatedBooking = await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: newBookingStatus },
        include: { store: true },
      });

      // Kirim notifikasi ke pemilik toko jika pembayaran berhasil
      if (newBookingStatus === "confirmed") {
        await createNotificationForUser(
          updatedBooking.store.ownerId,
          `Pesanan #${updatedBooking.id.substring(
            0,
            8
          )} telah dibayar dan dikonfirmasi.`,
          `/partner/orders`
        );
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error.message);
    // Jangan teruskan ke 'next(error)' standar agar Midtrans menerima respons yang benar
    res.status(500).send({ message: error.message });
  }
};

// @desc    Confirm a booking payment after successful simulation (TIDAK BERUBAH)
// @route   POST /api/payments/confirm-simulation/:bookingId
export const confirmPaymentSimulation = async (req, res, next) => {
  const { bookingId } = req.params;
  const io = req.io;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { store: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    if (booking.status === "pending") {
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" },
      });

      if (io) {
        io.emit("payment_confirmed", { bookingId: updatedBooking.id });
        console.log(
          `Socket event 'payment_confirmed' dipancarkan untuk booking ${updatedBooking.id}`
        );
      }

      await createNotificationForUser(
        booking.store.ownerId,
        `Pesanan #${booking.id.substring(
          0,
          8
        )} telah dibayar dan dikonfirmasi.`,
        `/partner/orders`
      );

      res.json({
        message: "Pembayaran berhasil dikonfirmasi.",
        booking: updatedBooking,
      });
    } else {
      res
        .status(200)
        .json({ message: "Status pesanan ini sudah diproses sebelumnya." });
    }
  } catch (error) {
    next(error);
  }
};
