// File: server/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { uploadReviewImage } from '../controllers/upload.controller.js';

const router = express.Router();

// --- UPDATE KEAMANAN (Phase 1.1) ---
// Membatasi ukuran file max 2MB dan filter tipe file
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Batas 2MB (dalam bytes)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
    }
});

router.use(authenticateToken);

// Tambahkan middleware error handling khusus untuk multer
router.post('/review', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Error dari Multer (misal: File too large)
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            // Error dari fileFilter
            return res.status(400).json({ message: err.message });
        }
        // Lanjut ke controller jika aman
        next();
    });
}, uploadReviewImage);

export default router;