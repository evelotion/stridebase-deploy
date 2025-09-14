// File: server/routes/admin.routes.js

import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authenticateToken.js';
import { getGlobalConfig, updateGlobalConfig } from '../controllers/superuser.controller.js';
import { 
    getAdminStats, 
    getAllUsers,
    changeUserRole,
    changeUserStatus,
    getAllStores,
    updateStoreStatus,
    getPayoutRequests,
    resolvePayoutRequest,
    getAllBookings,
    updateBookingStatus,
    getAllReviews,
    deleteReview,
    getReportData,
    getOperationalSettings,   // <-- 1. IMPOR FUNGSI BARU
    updateOperationalSettings, // <-- 2. IMPOR FUNGSI BARU
    getAllBannersForAdmin, // <-- Tambahkan impor ini
    createBanner,          // <-- Tambahkan impor ini
    updateBanner,          // <-- Tambahkan impor ini
    deleteBanner           // <-- Tambahkan impor ini
} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware ini akan berlaku untuk semua rute di bawah
router.use(authenticateToken, checkRole(['admin', 'developer']));

// Dashboard
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/status', changeUserStatus);

// Store Management
router.get('/stores', getAllStores);
router.patch('/stores/:id/status', updateStoreStatus);

// Payout Management
router.get('/payout-requests', getPayoutRequests);
router.patch('/payout-requests/:id/resolve', resolvePayoutRequest);
router.get('/banners', getAllBannersForAdmin);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);
router.get('/reports', getReportData);
router.get('/settings', getGlobalConfig);
router.post('/settings', updateGlobalConfig);
router.get('/settings', getOperationalSettings);
router.post('/settings', updateOperationalSettings);


export default router;