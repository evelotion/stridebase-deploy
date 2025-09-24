// File: server/routes/admin.routes.js (Penambahan Rute Riwayat & Cek Invoice)

import express from "express";
import {
  authenticateToken,
  checkRole,
} from "../middleware/authenticateToken.js";
import {
  getAdminStats,
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  getAllStores,
  updateStoreStatus,
  getPayoutRequests,
  resolvePayoutRequest,
  getAllBookings,
  updateBookingStatus,
  getAllReviews,
  deleteReview,
  getReportData,
  getOperationalSettings,
  updateOperationalSettings,
  getStoreSettingsForAdmin,
  updateStoreSettingsByAdmin,
  uploadAdminPhoto,
  createStoreByAdmin,
  getAllBannersForAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  createStoreInvoice,
  previewStoreInvoice,
  getStoreInvoices, // <-- FUNGSI BARU DIIMPOR
  checkExistingInvoice, // <-- FUNGSI BARU DIIMPOR
} from "../controllers/admin.controller.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Autentikasi dan Otorisasi Middleware untuk semua rute di bawah
router.use(authenticateToken, checkRole(["SUPERUSER", "ADMIN"]));

// ... (rute lain dari /stats sampai /stores/upload-photo tidak berubah) ...
router.get("/stats", getAdminStats);
// User Management
router.get("/users", getAllUsers);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", changeUserStatus);
// Store Management
router.get("/stores", getAllStores);
router.post("/stores/new", createStoreByAdmin);
router.patch("/stores/:id/status", updateStoreStatus);
router.get("/stores/:storeId/settings", getStoreSettingsForAdmin);
router.put("/stores/:storeId/settings", updateStoreSettingsByAdmin);
router.post("/stores/upload-photo", upload.single("photo"), uploadAdminPhoto);

// --- PENAMBAHAN DAN MODIFIKASI RUTE INVOICE ---
router.get("/stores/:storeId/invoices", getStoreInvoices); // <-- RUTE BARU: Mengambil riwayat
router.post("/stores/:storeId/invoices/check", checkExistingInvoice); // <-- RUTE BARU: Cek duplikat
router.post("/stores/:storeId/invoices/preview", previewStoreInvoice);
router.post("/stores/:storeId/invoices", createStoreInvoice);

// Payouts
router.get("/payout-requests", getPayoutRequests);
router.patch("/payout-requests/:id/resolve", resolvePayoutRequest);
// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);
// Reviews
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);
// Reports
router.get("/reports", getReportData);
// Operational Settings
router.get("/settings", getOperationalSettings);
router.post("/settings", updateOperationalSettings);
// Banner Management
router.get("/banners", getAllBannersForAdmin);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

export default router;
