// File: server/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Batasi setiap IP hingga 10 permintaan login per 'window'
	standardHeaders: true, 
	legacyHeaders: false, 
    message: {
        message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit.'
    }
});