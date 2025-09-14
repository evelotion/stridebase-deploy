// File: server/controllers/store.controller.js (Versi Perbaikan Final dengan Caching)

import prisma from "../config/prisma.js";
import redisClient from "../redis-client.js";

// Fungsi helper untuk menghitung jarak (tetap sama)
function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
    return Infinity;
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getStores = async (req, res, next) => {
  const { search, sortBy, lat, lng, minRating, services, openNow } = req.query;
  // Membuat key unik untuk cache berdasarkan filter yang digunakan
  const cacheKey = `stores_v3:${JSON.stringify(req.query)}`;

  try {
    // Cek Redis hanya jika client terhubung
    if (redisClient.isReady) {
      const cachedStores = await redisClient.get(cacheKey);
      if (cachedStores) {
        console.log(`✅ CACHE HIT untuk key: ${cacheKey}`);
        return res.json(JSON.parse(cachedStores));
      }
    }
  } catch (cacheError) {
    console.error(
      "❌ Error saat mengambil dari Redis cache:",
      cacheError.message
    );
  }

  try {
    console.log(
      `CACHE MISS untuk key: ${cacheKey}. Mengambil dari database...`
    );

    const whereClause = {
      storeStatus: "active",
      name: { contains: search || "", mode: "insensitive" },
      rating: { gte: parseFloat(minRating) || 0 },
    };

    let stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        services: { select: { name: true } },
      },
    });

    if (services) {
      const serviceList = services
        .split(",")
        .map((s) => s.toLowerCase().trim());
      stores = stores.filter((store) =>
        store.services.some((service) =>
          serviceList.includes(service.name.toLowerCase().trim())
        )
      );
    }

    if (lat && lng) {
      stores = stores.map((store) => ({
        ...store,
        distance: getDistance(
          parseFloat(lat),
          parseFloat(lng),
          store.latitude,
          store.longitude
        ),
      }));
    }

    if (sortBy === "distance" && lat && lng) {
      stores.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "createdAt") {
      stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      stores.sort((a, b) => b.rating - b.rating);
    }

    try {
      if (redisClient.isReady) {
        // Simpan hasil ke cache selama 5 menit (300 detik)
        await redisClient.setEx(cacheKey, 300, JSON.stringify(stores));
        console.log(
          `✅ Data berhasil disimpan ke cache untuk key: ${cacheKey}`
        );
      }
    } catch (cacheError) {
      console.error(
        "❌ Error saat menyimpan ke Redis cache:",
        cacheError.message
      );
    }

    res.json(stores);
  } catch (error) {
    next(error);
  }
};

// ... sisa controller (getStoreById, getStoreServices, getStoreReviews) tetap sama ...
export const getStoreById = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: { services: true, schedules: true },
    });

    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ message: "Toko tidak ditemukan" });
    }
  } catch (error) {
    next(error);
  }
};

export const getStoreServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { storeId: req.params.storeId },
      orderBy: [{ shoeType: "asc" }, { name: "asc" }],
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const getStoreReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { storeId: req.params.storeId },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
