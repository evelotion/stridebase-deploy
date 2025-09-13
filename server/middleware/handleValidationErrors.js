// File: server/middleware/handleValidationErrors.js

import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Jika ada error, kirim respons 400 dengan pesan error pertama
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  // Jika tidak ada error, lanjutkan ke controller berikutnya
  next();
};