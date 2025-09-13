// File: server/controllers/admin.controller.js (Versi Lengkap Final)

import prisma from "../config/prisma.js";
import { createNotificationForUser } from '../socket.js';

// @desc    Get global statistics for admin
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
    try {
        const totalBookings = await prisma.booking.count();
        
        const totalRevenueResult = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "paid" }, 
        });

        const totalUsers = await prisma.user.count();
        const totalStores = await prisma.store.count();

        res.json({
            totalBookings,
            totalRevenue: totalRevenueResult._sum.amount || 0,
            totalUsers,
            totalStores,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, status: true, _count: { select: { bookings: true } } },
        });
        const usersWithStats = users.map(u => ({...u, totalSpent: 0, transactionCount: u._count.bookings }));
        res.json(usersWithStats);
    } catch (error) {
        next(error);
    }
};

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
export const changeUserRole = async (req, res, next) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.newRole },
        });
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

// @desc    Change user status
// @route   PATCH /api/admin/users/:id/status
export const changeUserStatus = async (req, res, next) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: req.body.newStatus },
        });
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all stores for admin
// @route   GET /api/admin/stores
export const getAllStores = async (req, res, next) => {
    try {
        const stores = await prisma.store.findMany({
            include: { owner: { select: { name: true } } }
        });
        res.json(stores.map(s => ({...s, owner: s.owner.name })));
    } catch (error) {
        next(error);
    }
};

// @desc    Update store status
// @route   PATCH /api/admin/stores/:id/status
export const updateStoreStatus = async (req, res, next) => {
    try {
        const store = await prisma.store.update({
            where: { id: req.params.id },
            data: { storeStatus: req.body.newStatus },
        });
        await createNotificationForUser(store.ownerId, `Status toko Anda "${store.name}" telah diubah menjadi ${store.storeStatus} oleh admin.`);
        res.json({ message: `Status toko berhasil diubah.`, store });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending payout requests
// @route   GET /api/admin/payout-requests
export const getPayoutRequests = async (req, res, next) => {
    try {
        const requests = await prisma.payoutRequest.findMany({
            where: { status: 'PENDING' },
            include: { store: true, requestedBy: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve a payout request
// @route   PATCH /api/admin/payout-requests/:id/resolve
export const resolvePayoutRequest = async (req, res, next) => {
    const { id } = req.params;
    const { newStatus } = req.body; // APPROVED or REJECTED

    try {
        const request = await prisma.payoutRequest.findUnique({ where: { id } });
        if (!request || request.status !== 'PENDING') {
            return res.status(400).json({ message: "Permintaan tidak valid atau sudah diproses." });
        }

        if (newStatus === 'APPROVED') {
            await prisma.$transaction(async (tx) => {
                await tx.storeWallet.update({
                    where: { id: request.walletId },
                    data: { balance: { decrement: request.amount } }
                });
                await tx.payoutRequest.update({
                    where: { id },
                    data: { status: 'APPROVED', processedById: req.user.id }
                });
                await tx.walletTransaction.create({
                    data: {
                        walletId: request.walletId,
                        amount: request.amount,
                        type: 'DEBIT',
                        description: `Penarikan dana #${id.substring(0, 8)} disetujui`,
                        payoutRequestId: id
                    }
                });
            });
            await createNotificationForUser(request.requestedById, `Permintaan penarikan dana sebesar Rp ${request.amount.toLocaleString()} telah disetujui.`);
        } else { // REJECTED
            await prisma.payoutRequest.update({
                where: { id },
                data: { status: 'REJECTED', processedById: req.user.id }
            });
            await createNotificationForUser(request.requestedById, `Permintaan penarikan dana sebesar Rp ${request.amount.toLocaleString()} ditolak.`);
        }
        
        res.json({ message: `Permintaan berhasil di-${newStatus.toLowerCase()}.` });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: { select: { name: true } },
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a booking's payment status
// @route   PATCH /api/admin/bookings/:id/status
export const updateBookingStatus = async (req, res, next) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    try {
        const booking = await prisma.booking.findUnique({ where: { id } });

        if (!booking) {
            return res.status(404).json({ message: "Booking tidak ditemukan." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: newStatus }
        });

        // Kirim notifikasi ke pelanggan
        await createNotificationForUser(
            updatedBooking.userId,
            `Status pesanan Anda #${id.substring(0, 8)} telah diubah oleh admin menjadi: ${newStatus}.`,
            `/track/${id}`
        );
        
        // Kirim notifikasi ke partner (pemilik toko)
        const store = await prisma.store.findUnique({ where: { id: updatedBooking.storeId } });
        if (store) {
            await createNotificationForUser(
                store.ownerId,
                `Status pesanan #${id.substring(0, 8)} telah diubah oleh admin menjadi: ${newStatus}.`,
                `/partner/orders` // Arahkan ke halaman pesanan partner
            );
        }

        res.json({ message: "Status pesanan berhasil diperbarui.", booking: updatedBooking });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews for admin
// @route   GET /api/admin/reviews
export const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: { select: { name: true } },
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review by ID
// @route   DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.review.delete({
            where: { id: id }
        });
        res.json({ message: "Ulasan berhasil dihapus secara permanen." });
    } catch (error) {
        // Tangani kasus jika ulasan tidak ditemukan
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Ulasan tidak ditemukan." });
        }
        next(error);
    }
};

// @desc    Get aggregated report data for admin
// @route   GET /api/admin/reports
export const getReportData = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // Validasi dan set default tanggal (30 hari terakhir jika tidak diset)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));
        
        // Pastikan waktu di akhir hari untuk cakupan yang benar
        end.setHours(23, 59, 59, 999);

        const dateFilter = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };

        // 1. Ambil data total
        const totalRevenuePromise = prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'paid', ...dateFilter },
        });

        const totalBookingsPromise = prisma.booking.count({ where: dateFilter });
        
        const totalPlatformEarningsPromise = prisma.platformEarning.aggregate({
            _sum: { earnedAmount: true },
            where: dateFilter
        });

        // 2. Ambil data untuk tabel
        const latestTransactionsPromise = prisma.payment.findMany({
            where: { status: 'paid', ...dateFilter },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    include: {
                        user: { select: { name: true } },
                        store: { select: { name: true } },
                    },
                },
            },
        });
        
        const topStoresPromise = prisma.booking.groupBy({
            by: ['storeId'],
            where: { ...dateFilter },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        // Jalankan semua query secara paralel
        const [
            totalRevenueResult,
            totalBookings,
            totalPlatformEarningsResult,
            latestTransactions,
            topStoreIds
        ] = await Promise.all([
            totalRevenuePromise,
            totalBookingsPromise,
            totalPlatformEarningsPromise,
            latestTransactionsPromise,
            topStoresPromise
        ]);

        // Ambil detail nama toko untuk top stores
        const storeDetails = await prisma.store.findMany({
            where: { id: { in: topStoreIds.map(s => s.storeId) } },
            select: { id: true, name: true }
        });
        
        const topStores = topStoreIds.map(s => ({
            ...s,
            storeName: storeDetails.find(sd => sd.id === s.storeId)?.name || 'N/A'
        }));

        res.json({
            summary: {
                totalRevenue: totalRevenueResult._sum.amount || 0,
                totalBookings: totalBookings,
                totalPlatformEarnings: totalPlatformEarningsResult._sum.earnedAmount || 0,
            },
            latestTransactions,
            topStores,
        });

    } catch (error) {
        next(error);
    }
};