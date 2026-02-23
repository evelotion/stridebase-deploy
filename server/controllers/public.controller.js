
import prisma from "../config/prisma.js";
import { getTheme } from "../config/theme.js";



export const getThemeConfig = (req, res) => {
  res.json(getTheme());
};



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



export const getSitemap = async (req, res, next) => {
  const baseUrl = "https://stridebase-client-ctct.onrender.com";
  try {
    const stores = await prisma.store.findMany({
      where: { storeStatus: "active" },
      select: { id: true },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

   
    xml += `<url><loc>${baseUrl}/</loc></url>`;
    xml += `<url><loc>${baseUrl}/store</loc></url>`;
    xml += `<url><loc>${baseUrl}/about</loc></url>`;
    xml += `<url><loc>${baseUrl}/contact</loc></url>`;

   
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




export const getGlobalPromos = async (req, res, next) => {
  try {
    const now = new Date();

    const promos = await prisma.promo.findMany({
      where: {
        status: "active",
       
        startDate: { lte: now },
       
        OR: [{ endDate: { gte: now } }, { endDate: null }],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    res.json(promos);
  } catch (error) {
    console.error("Get Global Promos Error:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat memuat promo." });
  }
};
