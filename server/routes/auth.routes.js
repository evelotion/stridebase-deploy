// File: server/routes/auth.routes.js
import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/rateLimiter.js'; // Kita akan buat file ini

const router = express.Router();

// Validasi pendaftaran
const registerValidation = [
  body('email').isEmail().withMessage('Format email tidak valid.'),
  body('name').notEmpty().withMessage('Nama tidak boleh kosong.'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal harus 8 karakter.'),
];

// Definisi Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;