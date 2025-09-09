// File: server/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { uploadReviewImage } from '../controllers/upload.controller.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Semua rute upload memerlukan login
router.use(authenticateToken);

router.post('/review', upload.single('image'), uploadReviewImage);

export default router;