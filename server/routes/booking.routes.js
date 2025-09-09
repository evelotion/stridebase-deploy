// File: server/routes/booking.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { createBooking, getBookingById } from '../controllers/booking.controller.js';

const router = express.Router();

// Semua route booking memerlukan login
router.use(authenticateToken);

router.post('/', createBooking);
router.get('/:id', getBookingById);

export default router;