// File: server/routes/admin.routes.js

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
    deleteReview 
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
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;