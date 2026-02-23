

import { getTheme } from '../config/theme.js';

export const checkMaintenanceMode = (req, res, next) => {
  const user = req.user;
  
 
  const currentThemeConfig = getTheme(); 
  
 
  const maintenanceMode = currentThemeConfig?.featureFlags?.maintenanceMode || false;

  if (maintenanceMode) {
   
    if (user && (user.role === 'admin' || user.role === 'developer')) {
      return next();
    }
   
    return res.status(503).json({ 
      message: "Situs sedang dalam perbaikan. Silakan coba lagi nanti." 
    });
  }

 
  next();
};