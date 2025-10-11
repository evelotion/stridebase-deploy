// File: server/routes/user.routes.js (Kode Lengkap Sesuai File Anda)

import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
  getNotifications,
  markNotificationsAsRead,
  getLoyaltyData,
  redeemLoyaltyPoints,
  getRedeemedPromos,
  getRecommendations,
} from "../controllers/user.controller.js";
import { getUserBookings } from "../controllers/booking.controller.js"; // Impor dari controller booking

const router = express.Router();

// Terapkan middleware authenticateToken ke semua route di file ini
router.use(authenticateToken);

// Profile
router.put("/profile", updateUserProfile);

// Addresses
router.get("/addresses", getUserAddresses);
router.post("/addresses", addUserAddress);
router.delete("/addresses/:id", deleteUserAddress);

// Bookings
router.get("/bookings", getUserBookings); // Mengambil semua booking milik user

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications/mark-read", markNotificationsAsRead);

// Loyalty
router.get("/loyalty", getLoyaltyData);
router.post("/loyalty/redeem", redeemLoyaltyPoints);
router.get("/redeemed-promos", getRedeemedPromos);

// Recommendations
router.get("/recommendations", getRecommendations);

export default router;
