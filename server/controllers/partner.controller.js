// File: server/controllers/partner.controller.js

import prisma from "../config/prisma.js";
import { createNotificationForUser } from '../socket.js';
import cloudinary from "../config/cloudinary.js";

// Middleware untuk menemukan toko milik mitra dan melampirkannya ke request
export const findMyStore = async (req, res, next) => {
    try {
        const store = await prisma.store.findFirst({
            where: { ownerId: req.user.id },
            include: { owner: true } // Sertakan data pemilik
        });
        if (!store) {
            return res.status(404).json({ message: "Anda tidak memiliki toko terdaftar." });
        }
        req.store = store;
        next();
    } catch (error) {
        next(error);
    }
};

// @desc    Get partner dashboard stats
// @route   GET /api/partner/dashboard
export const getPartnerDashboard = async (req, res, next) => {
    try {
        const storeId = req.store.id;
        const totalRevenue = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { booking: { storeId: storeId }, status: 'SUCCESS' },
        });

        const newOrders = await prisma.booking.count({
            where: { storeId: storeId, status: 'Processing' },
        });

        const completedOrders = await prisma.booking.count({
            where: { storeId: storeId, status: { in: ['Completed', 'Reviewed'] } },
        });

        const totalCustomers = await prisma.booking.groupBy({
            by: ['userId'],
            where: { storeId: storeId },
            _count: { userId: true }
        });

        res.json({
            storeName: req.store.name,
            totalRevenue: totalRevenue._sum.amount || 0,
            newOrders,
            completedOrders,
            totalCustomers: totalCustomers.length,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders for the partner's store
// @route   GET /api/partner/orders
export const getPartnerOrders = async (req, res, next) => {
    try {
        const orders = await prisma.booking.findMany({
            where: { storeId: req.store.id },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { scheduleDate: "desc" },
        });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update work status of an order
// @route   PATCH /api/partner/orders/:bookingId/work-status
export const updateWorkStatus = async (req, res, next) => {
    const { bookingId } = req.params;
    const { newWorkStatus } = req.body;
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { workStatus: newWorkStatus },
        });

        // Kirim notifikasi ke pelanggan
        await createNotificationForUser(
            updatedBooking.userId,
            `Status pengerjaan pesanan Anda #${bookingId.substring(0, 8)} telah diperbarui menjadi: ${newWorkStatus}.`,
            `/track/${bookingId}`
        );
        
        req.io.emit('bookingUpdated', updatedBooking);
        res.json({ message: "Status pengerjaan berhasil diperbarui.", booking: updatedBooking });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all services for the partner's store
// @route   GET /api/partner/services
export const getPartnerServices = async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            where: { storeId: req.store.id },
            orderBy: { name: 'asc' }
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new service
// @route   POST /api/partner/services
export const createPartnerService = async (req, res, next) => {
    const { name, description, price, shoeType } = req.body;
    try {
        const newService = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                shoeType,
                storeId: req.store.id,
            }
        });
        res.status(201).json(newService);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing service
// @route   PUT /api/partner/services/:serviceId
export const updatePartnerService = async (req, res, next) => {
    try {
        const updatedService = await prisma.service.update({
            where: { id: req.params.serviceId },
            data: {
                ...req.body,
                price: parseFloat(req.body.price),
            }
        });
        res.json(updatedService);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a service
// @route   DELETE /api/partner/services/:serviceId
export const deletePartnerService = async (req, res, next) => {
    try {
        await prisma.service.delete({ where: { id: req.params.serviceId } });
        res.status(200).json({ message: "Layanan berhasil dihapus." });
    } catch (error) {
        next(error);
    }
};

// @desc    Get partner's store settings
// @route   GET /api/partner/settings
export const getPartnerSettings = async (req, res, next) => {
    // Middleware findMyStore sudah menyediakan req.store
    res.json(req.store);
};

// @desc    Update partner's store settings
// @route   PUT /api/partner/settings
export const updatePartnerSettings = async (req, res, next) => {
    const { name, description, images, headerImage, schedule } = req.body;
    try {
        await prisma.store.update({
            where: { id: req.store.id },
            data: {
                name,
                description,
                images,
                headerImage,
            },
        });
        // Logic to update schedule can be added here
        res.json({ message: "Pengaturan toko berhasil diperbarui." });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload photo for the store gallery
// @route   POST /api/partner/upload-photo
export const uploadPartnerPhoto = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "stridebase_stores",
        });
        res.json({ message: "Foto berhasil diunggah.", filePath: result.secure_url });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for the partner's store
// @route   GET /api/partner/reviews
export const getPartnerReviews = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { storeId: req.store.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Reply to a customer review
// @route   POST /api/partner/reviews/:reviewId/reply
export const replyToReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const { reply } = req.body;
    try {
        const updatedReview = await prisma.review.update({
            where: { id: reviewId, storeId: req.store.id },
            data: { partnerReply: reply },
        });
        res.json(updatedReview);
    } catch (error) {
        next(error);
    }
};

// @desc    Get partner's wallet data
// @route   GET /api/partner/wallet
export const getWalletData = async (req, res, next) => {
    try {
        const wallet = await prisma.storeWallet.findUnique({
            where: { storeId: req.store.id },
            include: { transactions: { orderBy: { createdAt: 'desc' } } },
        });
        res.json(wallet || { balance: 0, transactions: [] });
    } catch (error) {
        next(error);
    }
};

// @desc    Request a payout
// @route   POST /api/partner/payout-requests
export const requestPayout = async (req, res, next) => {
    const { amount } = req.body;
    try {
        const wallet = await prisma.storeWallet.findUnique({ where: { storeId: req.store.id } });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ message: "Saldo tidak mencukupi." });
        }
        
        const newRequest = await prisma.payoutRequest.create({
            data: {
                amount: parseFloat(amount),
                storeId: req.store.id,
                walletId: wallet.id,
                requestedById: req.user.id,
            }
        });
        // Kirim notifikasi ke Admin/Developer bisa ditambahkan di sini
        res.status(201).json({ message: "Permintaan penarikan dana berhasil diajukan.", request: newRequest });
    } catch (error) {
        next(error);
    }
};

// @desc    Get aggregated report data for a partner's store
// @route   GET /api/partner/reports
export const getPartnerReports = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const storeId = req.store.id;

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 29));
        end.setHours(23, 59, 59, 999);

        const dateFilter = {
            createdAt: { gte: start, lte: end },
        };

        const bookingDateFilter = {
            ...dateFilter,
            storeId: storeId,
        };

        const paymentDateFilter = {
            ...dateFilter,
            booking: { storeId: storeId },
            status: 'paid'
        };

        // 1. Ambil data agregat
        const totalRevenuePromise = prisma.payment.aggregate({
            _sum: { amount: true },
            where: paymentDateFilter,
        });

        const totalOrdersPromise = prisma.booking.count({ where: bookingDateFilter });

        const averageRatingPromise = prisma.review.aggregate({
            _avg: { rating: true },
            where: { storeId: storeId, ...dateFilter },
        });
        
        // 2. Ambil data untuk tabel
        const topServicesPromise = prisma.booking.groupBy({
            by: ['serviceName'],
            where: bookingDateFilter,
            _count: { serviceName: true },
            orderBy: { _count: { serviceName: 'desc' } },
            take: 5
        });

        const recentReviewsPromise = prisma.review.findMany({
            where: { storeId: storeId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        
        const [
            totalRevenueResult,
            totalOrders,
            averageRatingResult,
            topServices,
            recentReviews
        ] = await Promise.all([
            totalRevenuePromise,
            totalOrdersPromise,
            averageRatingPromise,
            topServicesPromise,
            recentReviewsPromise
        ]);

        res.json({
            summary: {
                totalRevenue: totalRevenueResult._sum.amount || 0,
                totalOrders: totalOrders || 0,
                averageRating: averageRatingResult._avg.rating || 0,
            },
            topServices: topServices.map(s => ({ name: s.serviceName, count: s._count.serviceName })),
            recentReviews,
        });

    } catch (error) {
        next(error);
    }
};