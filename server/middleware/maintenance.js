// File: server/middleware/maintenance.js

import { currentThemeConfig } from '../config/theme.js';

export const checkMaintenanceMode = (req, res, next) => {
  const user = req.user; // Diambil dari middleware authenticateToken jika ada
  
  // Cek apakah maintenance mode aktif dari konfigurasi tema
  const maintenanceMode = currentThemeConfig?.featureFlags?.maintenanceMode || false;

  if (maintenanceMode) {
    // Izinkan akses jika pengguna adalah admin atau developer
    if (user && (user.role === 'admin' || user.role === 'developer')) {
      return next();
    }
    // Blokir akses untuk pengguna lain
    return res.status(503).json({ 
      message: "Situs sedang dalam perbaikan. Silakan coba lagi nanti." 
    });
  }

  // Jika maintenance mode tidak aktif, lanjutkan ke request berikutnya
  next();
};