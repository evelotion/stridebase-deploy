

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
import { getUserBookings } from "../controllers/booking.controller.js";

const router = express.Router();


router.use(authenticateToken);


router.put("/profile", updateUserProfile);


router.get("/addresses", getUserAddresses);
router.post("/addresses", addUserAddress);
router.delete("/addresses/:id", deleteUserAddress);


router.get("/bookings", getUserBookings);


router.get("/notifications", getNotifications);
router.post("/notifications/mark-read", markNotificationsAsRead);


router.get("/loyalty", getLoyaltyData);
router.post("/loyalty/redeem", redeemLoyaltyPoints);
router.get("/redeemed-promos", getRedeemedPromos);


router.get("/recommendations", getRecommendations);

export default router;
