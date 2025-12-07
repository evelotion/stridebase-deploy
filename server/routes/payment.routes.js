// File: server/routes/payment.routes.js

import express from "express";
import {
  createPaymentGatewayTransaction,
  handleMidtransNotification,
  getPaymentStatus,
  confirmPaymentSimulation // Import fungsi baru
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Buat Transaksi (Otomatis pilih Midtrans atau Simulasi via Env)
router.post(
  "/create-transaction",
  authenticateToken,
  createPaymentGatewayTransaction
);

// Endpoint Konfirmasi Simulasi (Dipanggil dari HP)
// Tidak perlu auth token user karena dibuka di device berbeda (QR scan)
router.post("/confirm-simulation/:bookingId", confirmPaymentSimulation);

// Webhook Midtrans
router.post("/midtrans-notification", handleMidtransNotification);

// Cek Status
router.get("/status/:bookingId", authenticateToken, getPaymentStatus);

export default router;