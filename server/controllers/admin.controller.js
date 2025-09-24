// File: server/controllers/admin.controller.js (Versi Lengkap dengan Pratinjau Halaman Cetak)

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";
import cloudinary from "../config/cloudinary.js";

// ... (fungsi getAdminStats hingga createStoreByAdmin tidak berubah)
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

    await createNotificationForUser(
      updatedBooking.userId,
      `Status pesanan Anda #${id.substring(
        0,
        8
      )} telah diubah oleh admin menjadi: ${newStatus}.`,
      `/track/${id}`
    );

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
        `/partner/orders`
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

export const deleteReview = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.review.delete({ where: { id: id } });
    res.json({ message: "Ulasan berhasil dihapus secara permanen." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }
    next(error);
  }
};

export const getReportData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));
    end.setHours(23, 59, 59, 999);
    const dateFilter = { createdAt: { gte: start, lte: end } };

    const [
      totalRevenueResult,
      totalBookings,
      totalPlatformEarningsResult,
      latestTransactions,
      topStoreIds,
    ] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "paid", ...dateFilter },
      }),
      prisma.booking.count({ where: dateFilter }),
      prisma.platformEarning.aggregate({
        _sum: { earnedAmount: true },
        where: dateFilter,
      }),
      prisma.payment.findMany({
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
      }),
      prisma.booking.groupBy({
        by: ["storeId"],
        where: { ...dateFilter },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
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
    await prisma.globalSetting.update({
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

export const updateStoreSettingsByAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  const {
    name,
    description,
    images,
    headerImageUrl,
    schedule,
    tier,
    commissionRate,
    subscriptionFee,
  } = req.body;
  const adminUserId = req.user.id;

  try {
    const originalStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!originalStore) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    if (schedule) {
      for (const dayKey of Object.keys(schedule)) {
        const dayData = schedule[dayKey];
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
    await prisma.store.update({
      where: { id: storeId },
      data: { name, description, images, headerImageUrl },
    });

    const hasBusinessModelChanged =
      originalStore.tier !== tier ||
      originalStore.commissionRate !== parseFloat(commissionRate) ||
      originalStore.subscriptionFee !== parseFloat(subscriptionFee);

    if (hasBusinessModelChanged) {
      const existingRequest = await prisma.approvalRequest.findFirst({
        where: {
          storeId: storeId,
          status: "PENDING",
          requestType: "BUSINESS_MODEL_CHANGE",
        },
      });

      if (existingRequest) {
        return res.status(400).json({
          message:
            "Sudah ada permintaan perubahan model bisnis untuk toko ini yang sedang menunggu persetujuan.",
        });
      }

      await prisma.approvalRequest.create({
        data: {
          storeId: storeId,
          requestType: "BUSINESS_MODEL_CHANGE",
          details: {
            message: `Admin (${req.user.name}) meminta perubahan model bisnis untuk toko "${originalStore.name}".`,
            from: {
              tier: originalStore.tier,
              commissionRate: originalStore.commissionRate,
              subscriptionFee: originalStore.subscriptionFee,
            },
            to: {
              tier: tier,
              commissionRate: tier === "BASIC" ? parseFloat(commissionRate) : 0,
              subscriptionFee:
                tier === "PRO" ? parseFloat(subscriptionFee) : null,
            },
          },
          status: "PENDING",
          requestedById: adminUserId,
        },
      });

      return res.json({
        message:
          "Perubahan profil berhasil disimpan. Perubahan model bisnis telah dikirim untuk persetujuan Developer.",
      });
    }

    res.json({
      message: "Pengaturan toko berhasil diperbarui.",
    });
  } catch (error) {
    next(error);
  }
};

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

export const deleteBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ message: "Banner berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

export const createStoreByAdmin = async (req, res, next) => {
  const {
    name,
    location,
    description,
    ownerId,
    tier,
    commissionRate,
    subscriptionFee,
  } = req.body;
  const adminUserId = req.user.id;

  if (!name || !location || !ownerId || !tier) {
    return res
      .status(400)
      .json({ message: "Nama, lokasi, pemilik, dan tipe toko wajib diisi." });
  }

  try {
    const newStore = await prisma.store.create({
      data: {
        name,
        location,
        description,
        ownerId,
        storeStatus: "pending",
        tier,
        commissionRate: tier === "BASIC" ? parseFloat(commissionRate) : 0,
        subscriptionFee: tier === "PRO" ? parseFloat(subscriptionFee) : null,
        images: [],
      },
    });

    await prisma.approvalRequest.create({
      data: {
        storeId: newStore.id,
        requestType: "NEW_STORE_APPROVAL",
        details: {
          message: `Toko baru "${name}" dibuat oleh Admin ${req.user.name} dan menunggu persetujuan.`,
          storeName: name,
          ownerId: ownerId,
          createdByAdmin: adminUserId,
        },
        status: "PENDING",
        requestedById: adminUserId,
      },
    });

    res.status(201).json({
      message: "Toko berhasil dibuat dan permintaan persetujuan dikirim.",
      store: newStore,
    });
  } catch (error) {
    next(error);
  }
};

const generateInvoiceData = async (storeId, period, adminUser) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!store) {
    throw new Error("Toko tidak ditemukan.");
  }

  let invoiceAmount = 0;
  let invoiceDescription = "";

  if (store.tier === "PRO") {
    invoiceAmount = store.subscriptionFee || 0;
    const periodDate = new Date(`${period}-01`);
    const periodString = periodDate.toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });
    invoiceDescription = `Biaya Langganan StrideBase PRO Periode ${periodString}`;
    if (invoiceAmount <= 0) {
      throw new Error(
        "Toko PRO ini tidak memiliki biaya langganan yang valid."
      );
    }
  } else {
    throw new Error("Fitur ini hanya untuk toko PRO.");
  }

  // Membuat objek invoice tiruan untuk pratinjau
  const previewData = {
    invoiceNumber: `PREVIEW-${Date.now()}`,
    status: "PREVIEW",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    totalAmount: invoiceAmount,
    items: [
      {
        id: "preview-item-1",
        description: invoiceDescription,
        quantity: 1,
        unitPrice: invoiceAmount,
        total: invoiceAmount,
      },
    ],
    notes: `Tagihan untuk ${store.name} periode ${period}. Mohon segera lakukan pembayaran.`,
    store: {
      name: store.name,
      location: store.location,
      ownerUser: {
        email: store.owner.email,
      },
    },
    // Menambahkan detail penerbit
    issuer: {
      id: adminUser.id,
      name: adminUser.name,
    },
  };
  return previewData;
};

