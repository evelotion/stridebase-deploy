// File: server/controllers/superuser.controller.js

import prisma from "../config/prisma.js";
import { loadThemeConfig, getTheme } from "../config/theme.js";
import {
  broadcastThemeUpdate,
  createNotificationForUser,
} from "../socket.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs"; // Pastikan import bcrypt untuk hashing password seed

export const getGlobalConfig = async (req, res, next) => {
  try {
    const settings = await prisma.globalSetting.findUnique({
      where: { key: "themeConfig" },
    });
    res.json(settings ? settings.value : getTheme());
  } catch (error) {
    next(error);
  }
};

export const updateGlobalConfig = async (req, res, next) => {
  const newConfig = req.body;
  try {
    const updatedSetting = await prisma.globalSetting.upsert({
      where: { key: "themeConfig" },
      update: { value: newConfig },
      create: { key: "themeConfig", value: newConfig },
    });
    await loadThemeConfig();
    broadcastThemeUpdate(getTheme());
    res.json(updatedSetting.value);
  } catch (error) {
    next(error);
  }
};

export const getApprovalRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requests, total] = await prisma.$transaction([
      prisma.approvalRequest.findMany({
        skip,
        take: limit,
        include: {
          requestedBy: { select: { name: true, email: true } },
          reviewedBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.approvalRequest.count(),
    ]);

    res.json({
      data: requests,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resolveApprovalRequest = async (req, res, next) => {
  const { id } = req.params;
  const { resolution } = req.body;

  if (!["APPROVED", "REJECTED"].includes(resolution)) {
    return res.status(400).json({ message: "Status resolusi tidak valid." });
  }

  try {
    const request = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ message: "Permintaan tidak ditemukan." });
    }
    if (request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Permintaan ini sudah diproses." });
    }

    // Logika penghapusan (User Deletion)
    if (request.requestType === "USER_DELETION" && resolution === "APPROVED") {
      const userIdToDelete = request.details.userId;
      if (userIdToDelete) {
        await prisma.$transaction([
          prisma.notification.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.review.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.payment.deleteMany({
            where: { booking: { userId: userIdToDelete } },
          }),
          prisma.booking.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.address.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.securityLog.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.loyaltyPoint.deleteMany({ where: { userId: userIdToDelete } }),
          prisma.approvalRequest.deleteMany({
            where: { requestedById: userIdToDelete },
          }),
          prisma.invoice.deleteMany({ where: { issuedById: userIdToDelete } }),
          prisma.user.delete({ where: { id: userIdToDelete } }),
        ]);
      }
    }

    // Logika Perubahan Bisnis
    if (
      request.requestType === "BUSINESS_MODEL_CHANGE" &&
      resolution === "APPROVED"
    ) {
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

    // Logika Penghapusan Toko
    if (request.requestType === "STORE_DELETION" && resolution === "APPROVED") {
      const { storeId } = request;
      if (storeId) {
        // Hapus dependensi toko
        await prisma.$transaction([
          prisma.review.deleteMany({ where: { storeId } }),
          prisma.platformEarning.deleteMany({ where: { storeId } }),
          prisma.walletTransaction.deleteMany({
            where: { wallet: { storeId } },
          }),
          prisma.payoutRequest.deleteMany({ where: { storeId } }),
          prisma.payment.deleteMany({ where: { booking: { storeId } } }),
          prisma.invoice.deleteMany({ where: { storeId } }),
          prisma.booking.deleteMany({ where: { storeId } }),
          prisma.service.deleteMany({ where: { storeId } }),
          prisma.storeSchedule.deleteMany({ where: { storeId } }),
          prisma.storePromo.deleteMany({ where: { storeId } }),
          prisma.approvalRequest.deleteMany({ where: { storeId } }),
          prisma.storeWallet.deleteMany({ where: { storeId } }),
          prisma.store.delete({ where: { id: storeId } }),
        ]);
        
        // Hapus notifikasi terkait
        await prisma.notification.deleteMany({
          where: {
            bookingId: null,
            message: { contains: `toko ${request.details.storeName}` },
          },
        });
      }
    }

    const updatedRequest = await prisma.approvalRequest.update({
      where: { id: id },
      data: { status: resolution, reviewedById: req.user.id },
    });

    const targetName =
      request.details?.userName ||
      request.details?.storeName ||
      `(ID: ${request.storeId})`;
    let notificationMessage = `Permintaan Anda (${
      request.requestType
    }) untuk "${targetName}" telah di-${resolution.toLowerCase()} oleh developer.`;
    
    if (resolution === "APPROVED") {
      if (request.requestType === "USER_DELETION") {
        notificationMessage = `Pengguna "${targetName}" telah berhasil dihapus secara permanen.`;
      } else if (request.requestType === "STORE_DELETION") {
        notificationMessage = `Toko "${targetName}" telah berhasil dihapus secara permanen.`;
      }
    }

    await createNotificationForUser(
      request.requestedById,
      notificationMessage,
      `/admin/stores`
    );

    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

// --- REFACTORED: Programmatic Reseed (Lebih Aman & Stabil) ---
export const reseedDatabase = async (req, res, next) => {
  try {
    // 1. Hapus data lama (Urutan penting karena Foreign Key!)
    await prisma.$transaction([
      prisma.notification.deleteMany(),
      prisma.securityLog.deleteMany(),
      prisma.invoice.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.platformEarning.deleteMany(),
      prisma.walletTransaction.deleteMany(),
      prisma.payoutRequest.deleteMany(),
      prisma.ledgerEntry.deleteMany(),
      prisma.review.deleteMany(),
      prisma.approvalRequest.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.storeSchedule.deleteMany(),
      prisma.storePromo.deleteMany(),
      prisma.promo.deleteMany(),
      prisma.service.deleteMany(),
      prisma.storeWallet.deleteMany(),
      prisma.store.deleteMany(),
      prisma.address.deleteMany(),
      prisma.loyaltyPoint.deleteMany(),
      prisma.user.deleteMany(), 
      // Jangan hapus GlobalSetting agar konfigurasi tema tidak hilang
    ]);

    // 2. Buat Data Default (Developer & Admin)
    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.create({
      data: {
        name: "Developer Utama",
        email: "dev@stridebase.com",
        password: hashedPassword,
        role: "developer",
        isEmailVerified: true,
        status: "active",
      },
    });

    await prisma.user.create({
      data: {
        name: "Admin StrideBase",
        email: "admin@stridebase.com",
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
        status: "active",
      },
    });

    await prisma.user.create({
      data: {
        name: "User Demo",
        email: "user@stridebase.com",
        password: hashedPassword,
        role: "customer",
        isEmailVerified: true,
        status: "active",
      },
    });

    // Log aktivitas ini
    console.log("Database reseeded programmatically via Developer Console.");

    res.json({
      message: "Database berhasil di-reset. Akun default (dev/admin/user) telah dibuat ulang.",
      output: "Success: Tables cleaned and essential users recreated.",
    });
  } catch (error) {
    console.error("Reseed Error:", error);
    res.status(500).json({ 
      message: "Gagal melakukan reseed database.", 
      error: error.message 
    });
  }
};

export const getSecurityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 
    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.securityLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.securityLog.count(),
    ]);

    res.json({
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHomePageTheme = async (req, res, next) => {
  const { theme } = req.body;
  if (!theme || !["classic", "modern", "elevate"].includes(theme)) {
    return res.status(400).json({ message: "Tema tidak valid." });
  }
  try {
    await prisma.globalSetting.upsert({
      where: { key: "homePageTheme" },
      update: { value: theme },
      create: { key: "homePageTheme", value: theme },
    });
    await loadThemeConfig();
    broadcastThemeUpdate(getTheme());
    res.status(200).json({
      message: "Tema homepage berhasil diperbarui.",
      homePageTheme: theme,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDeveloperAsset = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "stridebase/developer-assets",
      public_id: `dev-asset-${Date.now()}`,
    });

    res.status(200).json({
      message: "Aset berhasil diunggah.",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};