// File: server/controllers/superuser.controller.js (Versi Final Lengkap dengan Logika Approval)

import prisma from "../config/prisma.js";
import { exec } from "child_process";
import { loadThemeConfig, currentThemeConfig } from "../config/theme.js";
import { broadcastThemeUpdate, createNotificationForUser } from '../socket.js'; // <-- Tambahkan createNotificationForUser

// @desc    Get all global configurations
// @route   GET /api/superuser/config
export const getGlobalConfig = async (req, res, next) => {
    try {
        const settings = await prisma.globalSetting.findUnique({ where: { key: 'themeConfig' } });
        res.json(settings ? settings.value : currentThemeConfig);
    } catch (error) {
        next(error);
    }
};

// @desc    Update global configurations
// @route   POST /api/superuser/config
export const updateGlobalConfig = async (req, res, next) => {
    const newConfig = req.body;
    try {
        const updatedSetting = await prisma.globalSetting.upsert({
            where: { key: "themeConfig" },
            update: { value: newConfig },
            create: { key: "themeConfig", value: newConfig },
        });

        await loadThemeConfig();
        broadcastThemeUpdate(currentThemeConfig);

        res.json(updatedSetting.value);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all approval requests (not just pending)
// @route   GET /api/superuser/approval-requests
export const getApprovalRequests = async (req, res, next) => {
    try {
        const requests = await prisma.approvalRequest.findMany({
            include: { 
                requestedBy: { select: { name: true, email: true } },
                reviewedBy: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve an approval request
// @route   POST /api/superuser/approval-requests/:id/resolve
export const resolveApprovalRequest = async (req, res, next) => {
    const { id } = req.params;
    const { resolution } = req.body; // "APPROVED" or "REJECTED"

    if (!['APPROVED', 'REJECTED'].includes(resolution)) {
        return res.status(400).json({ message: "Status resolusi tidak valid." });
    }

    try {
        const request = await prisma.approvalRequest.findUnique({ where: { id } });
        if (!request) {
            return res.status(404).json({ message: "Permintaan tidak ditemukan." });
        }
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: "Permintaan ini sudah diproses sebelumnya." });
        }

        // Jika request disetujui DAN tipenya adalah perubahan model bisnis, update data toko
        if (request.requestType === 'BUSINESS_MODEL_CHANGE' && resolution === 'APPROVED') {
            const changes = request.details.to;
            await prisma.store.update({
                where: { id: request.storeId },
                data: {
                    tier: changes.tier,
                    commissionRate: changes.commissionRate,
                    subscriptionFee: changes.subscriptionFee,
                },
            });
        }

        // Update status request itu sendiri
        const updatedRequest = await prisma.approvalRequest.update({
            where: { id: id },
            data: {
                status: resolution,
                reviewedById: req.user.id
            }
        });

        // Kirim notifikasi kembali ke admin yang meminta
        await createNotificationForUser(
            request.requestedById,
            `Permintaan Anda untuk mengubah model bisnis toko telah di-${resolution.toLowerCase()} oleh developer.`,
            `/admin/stores/${request.storeId}/settings`
        );
        
        res.json(updatedRequest);
    } catch (error) {
        next(error);
    }
};

// @desc    Reseed the database
// @route   POST /api/superuser/maintenance/reseed-database
export const reseedDatabase = (req, res, next) => {
    exec("npx prisma db seed", (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: "Gagal menjalankan seeder.", error: stderr });
        }
        res.json({ message: "Database berhasil di-reset dan di-seed ulang.", output: stdout });
    });
};