// --- FUNGSI DIPERBARUI ---
// @desc    Preview an invoice before sending
// @route   POST /api/admin/stores/:storeId/invoices/preview
export const previewStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period } = req.body;
  try {
    // req.user berisi data admin yang login
    const previewData = await generateInvoiceData(storeId, period, req.user);
    res.json(previewData);
  } catch (error) {
    next(error);
  }
};

// --- FUNGSI DIPERBARUI ---
// @desc    Create and send an invoice to a store based on its tier
// @route   POST /api/admin/stores/:storeId/invoices
export const createStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period, notes } = req.body;
  const adminUserId = req.user.id; // Mendapatkan ID admin yang sedang login

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    // Menggunakan fungsi generateInvoiceData yang sudah dimodifikasi
    const generatedData = await generateInvoiceData(storeId, period, req.user);

    const newInvoice = await prisma.invoice.create({
      data: {
        storeId: storeId,
        totalAmount: generatedData.totalAmount,
        status: "SENT",
        issueDate: generatedData.issueDate,
        dueDate: generatedData.dueDate,
        invoiceNumber: `INV-${store.name
          .substring(0, 3)
          .toUpperCase()}-${Date.now()}`,
        items: generatedData.items,
        notes: notes || generatedData.notes,
        issuedById: adminUserId, // <-- MENYIMPAN ID PENERBIT
      },
    });

    if (store) {
      await createNotificationForUser(
        store.ownerId,
        `Anda memiliki tagihan baru sebesar Rp ${generatedData.totalAmount.toLocaleString(
          "id-ID"
        )} yang perlu dibayar.`,
        `/partner/wallet`
      );
    }

    res.status(201).json({
      message: "Invoice berhasil dibuat dan dikirim ke mitra.",
      invoice: newInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// --- (Fungsi lainnya tidak berubah) ---
export const getInvoiceByIdForAdmin = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.invoiceId },
      include: {
        store: {
          include: {
            owner: { select: { name: true, email: true } },
          },
        },
        issuer: { select: { id: true, name: true } }, // <-- Mengambil data penerbit
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice tidak ditemukan." });
    }
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getStoreInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { storeId: req.params.storeId },
      orderBy: { issueDate: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const checkExistingInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period } = req.body;

  try {
    const startDate = new Date(`${period}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        storeId: storeId,
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (existingInvoice) {
      return res.status(200).json({ exists: true, invoice: existingInvoice });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};
