// File: server/routes/superuser.routes.js

import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authenticateToken.js';
import { 
    getGlobalConfig,
    updateGlobalConfig,
    reseedDatabase,
    getApprovalRequests, // <-- 1. IMPOR FUNGSI YANG HILANG
    resolveApprovalRequest, // <-- 2. IMPOR FUNGSI RESOLVE JUGA
    getSecurityLogs
} from '../controllers/superuser.controller.js';

const router = express.Router();

// Middleware ini akan berlaku untuk semua rute di bawah
router.use(authenticateToken, checkRole(['developer']));

// Config Management
router.get('/config', getGlobalConfig);
router.post('/config', updateGlobalConfig);

// Approval Management (RUTE BARU DITAMBAHKAN DI SINI)
router.get('/approval-requests', getApprovalRequests);
router.post('/approval-requests/:id/resolve', resolveApprovalRequest);
// Security Log Management
router.get('/security-logs', getSecurityLogs);

// Maintenance
router.post('/maintenance/reseed-database', reseedDatabase);

export default router;