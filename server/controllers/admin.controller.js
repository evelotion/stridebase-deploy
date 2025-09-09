// File: server/controllers/admin.controller.js

import prisma from "../config/prisma.js";
import { createNotificationForUser } from '../socket.js';

// @desc    Get global statistics for admin
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
    try {
        const totalBookings = await prisma.booking.count();
        const totalRevenueResult = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS" },
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
        // Menambahkan statistik dummy, bisa dikembangkan
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