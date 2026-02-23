

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
  getPartnerPromos,
  createPartnerPromo,
  updatePartnerPromo,
  deletePartnerPromo,
  getWalletData,
  requestPayout,
  getPartnerReports,
  getOutstandingInvoices,
} from "../controllers/partner.controller.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.use(authenticateToken, checkRole(["mitra"]));
router.use(findMyStore);


router.get("/dashboard", getPartnerDashboard);


router.get("/orders", getPartnerOrders);
router.patch("/orders/:bookingId/work-status", updateWorkStatus);


router.get("/services", getPartnerServices);
router.post("/services", createPartnerService);
router.put("/services/:serviceId", updatePartnerService);
router.delete("/services/:serviceId", deletePartnerService);


router.get("/settings", getPartnerSettings);
router.put("/settings", updatePartnerSettings);

router.post("/upload-photo", upload.single("photo"), uploadPartnerPhoto);


router.get("/reviews", getPartnerReviews);
router.post("/reviews/:reviewId/reply", replyToReview);


router.get("/promos", getPartnerPromos);
router.post("/promos", createPartnerPromo);
router.put("/promos/:promoId", updatePartnerPromo);
router.delete("/promos/:promoId", deletePartnerPromo);


router.get("/wallet", getWalletData);
router.post("/payout-requests", requestPayout);
router.get("/invoices/outstanding", getOutstandingInvoices);
router.get("/reports", getPartnerReports);

export default router;
