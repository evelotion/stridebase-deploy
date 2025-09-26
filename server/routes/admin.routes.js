// File: server/routes/admin.routes.js (Versi Final Lengkap & Perbaikan)

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
  getStoreInvoices,
  checkExistingInvoice,
  getInvoiceByIdForAdmin,
  validatePromoCode // <-- FUNGSI BARU DIIMPOR
} from "../controllers/admin.controller.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware Autentikasi dan Otorisasi untuk semua rute admin
router.use(authenticateToken, checkRole(["admin", "developer"]));

// Dashboard & Statistik
router.get("/stats", getAdminStats);

// Manajemen Pengguna
router.get("/users", getAllUsers);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", changeUserStatus);

// Manajemen Toko
router.get("/stores", getAllStores);
router.post("/stores/new", createStoreByAdmin);
router.patch("/stores/:id/status", updateStoreStatus);
router.get("/stores/:storeId/settings", getStoreSettingsForAdmin);
router.put("/stores/:storeId/settings", updateStoreSettingsByAdmin);
router.post("/stores/upload-photo", upload.single("photo"), uploadAdminPhoto);

// Manajemen Invoice (Tagihan)
router.get("/stores/:storeId/invoices", getStoreInvoices);
router.post("/stores/:storeId/invoices/check", checkExistingInvoice);
router.post("/stores/:storeId/invoices/preview", previewStoreInvoice);
router.post("/stores/:storeId/invoices", createStoreInvoice);
router.get("/invoices/:invoiceId", getInvoiceByIdForAdmin);

// Manajemen Payouts (Penarikan Dana)
router.get("/payout-requests", getPayoutRequests);
router.patch("/payout-requests/:id/resolve", resolvePayoutRequest);

// Manajemen Booking (Pesanan)
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Manajemen Ulasan
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

// Laporan
router.get("/reports", getReportData);

// Pengaturan Operasional
router.get("/settings", getOperationalSettings);
router.post("/settings", updateOperationalSettings);

// Manajemen Banner
router.get("/banners", getAllBannersForAdmin);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

// RUTE BARU DITAMBAHKAN DI SINI UNTUK VALIDASI PROMO
router.post("/promos/validate", validatePromoCode);


export default router;