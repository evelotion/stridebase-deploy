
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { createReview } from '../controllers/review.controller.js';

const router = express.Router();


router.post('/', authenticateToken, createReview);

export default router;