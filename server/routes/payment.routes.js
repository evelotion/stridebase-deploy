

import express from "express";
import {
  createPaymentGatewayTransaction,
  handleMidtransNotification,
  getPaymentStatus,
  confirmPaymentSimulation
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();


router.post(
  "/create-transaction",
  authenticateToken,
  createPaymentGatewayTransaction
);



router.post("/confirm-simulation/:bookingId", confirmPaymentSimulation);


router.post("/midtrans-notification", handleMidtransNotification);


router.get("/status/:bookingId", authenticateToken, getPaymentStatus);

export default router;