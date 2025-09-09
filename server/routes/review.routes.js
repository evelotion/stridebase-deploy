// File: server/routes/review.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { createReview } from '../controllers/review.controller.js';

const router = express.Router();

// Hanya membuat ulasan yang memerlukan login
router.post('/', authenticateToken, createReview);

export default router;