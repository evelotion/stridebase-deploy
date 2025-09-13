// File: server/routes/auth.routes.js (Versi Diperbarui)

import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { handleValidationErrors } from '../middleware/handleValidationErrors.js'; // <-- 1. IMPOR MIDDLEWARE BARU

const router = express.Router();

// Validasi pendaftaran yang lebih ketat
const registerValidation = [
  body('email', 'Format email tidak valid.').isEmail().normalizeEmail(),
  body('name', 'Nama tidak boleh kosong.').notEmpty().trim().escape(),
  body('password', 'Password minimal harus 8 karakter.').isLength({ min: 8 }),
];

// Definisi Routes
router.post(
    '/register', 
    registerValidation,         // <-- 2. Aturan validasi
    handleValidationErrors,     // <-- 3. Middleware untuk menangani error
    registerUser                // <-- 4. Controller hanya akan berjalan jika tidak ada error
);

router.post('/login', loginLimiter, loginUser);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;