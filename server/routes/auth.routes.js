// File: server/routes/auth.routes.js (Dengan Perbaikan Nama Impor)

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
} from "../controllers/auth.controller.js";
// --- PERBAIKAN DI SINI ---
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/register", registerUser);
// Menggunakan loginRateLimiter sebelum loginUser
router.post("/login", loginRateLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authenticateToken, getProfile);

export default router;
