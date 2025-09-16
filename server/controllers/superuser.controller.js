// File: server/controllers/superuser.controller.js (Versi Lengkap)

import prisma from "../config/prisma.js";
import { exec } from "child_process";
import { loadThemeConfig, currentThemeConfig } from "../config/theme.js";
import { broadcastThemeUpdate } from '../socket.js';

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
        // HAPUS FILTER 'where: { status: "PENDING" }' untuk mengambil semua log
        const requests = await prisma.approvalRequest.findMany({
            include: { 
                requestedBy: { select: { name: true, email: true } },
                reviewedBy: { select: { name: true } } // Ambil juga data admin/dev yang mereview
            },
            orderBy: { createdAt: "desc" }, // Urutkan berdasarkan yang terbaru
            take: 50 // Batasi untuk 50 log terbaru agar tidak overload
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
        const updatedRequest = await prisma.approvalRequest.update({
            where: { id: id },
            data: {
                status: resolution,
                reviewedById: req.user.id
            }
        });
        // Di sini Anda bisa menambahkan logika tambahan, seperti notifikasi ke pemohon
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