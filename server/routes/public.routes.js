
import express from "express";

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


router.get("/promos", getGlobalPromos);

export default router;
