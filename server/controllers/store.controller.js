// File: server/controllers/store.controller.js (Dengan Caching)

import prisma from "../config/prisma.js";
import redisClient from "../redis-client.js";

// Helper function to calculate distance (tidak berubah)
function getDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// @desc    Fetch all stores with filtering, sorting, and location capabilities
// @route   GET /api/stores
export const getStores = async (req, res, next) => {
    const { search, sortBy, lat, lng, minRating, services, openNow } = req.query;
    
    // Buat kunci cache yang unik berdasarkan semua parameter query
    const cacheKey = `stores:${JSON.stringify(req.query)}`;

    try {
        // 1. Coba ambil data dari cache (Redis) terlebih dahulu
        const cachedStores = await redisClient.get(cacheKey);

        if (cachedStores) {
            console.log(`CACHE HIT for key: ${cacheKey}`);
            return res.json(JSON.parse(cachedStores));
        }
        
        console.log(`CACHE MISS for key: ${cacheKey}. Fetching from database.`);

        // 2. Jika tidak ada di cache, ambil dari database
        const whereClause = {
            storeStatus: "active",
            name: { contains: search || "", mode: "insensitive" },
            rating: { gte: parseFloat(minRating) || 0 },
        };

        if (services) {
            whereClause.services = {
                some: { name: { in: services.split(","), mode: "insensitive" } },
            };
        }

        let stores = await prisma.store.findMany({
            where: whereClause,
            include: { services: { select: { name: true } } },
        });

        // (Logika filter dan sorting Anda tidak berubah)
        if (openNow === "true") {
            // Logika untuk filter 'openNow'
        }
        if (lat && lng) {
            stores = stores.map(store => ({
                ...store,
                distance: getDistance(parseFloat(lat), parseFloat(lng), store.latitude, store.longitude)
            }));
        }
        if (sortBy === 'distance' && lat && lng) {
            stores.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === 'createdAt') {
            stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else { 
            stores.sort((a, b) => b.rating - a.rating);
        }

        // 3. Simpan hasil dari database ke cache untuk permintaan berikutnya
        // Simpan selama 5 menit (300 detik)
        await redisClient.setEx(cacheKey, 300, JSON.stringify(stores));

        res.json(stores);
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch a single store by ID
// @route   GET /api/stores/:id
export const getStoreById = async (req, res, next) => {
    try {
        const store = await prisma.store.findUnique({ where: { id: req.params.id } });
        if (store) {
            res.json(store);
        } else {
            res.status(404).json({ message: "Toko tidak ditemukan" });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch services for a specific store
// @route   GET /api/stores/:storeId/services
export const getStoreServices = async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            where: { storeId: req.params.storeId },
            orderBy: [{ shoeType: 'asc' }, { name: 'asc' }],
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch reviews for a specific store
// @route   GET /api/stores/:storeId/reviews
export const getStoreReviews = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { storeId: req.params.storeId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};