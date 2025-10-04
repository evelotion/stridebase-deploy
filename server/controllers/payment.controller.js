// File: server/controllers/payment.controller.js (Perbaikan Final v4 - Lanjutkan Pembayaran)

import prisma from "../config/prisma.js";
import { snap } from "../config/midtrans.js";
import { createNotificationForUser } from "../socket.js";

// @desc    Create or update a payment transaction for a booking
// @route   POST /api/payments/create-transaction
export const createPaymentTransaction = async (req, res, next) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID dibutuhkan." });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        address: true,
      },
    });

    if (!booking || booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Booking tidak ditemukan atau akses ditolak." });
    }

    // Midtrans requires a unique order ID for every transaction attempt
    const order_id = `BOOK-${booking.id}-${Date.now()}`;

    if (process.env.PAYMENT_GATEWAY_MODE === "simulation") {
      // Logic for simulation remains the same, it doesn't create multiple payments.
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId },
      });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            midtransOrderId: order_id,
            amount: booking.totalPrice,
            status: "pending",
            paymentMethod: "Simulasi",
          },
        });
      }
      return res.json({ paymentMethod: "simulation", bookingId: booking.id });
    } else {
      // --- LOGIKA MIDTRANS DENGAN PENANGANAN LANJUTKAN PEMBAYARAN ---
      const nameParts = booking.user.name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: Math.round(booking.totalPrice),
        },
        item_details: [
          {
            id: booking.serviceId,
            price: Math.round(booking.totalPrice),
            quantity: 1,
            name: `Layanan: ${booking.serviceName}`,
          },
        ],
        customer_details: {
          first_name: firstName,
          last_name: lastName,
          email: booking.user.email,
          phone: booking.address?.phoneNumber,
        },
        callbacks: {
          finish: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-finish`,
        },
      };

      const transaction = await snap.createTransaction(parameter);

      // --- PERBAIKAN UTAMA DI SINI ---
      // Cek apakah sudah ada pembayaran untuk booking ini
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId: booking.id },
      });

      if (existingPayment) {
        // JIKA SUDAH ADA: Perbarui token dan order ID yang ada
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            midtransToken: transaction.token,
            midtransOrderId: order_id, // Perbarui dengan order_id baru
          },
        });
      } else {
        // JIKA BELUM ADA: Buat data pembayaran baru
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
      }
      // --- AKHIR PERBAIKAN ---

      res.json({
        paymentMethod: "midtrans",
        token: transaction.token,
      });
    }
  } catch (error) {
    console.error("Midtrans Transaction Creation Error:", error);
    next(error);
  }
};

// ... (sisa controller lainnya tidak berubah)

// @desc    Webhook handler for payment notifications from Midtrans
// @route   POST /api/payments/notification
export const paymentNotificationHandler = async (req, res, next) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const payment = await prisma.payment.findFirst({
      // findFirst untuk keamanan
      where: { midtransOrderId: orderId },
    });
    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    const currentBooking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });
    if (!currentBooking) {
      return res.status(404).send("Booking not found");
    }

    let newPaymentStatus = payment.status;
    let newBookingStatus = currentBooking.status;

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

    // Lakukan update hanya jika ada perubahan status untuk mencegah race condition
    if (newPaymentStatus !== payment.status && payment.status === "pending") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: newPaymentStatus },
      });
    }

    if (
      newBookingStatus !== currentBooking.status &&
      currentBooking.status === "pending"
    ) {
      const updatedBooking = await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: newBookingStatus },
        include: { store: true },
      });

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
    res.status(500).send({ message: error.message });
  }
};

// @desc    Confirm a booking payment after successful simulation
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
