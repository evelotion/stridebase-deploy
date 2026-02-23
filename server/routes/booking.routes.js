import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getActiveBooking,
} from "../controllers/booking.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();




router.post("/", authenticateToken, createBooking);
router.get("/user/me", authenticateToken, getUserBookings);



router.get("/active/latest", authenticateToken, getActiveBooking);


router.get("/:id", authenticateToken, getBookingById);
router.put("/:id/cancel", authenticateToken, cancelBooking);

export default router;