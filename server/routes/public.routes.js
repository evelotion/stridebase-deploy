// File: server/routes/public.routes.js
import express from 'express';
import { getThemeConfig, getBanners, getSitemap } from '../controllers/public.controller.js';

const router = express.Router();

router.get('/theme-config', getThemeConfig);
router.get('/banners', getBanners);
router.get('/sitemap.xml', getSitemap);

export default router;