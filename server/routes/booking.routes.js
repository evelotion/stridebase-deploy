import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getActiveBooking, // <-- Pastikan method baru ini di-import
} from "../controllers/booking.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// Public routes (none for now)

// Protected routes (User must be logged in)
router.post("/", authenticateToken, createBooking);
router.get("/user/me", authenticateToken, getUserBookings);

// --- RUTE BARU: Widget Live Activity (Mobile) ---
// Letakkan SEBELUM rute /:id agar tidak tertukar
router.get("/active/latest", authenticateToken, getActiveBooking);
// ------------------------------------------------

router.get("/:id", authenticateToken, getBookingById);
router.put("/:id/cancel", authenticateToken, cancelBooking);

export default router;