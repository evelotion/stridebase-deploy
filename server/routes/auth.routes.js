// File: server/routes/auth.routes.js (Perbaikan)

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
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Rute Otentikasi
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/superuser-login", superuserLogin);

// Rute Profil Pengguna (membutuhkan token)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Rute Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.redirect(
      `${
        process.env.CLIENT_URL
      }/login-success?token=${token}&user=${encodeURIComponent(
        JSON.stringify(user)
      )}`
    );
  }
);

export default router;
