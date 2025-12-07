// File: server/controllers/payment.controller.js

import midtransClient from "midtrans-client";
import prisma from "../config/prisma.js";
import { getIO } from "../socket.js";

// Konstanta Biaya Aplikasi
const HANDLING_FEE = 2000;

// Inisialisasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Mode Pembayaran (Simulation / Midtrans)
const PAYMENT_MODE = process.env.PAYMENT_MODE || "simulation";

/**
 * @desc    Buat Transaksi (Booking atau Invoice)
 * @route   POST /api/payment/create-transaction
 */
export const createPaymentGatewayTransaction = async (req, res, next) => {
  try {
    const { bookingId, invoiceId } = req.body;
    const userId = req.user.id;

    let transactionDetails = {};
    let customerDetails = {};
    let itemDetails = [];
    let customField1 = ""; // Penanda tipe transaksi (BOOKING / INVOICE)

    // --- SKENARIO A: PEMBAYARAN BOOKING ---
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { store: true, user: true, service: true },
      });

      if (!booking)
        return res.status(404).json({ message: "Pesanan tidak ditemukan." });
      if (booking.userId !== userId)
        return res.status(403).json({ message: "Akses ditolak." });

      // Cek status
      if (["confirmed", "completed", "in_progress"].includes(booking.status)) {
        return res.status(400).json({ message: "Pesanan ini sudah dibayar." });
      }
      if (booking.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Pesanan ini sudah dibatalkan." });
      }
      if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
        return res.status(400).json({ message: "Pesanan kedaluwarsa." });
      }

      // Setup Data Midtrans
      transactionDetails = {
        order_id: booking.id,
        gross_amount: booking.totalPrice,
      };
      customerDetails = {
        first_name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || "08123456789",
      };
      itemDetails = [
        {
          id: booking.service.id,
          price: booking.service.price,
          quantity: 1,
          name: booking.service.name.substring(0, 50),
          merchant_name: booking.store.name.substring(0, 50),
        },
      ];
      // Handling fee bisa ditambahkan sebagai item terpisah jika mau,
      // tapi pastikan totalnya match dengan gross_amount.

      customField1 = "BOOKING";
    }

    // --- SKENARIO B: PEMBAYARAN INVOICE (KONTRAK) ---
    else if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { store: { include: { owner: true } } },
      });

      if (!invoice)
        return res.status(404).json({ message: "Tagihan tidak ditemukan." });
      if (invoice.status === "PAID")
        return res.status(400).json({ message: "Tagihan ini sudah lunas." });

      // Validasi Pemilik
      if (invoice.store.ownerId !== userId)
        return res.status(403).json({ message: "Bukan tagihan Anda." });

      // Setup Data Midtrans
      transactionDetails = {
        order_id: invoice.id,
        gross_amount: invoice.totalAmount,
      };
      customerDetails = {
        first_name: invoice.store.owner.name,
        email: invoice.store.owner.email,
        phone: invoice.store.owner.phone || "08123456789",
      };
      itemDetails = [
        {
          id: "INV-CONTRACT",
          price: invoice.totalAmount,
          quantity: 1,
          name: `Invoice #${invoice.invoiceNumber}`.substring(0, 50),
        },
      ];

      customField1 = "INVOICE";
    } else {
      return res
        .status(400)
        .json({
          message: "Data tidak valid (Butuh bookingId atau invoiceId).",
        });
    }

    // --- MODE SIMULASI ---
    if (PAYMENT_MODE === "simulation") {
      return res.status(200).json({
        paymentMethod: "simulation",
        message: "Redirecting to simulation",
        token: "dummy-token",
        // Redirect ke halaman simulasi dengan tipe yang sesuai
        redirectUrl: `${process.env.FRONTEND_URL}/payment-simulation/${
          bookingId || invoiceId
        }?type=${customField1.toLowerCase()}`,
      });
    }

    // --- MODE MIDTRANS ---
    const parameter = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      custom_field1: customField1, // Metadata untuk webhook
    };

    const transaction = await snap.createTransaction(parameter);

    res.status(200).json({
      paymentMethod: "midtrans",
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Konfirmasi Pembayaran Simulasi
 * @route   POST /api/payment/confirm-simulation/:id
 */
export const confirmPaymentSimulation = async (req, res, next) => {
  const { id } = req.params; // ID bisa Booking ID atau Invoice ID
  const { type } = req.body; // "booking" atau "invoice"

  try {
    // 1. Jika Pembayaran Invoice
    if (type === "invoice") {
      const invoice = await prisma.invoice.findUnique({ where: { id } });
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
      if (invoice.status === "PAID")
        return res.status(200).json({ message: "Already paid" });

      await prisma.$transaction(async (tx) => {
        // Update Status Invoice
        await tx.invoice.update({
          where: { id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            payment: {
              create: {
                amount: invoice.totalAmount,
                status: "paid",
                paymentMethod: "simulation",
                midtransOrderId: `SIM-INV-${id}-${Date.now()}`,
              },
            },
          },
        });

        // Catat Pendapatan Platform (Kontrak Fee)
        await tx.ledgerEntry.create({
          data: {
            storeId: invoice.storeId,
            amount: invoice.totalAmount,
            type: "CONTRACT_FEE",
            description: `Pembayaran Kontrak ${invoice.invoiceNumber}`,
          },
        });
      });

      // Notifikasi Realtime
      try {
        const io = getIO();
        io.emit("payment_confirmed", { id, status: "success" });
      } catch (e) {}

      return res.json({ message: "Invoice Paid Successfully" });
    }

    // 2. Jika Pembayaran Booking (Default)
    else {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { store: true },
      });

      if (!booking)
        return res.status(404).json({ message: "Booking not found" });
      if (["confirmed", "in_progress", "completed"].includes(booking.status)) {
        return res.status(200).json({ message: "Already paid" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update Booking
        const updatedBooking = await tx.booking.update({
          where: { id },
          data: {
            status: "confirmed",
            payment: {
              create: {
                amount: booking.totalPrice,
                status: "paid",
                paymentMethod: "simulation",
                midtransOrderId: `SIM-${booking.id}-${Date.now()}`,
              },
            },
          },
        });

        // LOGIKA KEUANGAN: Split Income
        await calculateAndRecordIncome(
          tx,
          booking.store,
          booking.id,
          booking.totalPrice
        );

        return updatedBooking;
      });

      try {
        const io = getIO();
        io.emit("payment_confirmed", { bookingId: id, status: "success" });
      } catch (e) {}

      return res.json({
        message: "Booking Paid Successfully",
        booking: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Webhook Handler Midtrans
 * @route   POST /api/payment/midtrans-notification
 */
export const handleMidtransNotification = async (req, res, next) => {
  try {
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(
      notificationJson
    );

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const grossAmount = parseFloat(statusResponse.gross_amount);
    const customField1 = statusResponse.custom_field1; // "BOOKING" atau "INVOICE"

    // Helper cek sukses
    const isSuccess =
      (transactionStatus === "capture" && fraudStatus === "accept") ||
      transactionStatus === "settlement";
    const isFailure = ["cancel", "deny", "expire"].includes(transactionStatus);

    if (isSuccess) {
      // Handle Sukses
      if (customField1 === "INVOICE") {
        // Logic Invoice
        await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.update({
            where: { id: orderId }, // Asumsi orderId = invoiceId
            data: {
              status: "PAID",
              paidAt: new Date(),
              payment: {
                create: {
                  amount: grossAmount,
                  status: "paid",
                  paymentMethod: "midtrans",
                  midtransOrderId: orderId,
                  midtransToken: statusResponse.transaction_id,
                },
              },
            },
          });
          // Ledger Platform
          await tx.ledgerEntry.create({
            data: {
              storeId: invoice.storeId,
              amount: grossAmount,
              type: "CONTRACT_FEE",
              description: `Pembayaran Kontrak Midtrans ${invoice.invoiceNumber}`,
            },
          });
        });
      } else {
        // Logic Booking (Default)
        const booking = await prisma.booking.findUnique({
          where: { id: orderId },
        });
        if (booking && booking.status !== "confirmed") {
          await processSuccessfulBookingPayment(
            booking,
            statusResponse,
            grossAmount
          );
        }
      }

      // Emit Socket
      try {
        const io = getIO();
        io.emit("payment_confirmed", { id: orderId, status: "success" });
      } catch (e) {}
    } else if (isFailure) {
      // Handle Gagal
      if (customField1 === "BOOKING" || !customField1) {
        await prisma.booking.update({
          where: { id: orderId },
          data: { status: "cancelled" },
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).send("Server Error");
  }
};

// --- HELPER FUNCTIONS ---

// Logika Pemisahan Uang (Komisi vs Kontrak)
async function calculateAndRecordIncome(tx, store, bookingId, totalAmount) {
  const handlingFee = HANDLING_FEE;
  let platformIncome = 0;
  let partnerIncome = 0;

  if (store.billingType === "CONTRACT") {
    // MODEL KONTRAK: Platform hanya ambil Handling Fee
    platformIncome = handlingFee;
    partnerIncome = totalAmount - handlingFee;

    await tx.ledgerEntry.create({
      data: {
        storeId: store.id,
        bookingId: bookingId,
        amount: platformIncome,
        type: "PLATFORM_FEE",
        description: `Biaya Aplikasi (Kontrak)`,
      },
    });
  } else {
    // MODEL KOMISI: Platform ambil (Komisi% + Handling Fee)
    const commissionRate = store.commissionRate || 10;
    const commissionAmount = Math.round(
      ((totalAmount - handlingFee) * commissionRate) / 100
    );

    platformIncome = commissionAmount + handlingFee;
    partnerIncome = totalAmount - platformIncome;

    await tx.ledgerEntry.create({
      data: {
        storeId: store.id,
        bookingId: bookingId,
        amount: commissionAmount,
        type: "COMMISSION",
        description: `Komisi ${commissionRate}%`,
      },
    });
    await tx.ledgerEntry.create({
      data: {
        storeId: store.id,
        bookingId: bookingId,
        amount: handlingFee,
        type: "PLATFORM_FEE",
        description: `Biaya Aplikasi`,
      },
    });
  }

  // Catat Pendapatan Mitra di Ledger
  await tx.ledgerEntry.create({
    data: {
      storeId: store.id,
      bookingId: bookingId,
      amount: partnerIncome,
      type: "PARTNER_INCOME",
      description: `Pendapatan Bersih Pesanan`,
    },
  });

  // UPDATE WALLET MITRA (Tambah Saldo Real)
  await tx.storeWallet.upsert({
    where: { storeId: store.id },
    update: { balance: { increment: partnerIncome } },
    create: { storeId: store.id, balance: partnerIncome },
  });

  // UPDATE PLATFORM EARNINGS (Statistik Admin)
  await tx.platformEarning.create({
    data: {
      bookingId: bookingId,
      storeId: store.id,
      earnedAmount: platformIncome,
    },
  });
}

// Helper Booking Midtrans
async function processSuccessfulBookingPayment(
  booking,
  paymentDetails,
  grossAmount
) {
  await prisma.$transaction(async (tx) => {
    // Update Booking
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "confirmed",
        payment: {
          create: {
            amount: parseFloat(grossAmount),
            status: "paid",
            paymentMethod: paymentDetails.payment_type || "midtrans",
            midtransOrderId: paymentDetails.order_id,
            midtransToken: paymentDetails.transaction_id,
          },
        },
      },
    });

    // Split Dana
    const store = await tx.store.findUnique({ where: { id: booking.storeId } });
    await calculateAndRecordIncome(
      tx,
      store,
      booking.id,
      parseFloat(grossAmount)
    );
  });
}

// Cek Status Pembayaran (Untuk Polling Frontend)
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: userId },
      include: { payment: true },
    });

    if (!booking)
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });

    res.status(200).json({
      status: booking.status,
      paymentStatus: booking.payment ? booking.payment.status : "unpaid",
      details: booking.payment,
    });
  } catch (error) {
    next(error);
  }
};
