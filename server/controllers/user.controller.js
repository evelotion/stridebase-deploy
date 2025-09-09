// File: server/controllers/user.controller.js
import prisma from "../config/prisma.js";

// @desc    Update user profile
// @route   PUT /api/user/profile
export const updateUserProfile = async (req, res, next) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nama tidak boleh kosong." });
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name },
        });
        res.json({
            message: "Profil berhasil diperbarui.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user addresses
// @route   GET /api/user/addresses
export const getUserAddresses = async (req, res, next) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        res.json(addresses);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new address
// @route   POST /api/user/addresses
export const addUserAddress = async (req, res, next) => {
    const { label, recipientName, phoneNumber, fullAddress, city, postalCode } = req.body;
    if (!label || !recipientName || !phoneNumber || !fullAddress || !city || !postalCode) {
        return res.status(400).json({ message: "Semua kolom alamat wajib diisi." });
    }
    try {
        const newAddress = await prisma.address.create({
            data: { ...req.body, userId: req.user.id },
        });
        res.status(201).json(newAddress);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an address
// @route   DELETE /api/user/addresses/:id
export const deleteUserAddress = async (req, res, next) => {
    try {
        const address = await prisma.address.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!address) {
            return res.status(403).json({ message: "Anda tidak memiliki izin atau alamat tidak ditemukan." });
        }
        await prisma.address.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: "Alamat berhasil dihapus." });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user notifications
// @route   GET /api/user/notifications
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, readStatus: false },
        });
        res.json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   POST /api/user/notifications/mark-read
export const markNotificationsAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, readStatus: false },
            data: { readStatus: true },
        });
        res.status(200).json({ message: "Semua notifikasi ditandai terbaca." });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user loyalty points and transactions
// @route   GET /api/user/loyalty
export const getLoyaltyData = async (req, res, next) => {
    try {
        const loyaltyData = await prisma.loyaltyPoint.findUnique({
            where: { userId: req.user.id },
        });
        res.json(loyaltyData || { points: 0, transactions: [] });
    } catch (error) {
        next(error);
    }
};

// @desc    Redeem loyalty points for a voucher
// @route   POST /api/user/loyalty/redeem
export const redeemLoyaltyPoints = async (req, res, next) => {
    const { pointsToRedeem } = req.body;
    const userId = req.user.id;
    try {
        const loyalty = await prisma.loyaltyPoint.findUnique({ where: { userId } });
        if (!loyalty || loyalty.points < pointsToRedeem) {
            return res.status(400).json({ message: "Poin tidak mencukupi." });
        }
        
        const newPromoCode = `VOUCHER-${userId.substring(0, 4)}-${Date.now()}`;
        
        await prisma.$transaction(async (tx) => {
            await tx.loyaltyPoint.update({
                where: { userId },
                data: { points: { decrement: pointsToRedeem } },
            });
            await tx.promo.create({
                data: {
                    code: newPromoCode,
                    description: `Voucher diskon Rp 10.000 dari penukaran ${pointsToRedeem} poin.`,
                    discountType: 'fixed',
                    value: 10000,
                    startDate: new Date(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Berlaku 30 hari
                    usageLimit: 1,
                    minTransaction: 50000,
                    forNewUser: false,
                    isRedeemed: false,
                    userId: userId
                },
            });
        });
        res.json({ success: true, message: `Berhasil menukar ${pointsToRedeem} poin dengan voucher diskon!` });
    } catch (error) {
        next(error);
    }
};

// @desc    Get promos redeemed by the user
// @route   GET /api/user/redeemed-promos
export const getRedeemedPromos = async (req, res, next) => {
    try {
        const promos = await prisma.promo.findMany({
            where: { userId: req.user.id, isRedeemed: false }, // Hanya tampilkan yang belum dipakai
            orderBy: { startDate: 'desc' },
        });
        res.json(promos);
    } catch (error) {
        next(error);
    }
};

// @desc    Get store recommendations for the user
// @route   GET /api/user/recommendations
export const getRecommendations = async (req, res, next) => {
    try {
        const lastBookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { storeId: true },
        });
        
        if (lastBookings.length === 0) {
            return res.json([]);
        }
        
        const lastVisitedStoreIds = [...new Set(lastBookings.map(b => b.storeId))];
        
        const recommendations = await prisma.store.findMany({
            where: {
                id: { notIn: lastVisitedStoreIds },
                storeStatus: 'active',
            },
            take: 3,
            orderBy: { rating: 'desc' },
        });
        
        res.json(recommendations);
    } catch (error) {
        next(error);
    }
};