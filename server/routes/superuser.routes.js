// File: server/routes/superuser.routes.js

import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authenticateToken.js';
import { 
    getGlobalConfig,
    updateGlobalConfig,
    reseedDatabase
} from '../controllers/superuser.controller.js';

const router = express.Router();

// Middleware ini akan berlaku untuk semua rute di bawah
router.use(authenticateToken, checkRole(['developer']));

// Config Management
router.get('/config', getGlobalConfig);
router.post('/config', updateGlobalConfig);

// Maintenance
router.post('/maintenance/reseed-database', reseedDatabase);

export default router;