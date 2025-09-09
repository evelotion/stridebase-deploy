// File: server/routes/store.routes.js
import express from 'express';
import { 
    getStores, 
    getStoreById, 
    getStoreServices, 
    getStoreReviews 
} from '../controllers/store.controller.js';

const router = express.Router();

router.get('/', getStores);
router.get('/:id', getStoreById);
router.get('/:storeId/services', getStoreServices);
router.get('/:storeId/reviews', getStoreReviews);

export default router;