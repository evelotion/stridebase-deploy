// File: server/controllers/admin.controller.js (Versi Lengkap Final dengan Logika Jadwal)

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";
import cloudinary from "../config/cloudinary.js";

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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        _count: { select: { bookings: true } },
      },
    });
    const usersWithStats = users.map((u) => ({
      ...u,
      totalSpent: 0,
      transactionCount: u._count.bookings,
    }));
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
      include: { owner: { select: { name: true } } },
    });
    res.json(stores.map((s) => ({ ...s, owner: s.owner.name })));
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
    await createNotificationForUser(
      store.ownerId,
      `Status toko Anda "${store.name}" telah diubah menjadi ${store.storeStatus} oleh admin.`
    );
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
      where: { status: "PENDING" },
      include: { store: true, requestedBy: true },
      orderBy: { createdAt: "asc" },
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
    if (!request || request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Permintaan tidak valid atau sudah diproses." });
    }

    if (newStatus === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        await tx.storeWallet.update({
          where: { id: request.walletId },
          data: { balance: { decrement: request.amount } },
        });
        await tx.payoutRequest.update({
          where: { id },
          data: { status: "APPROVED", processedById: req.user.id },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: request.walletId,
            amount: request.amount,
            type: "DEBIT",
            description: `Penarikan dana #${id.substring(0, 8)} disetujui`,
            payoutRequestId: id,
          },
        });
      });
      await createNotificationForUser(
        request.requestedById,
        `Permintaan penarikan dana sebesar Rp ${request.amount.toLocaleString()} telah disetujui.`
      );
    } else {
      // REJECTED
      await prisma.payoutRequest.update({
        where: { id },
        data: { status: "REJECTED", processedById: req.user.id },
      });
      await createNotificationForUser(
        request.requestedById,
        `Permintaan penarikan dana sebesar Rp ${request.amount.toLocaleString()} ditolak.`
      );
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
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
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
      data: { status: newStatus },
    });

    // Kirim notifikasi ke pelanggan
    await createNotificationForUser(
      updatedBooking.userId,
      `Status pesanan Anda #${id.substring(
        0,
        8
      )} telah diubah oleh admin menjadi: ${newStatus}.`,
      `/track/${id}`
    );

    // Kirim notifikasi ke partner (pemilik toko)
    const store = await prisma.store.findUnique({
      where: { id: updatedBooking.storeId },
    });
    if (store) {
      await createNotificationForUser(
        store.ownerId,
        `Status pesanan #${id.substring(
          0,
          8
        )} telah diubah oleh admin menjadi: ${newStatus}.`,
        `/partner/orders` // Arahkan ke halaman pesanan partner
      );
    }

    res.json({
      message: "Status pesanan berhasil diperbarui.",
      booking: updatedBooking,
    });
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
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
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
      where: { id: id },
    });
    res.json({ message: "Ulasan berhasil dihapus secara permanen." });
  } catch (error) {
    if (error.code === "P2025") {
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
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));
    end.setHours(23, 59, 59, 999);
    const dateFilter = { createdAt: { gte: start, lte: end } };

    const totalRevenuePromise = prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "paid", ...dateFilter },
    });
    const totalBookingsPromise = prisma.booking.count({ where: dateFilter });
    const totalPlatformEarningsPromise = prisma.platformEarning.aggregate({
      _sum: { earnedAmount: true },
      where: dateFilter,
    });
    const latestTransactionsPromise = prisma.payment.findMany({
      where: { status: "paid", ...dateFilter },
      take: 5,
      orderBy: { createdAt: "desc" },
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
      by: ["storeId"],
      where: { ...dateFilter },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const [
      totalRevenueResult,
      totalBookings,
      totalPlatformEarningsResult,
      latestTransactions,
      topStoreIds,
    ] = await Promise.all([
      totalRevenuePromise,
      totalBookingsPromise,
      totalPlatformEarningsPromise,
      latestTransactionsPromise,
      topStoresPromise,
    ]);

    const storeDetails = await prisma.store.findMany({
      where: { id: { in: topStoreIds.map((s) => s.storeId) } },
      select: { id: true, name: true },
    });
    const topStores = topStoreIds.map((s) => ({
      ...s,
      storeName: storeDetails.find((sd) => sd.id === s.storeId)?.name || "N/A",
    }));

    res.json({
      summary: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        totalBookings: totalBookings,
        totalPlatformEarnings:
          totalPlatformEarningsResult._sum.earnedAmount || 0,
      },
      latestTransactions,
      topStores,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get operational settings for admin
// @route   GET /api/admin/settings
export const getOperationalSettings = async (req, res, next) => {
  try {
    const themeSetting = await prisma.globalSetting.findUnique({
      where: { key: "themeConfig" },
    });
    if (themeSetting) {
      const relevantSettings = {
        globalAnnouncement: themeSetting.value.globalAnnouncement || "",
        enableGlobalAnnouncement:
          themeSetting.value.featureFlags.enableGlobalAnnouncement || false,
      };
      res.json(relevantSettings);
    } else {
      res.status(404).json({ message: "Konfigurasi tidak ditemukan." });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update operational settings
// @route   POST /api/admin/settings
export const updateOperationalSettings = async (req, res, next) => {
  const { globalAnnouncement, enableGlobalAnnouncement } = req.body;
  try {
    const currentConfig = await prisma.globalSetting.findUnique({
      where: { key: "themeConfig" },
    });
    if (!currentConfig) {
      return res.status(404).json({ message: "Konfigurasi tidak ditemukan." });
    }
    const newConfigValue = {
      ...currentConfig.value,
      globalAnnouncement: globalAnnouncement,
      featureFlags: {
        ...currentConfig.value.featureFlags,
        enableGlobalAnnouncement: enableGlobalAnnouncement,
      },
    };
    const updatedSetting = await prisma.globalSetting.update({
      where: { key: "themeConfig" },
      data: { value: newConfigValue },
    });
    const { loadThemeConfig } = await import("../config/theme.js");
    const { broadcastThemeUpdate } = await import("../socket.js");
    await loadThemeConfig();
    broadcastThemeUpdate(newConfigValue);
    res.json({ message: "Pengaturan berhasil disimpan." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store settings for admin
// @route   GET /api/admin/stores/:storeId/settings
export const getStoreSettingsForAdmin = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.storeId },
      include: { schedules: true },
    });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }
    res.json(store);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings by admin (with full logic and audit trail)
// @route   PUT /api/admin/stores/:storeId/settings
export const updateStoreSettingsByAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  const { name, description, images, headerImage, schedule } = req.body;
  const adminUserId = req.user.id; // Mendapatkan ID admin yang sedang login

  try {
    // 1. Ambil data toko sebelum diubah untuk perbandingan
    const originalStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!originalStore) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    // 2. Lakukan update pada jadwal toko
    if (schedule) {
      for (const dayKey of Object.keys(schedule)) {
        const dayData = schedule[dayKey];
        // Pastikan dayOfWeek ada sebelum upsert
        if (dayData.dayOfWeek) {
          await prisma.storeSchedule.upsert({
            where: {
              storeId_dayOfWeek: {
                storeId: storeId,
                dayOfWeek: dayData.dayOfWeek,
              },
            },
            update: {
              openTime: dayData.opens,
              closeTime: dayData.closes,
              isClosed: dayData.isClosed,
            },
            create: {
              storeId: storeId,
              dayOfWeek: dayData.dayOfWeek,
              openTime: dayData.opens,
              closeTime: dayData.closes,
              isClosed: dayData.isClosed,
            },
          });
        }
      }
    }

    // 3. Update data toko utama
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { name, description, images, headerImageUrl: headerImage },
    });

    // 4. Buat catatan Approval Request sebagai log audit
    await prisma.approvalRequest.create({
      data: {
        storeId: storeId,
        requestType: "ADMIN_STORE_EDIT",
        details: {
          message: `Toko "${originalStore.name}" diubah oleh admin.`,
          adminName: req.user.name,
          adminEmail: req.user.email,
          changes: {
            name: { from: originalStore.name, to: updatedStore.name },
            description: {
              from: originalStore.description,
              to: updatedStore.description,
            },
          },
        },
        status: "APPROVED",
        requestedById: originalStore.ownerId,
        reviewedById: adminUserId,
      },
    });

    res.json({
      message:
        "Pengaturan toko berhasil diperbarui oleh Admin dan log telah dicatat.",
      store: updatedStore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for store gallery by admin
// @route   POST /api/admin/stores/upload-photo
export const uploadAdminPhoto = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "stridebase_stores",
    });
    res.json({
      message: "Foto berhasil diunggah.",
      filePath: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners for admin
// @route   GET /api/admin/banners
export const getAllBannersForAdmin = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner
// @route   POST /api/admin/banners
export const createBanner = async (req, res, next) => {
  const { title, description, imageUrl, linkUrl, status } = req.body;
  try {
    const newBanner = await prisma.banner.create({
      data: { title, description, imageUrl, linkUrl, status },
    });
    res.status(201).json(newBanner);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
export const updateBanner = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, imageUrl, linkUrl, status } = req.body;
  try {
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: { title, description, imageUrl, linkUrl, status },
    });
    res.json(updatedBanner);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
export const deleteBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ message: "Banner berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new store by Admin, triggering an approval request
// @route   POST /api/admin/stores/new
export const createStoreByAdmin = async (req, res, next) => {
    const { name, location, description, ownerId } = req.body;
    const adminUserId = req.user.id; // Admin yang membuat

    if (!name || !location || !ownerId) {
        return res.status(400).json({ message: "Nama, lokasi, dan pemilik toko wajib diisi." });
    }

    try {
        const newStore = await prisma.store.create({
            data: {
                name,
                location,
                description,
                ownerId,
                storeStatus: 'pending', // Status awal adalah pending
                images: [], // Inisialisasi galeri kosong
            },
        });

        // Buat approval request untuk developer
        await prisma.approvalRequest.create({
            data: {
                storeId: newStore.id,
                requestType: 'NEW_STORE_APPROVAL',
                details: {
                    message: `Toko baru "${name}" dibuat oleh Admin ${req.user.name} dan menunggu persetujuan.`,
                    storeName: name,
                    ownerId: ownerId,
                    createdByAdmin: adminUserId,
                },
                status: 'PENDING',
                requestedById: adminUserId, // Permintaan datang dari admin
            },
        });

        res.status(201).json({ message: "Toko berhasil dibuat dan permintaan persetujuan dikirim.", store: newStore });
    } catch (error) {
        next(error);
    }
};