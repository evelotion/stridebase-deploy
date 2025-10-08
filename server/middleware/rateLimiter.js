// File: server/middleware/rateLimiter.js (Dengan Perbaikan)

// Menambahkan 'export' agar bisa di-import oleh file lain
export const MAX_LOGIN_ATTEMPTS = 5;
export const COOLDOWN_PERIOD = 15 * 60 * 1000; // 15 menit

export const failedLoginAttempts = new Map();

export const loginRateLimiter = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next();
  }

  const attempts = failedLoginAttempts.get(email) || 0;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return res
      .status(429)
      .json({
        message: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${
          COOLDOWN_PERIOD / 60000
        } menit.`,
      });
  }

  next();
};
