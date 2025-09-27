// File: server/routes/payment.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { createPaymentTransaction, paymentNotificationHandler, confirmPaymentSimulation } from '../controllers/payment.controller.js';

const router = express.Router();

// Membuat transaksi (perlu login)
router.post('/create-transaction', authenticateToken, createPaymentTransaction);

// Menerima notifikasi dari payment gateway (tidak perlu login)
router.post('/notification', paymentNotificationHandler);

// PERUBAHAN: Hapus 'authenticateToken' dari baris di bawah ini
router.post('/confirm-simulation/:bookingId', confirmPaymentSimulation);

export default router;