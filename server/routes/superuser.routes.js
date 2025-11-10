// File: server/routes/superuser.routes.js (Lengkap)

import express from "express";
import {
  authenticateToken,
  checkRole,
} from "../middleware/authenticateToken.js";
import {
  getGlobalConfig,
  updateGlobalConfig,
  reseedDatabase,
  getApprovalRequests,
  resolveApprovalRequest,
  getSecurityLogs,
  updateHomePageTheme,
  uploadDeveloperAsset,
} from "../controllers/superuser.controller.js";
import multer from "multer"; // <-- IMPOR MULTER


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware ini akan berlaku untuk semua rute di bawah
router.use(authenticateToken, checkRole(["developer"]));

// Config Management
router.get("/config", getGlobalConfig);
router.post("/config", updateGlobalConfig);

// Approval Management
router.get("/approval-requests", getApprovalRequests);
router.post("/approval-requests/:id/resolve", resolveApprovalRequest);

// Security Log Management
router.get("/security-logs", getSecurityLogs);

// Maintenance
router.post("/maintenance/reseed-database", reseedDatabase);

// <-- TAMBAHKAN ROUTE BARU DI SINI -->
// Theme Management
router.put("/settings/homepage-theme", updateHomePageTheme);

router.post("/upload-asset", upload.single("asset"), uploadDeveloperAsset);

export default router;