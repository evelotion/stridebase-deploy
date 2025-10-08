// File: server/routes/partner.routes.js (Dengan Perbaikan)

import express from "express";
import {
  authenticateToken,
  checkRole,
} from "../middleware/authenticateToken.js";
import {
  findMyStore,
  getPartnerDashboard,
  getPartnerOrders,
  updateWorkStatus,
  getPartnerServices,
  createPartnerService,
  updatePartnerService,
  deletePartnerService,
  getPartnerSettings,
  updatePartnerSettings,
  uploadPartnerPhoto,
  getPartnerReviews,
  replyToReview,
  getPartnerPromos, // <-- 1. IMPOR FUNGSI BARU DI SINI
   createPartnerPromo, // <-- Impor fungsi baru
    updatePartnerPromo, // <-- Impor fungsi baru
    deletePartnerPromo, // <-- Impor fungsi baru
  getWalletData,
  requestPayout,
  getPartnerReports,
  getOutstandingInvoices,
} from "../controllers/partner.controller.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware ini akan berlaku untuk semua rute di bawah
router.use(authenticateToken, checkRole(["mitra"]));
router.use(findMyStore); // Middleware ini akan mencari & melampirkan data toko ke request

// Dashboard
router.get("/dashboard", getPartnerDashboard);

// Orders
router.get("/orders", getPartnerOrders);
router.patch("/orders/:bookingId/work-status", updateWorkStatus);

// Services
router.get("/services", getPartnerServices);
router.post("/services", createPartnerService);
router.put("/services/:serviceId", updatePartnerService);
router.delete("/services/:serviceId", deletePartnerService);

// Settings
router.get("/settings", getPartnerSettings);
router.put("/settings", updatePartnerSettings);
router.post("/upload-photo", upload.single("photo"), uploadPartnerPhoto);

// Reviews
router.get("/reviews", getPartnerReviews);
router.post("/reviews/:reviewId/reply", replyToReview);

// --- 2. TAMBAHKAN RUTE BARU DI SINI ---
// Promos
router.get('/promos', getPartnerPromos);
router.post('/promos', createPartnerPromo);
router.put('/promos/:promoId', updatePartnerPromo);
router.delete('/promos/:promoId', deletePartnerPromo);
// ------------------------------------

// Wallet & Payouts
router.get("/wallet", getWalletData);
router.post("/payout-requests", requestPayout);
router.get("/invoices/outstanding", getOutstandingInvoices);
router.get("/reports", getPartnerReports);

export default router;
