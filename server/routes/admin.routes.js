// File: server/routes/admin.routes.js (Versi Final dengan Rute Invoice)

import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authenticateToken.js';
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
    getOperationalSettings,
    updateOperationalSettings,
    getStoreSettingsForAdmin,
    updateStoreSettingsByAdmin,
    uploadAdminPhoto,
    createStoreByAdmin,
    getAllBannersForAdmin,
    createBanner,
    updateBanner,
    deleteBanner,
    createStoreInvoice // <-- 1. Impor fungsi baru di sini
} from '../controllers/admin.controller.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
router.post('/stores/new', createStoreByAdmin);
router.patch('/stores/:id/status', updateStoreStatus);
router.get('/stores/:storeId/settings', getStoreSettingsForAdmin);
router.put('/stores/:storeId/settings', updateStoreSettingsByAdmin);
router.post('/stores/upload-photo', upload.single('photo'), uploadAdminPhoto);
router.post('/stores/:storeId/invoices', createStoreInvoice); // <-- 2. Tambahkan rute baru di sini

// Payout Management
router.get('/payout-requests', getPayoutRequests);
router.patch('/payout-requests/:id/resolve', resolvePayoutRequest);

// Banner Management
router.get('/banners', getAllBannersForAdmin);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Booking & Review Management
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Reports
router.get('/reports', getReportData);

// Settings
router.get('/settings', getOperationalSettings);
router.post('/settings', updateOperationalSettings);

export default router;