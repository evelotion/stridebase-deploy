import express from "express";
import {
  createPaymentGatewayTransaction,
  handleMidtransNotification,
  getPaymentStatus,
} from "../controllers/payment.controller.js";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Membuat token transaksi Midtrans untuk sebuah booking
router.post(
  "/create-transaction",
  authenticateToken,
  createPaymentGatewayTransaction
);

// Menerima notifikasi webhook dari Midtrans
router.post("/midtrans-notification", handleMidtransNotification);

// Mengecek status pembayaran sebuah booking
router.get("/status/:bookingId", authenticateToken, getPaymentStatus);

export default router;
