// File: server/routes/auth.routes.js (Format ES Modules)

import express from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  superuserLogin,
  getNotifications,
  markNotificationsAsRead,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

// --- Impor tambahan untuk Google Auth ---
import passport from "passport";
import jwt from "jsonwebtoken";
// --- Akhir impor tambahan ---

const router = express.Router();

// Rute yang sudah ada
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/superuser-login", superuserLogin);
router.get("/notifications", authenticateToken, getNotifications);
router.post(
  "/notifications/mark-read",
  authenticateToken,
  markNotificationsAsRead
);

// --- Rute baru untuk Google OAuth ---

// 1. Rute untuk memulai proses login Google
//    Frontend akan mengarahkan pengguna ke '/api/auth/google'
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Rute callback yang akan dipanggil oleh Google setelah user memberikan persetujuan
router.get(
  "/google/callback",
  // Passport akan mencoba menukar kode dari Google dengan profil pengguna
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  // Jika berhasil, fungsi ini akan dijalankan
  (req, res) => {
    // Pengguna yang berhasil diautentikasi ada di req.user
    const user = req.user;

    // Buat JWT token untuk pengguna tersebut
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Redirect pengguna kembali ke frontend, sambil mengirimkan token dan data user
    // Frontend akan menangani token ini di halaman '/login-success'
    res.redirect(
      `${
        process.env.CLIENT_URL
      }/login-success?token=${token}&user=${encodeURIComponent(
        JSON.stringify(user)
      )}`
    );
  }
);
// --- Akhir rute baru ---

export default router;
