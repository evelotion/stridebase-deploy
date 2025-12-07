// File: server/routes/public.routes.js
import express from "express";
// PERBAIKAN: Tambahkan getGlobalPromos di sini
import {
  getThemeConfig,
  getBanners,
  getSitemap,
  getGlobalPromos,
} from "../controllers/public.controller.js";

const router = express.Router();

router.get("/theme-config", getThemeConfig);
router.get("/banners", getBanners);
router.get("/sitemap.xml", getSitemap);

// PERBAIKAN: Panggil langsung fungsinya (jangan pakai publicController.)
router.get("/promos", getGlobalPromos);

export default router;
