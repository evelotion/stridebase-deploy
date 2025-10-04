// File: server/controllers/payment.controller.js (Perbaikan Final v3)

import prisma from "../config/prisma.js";
import { snap } from "../config/midtrans.js";
import { createNotificationForUser } from "../socket.js";

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
      include: {
        user: true,
        service: true,
        address: true, // Sertakan data alamat untuk mendapatkan nomor telepon
      },
    });

    if (!booking || booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Booking tidak ditemukan atau akses ditolak." });
    }

    const order_id = `BOOK-${booking.id}-${Date.now()}`;

    if (process.env.PAYMENT_GATEWAY_MODE === "simulation") {
      // Logika simulasi (tidak berubah)
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          midtransOrderId: order_id,
          amount: booking.totalPrice,
          status: "pending",
          paymentMethod: "Simulasi",
        },
      });
      res.json({ paymentMethod: "simulation", bookingId: booking.id });
    } else {
      // --- LOGIKA MIDTRANS YANG DIPERBAIKI SECARA TOTAL ---
      const nameParts = booking.user.name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const parameter = {
        transaction_details: {
          order_id: order_id,
          // 1. Gunakan total harga final dari booking sebagai sumber kebenaran
          gross_amount: Math.round(booking.totalPrice),
        },
        // 2. Buat item_details menjadi satu baris saja yang nilainya PASTI SAMA dengan gross_amount
        item_details: [
          {
            id: booking.serviceId,
            price: Math.round(booking.totalPrice), // Harganya adalah total harga akhir
            quantity: 1,
            name: `Layanan: ${booking.serviceName}`, // Deskripsi umum
          },
        ],
        customer_details: {
          first_name: firstName,
          last_name: lastName,
          email: booking.user.email,
          phone: booking.address?.phoneNumber, // Tambahkan nomor telepon jika ada
        },
        callbacks: {
          finish: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-finish`,
        },
      };

      const transaction = await snap.createTransaction(parameter);
      // --- AKHIR PERBAIKAN ---

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

// @desc    Webhook handler for payment notifications from Midtrans
// @route   POST /api/payments/notification
export const paymentNotificationHandler = async (req, res, next) => {
  try {
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

    const currentBooking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });
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
