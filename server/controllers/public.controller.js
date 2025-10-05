// File: server/controllers/public.controller.js
import prisma from "../config/prisma.js";
import { getTheme } from "../config/theme.js"; // Ganti import di sini

// @desc    Get the current theme configuration
// @route   GET /api/public/theme-config
export const getThemeConfig = (req, res) => {
    res.json(getTheme()); // Panggil fungsi getTheme() di sini
};

// @desc    Get all active banners
// @route   GET /api/public/banners
export const getBanners = async (req, res, next) => {
    try {
        const allBanners = await prisma.banner.findMany({
            where: { status: "active" },
            orderBy: { createdAt: "desc" },
        });
        res.json(allBanners || []);
    } catch (error) {
        next(error);
    }
};

// @desc    Generate and serve the sitemap.xml
// @route   GET /api/public/sitemap.xml
export const getSitemap = async (req, res, next) => {
    const baseUrl = "https://stridebase-client-ctct.onrender.com"; // Ganti dengan URL frontend produksi Anda
    try {
        const stores = await prisma.store.findMany({
            where: { storeStatus: "active" },
            select: { id: true },
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        // Halaman statis
        xml += `<url><loc>${baseUrl}/</loc></url>`;
        xml += `<url><loc>${baseUrl}/store</loc></url>`;
        xml += `<url><loc>${baseUrl}/about</loc></url>`;
        xml += `<url><loc>${baseUrl}/contact</loc></url>`;

        // Halaman dinamis (toko)
        stores.forEach((store) => {
            xml += `<url><loc>${baseUrl}/store/${store.id}</loc></url>`;
        });

        xml += `</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);
    } catch (error) {
        next(error);
    }
};