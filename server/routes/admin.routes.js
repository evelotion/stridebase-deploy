

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
  validatePromoCode,
  requestDeleteStore,
  createUserByAdmin,
  getAllPromos,
  createPromo,
  updatePromo,
  changePromoStatus,
  deletePromo,
  requestUserDeletion,
  updateStoreDetailsByAdmin,
  softDeleteUser,
  softDeleteStore,
} from "../controllers/admin.controller.js";
import multer from "multer";

const router = express.Router();



const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Hanya gambar yang diperbolehkan."), false);
    }
  },
});


router.use(authenticateToken, checkRole(["admin", "developer"]));


router.get("/stats", getAdminStats);


router.post("/users", createUserByAdmin);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", changeUserStatus);
router.post("/users/:id/request-deletion", requestUserDeletion);
router.delete("/users/:id", softDeleteUser);


router.get("/stores", getAllStores);
router.post("/stores/new", createStoreByAdmin);
router.patch("/stores/:id/status", updateStoreStatus);
router.patch("/stores/:id/details", updateStoreDetailsByAdmin);
router.get("/stores/:storeId/settings", getStoreSettingsForAdmin);
router.put("/stores/:storeId/settings", updateStoreSettingsByAdmin);


router.post(
  "/stores/upload-photo",
  (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
       
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
       
        return res.status(400).json({ message: err.message });
      }
     
      next();
    });
  },
  uploadAdminPhoto
);

router.post("/stores/:storeId/request-deletion", requestDeleteStore);
router.delete("/stores/:id", softDeleteStore);


router.get("/stores/:storeId/invoices", getStoreInvoices);
router.post("/stores/:storeId/invoices/check", checkExistingInvoice);
router.post("/stores/:storeId/invoices/preview", previewStoreInvoice);
router.post("/stores/:storeId/invoices", createStoreInvoice);
router.get("/invoices/:invoiceId", getInvoiceByIdForAdmin);


router.get("/payout-requests", getPayoutRequests);
router.patch("/payout-requests/:id/resolve", resolvePayoutRequest);


router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);


router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);


router.get("/reports", getReportData);


router.get("/settings", getOperationalSettings);
router.post("/settings", updateOperationalSettings);


router.get("/banners", getAllBannersForAdmin);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);


router.get("/promos", getAllPromos);
router.post("/promos", createPromo);
router.put("/promos/:id", updatePromo);
router.patch("/promos/:id/status", changePromoStatus);
router.delete("/promos/:id", deletePromo);
router.post("/promos/validate", validatePromoCode);

export default router;