// File: server/controllers/admin.controller.js (Lengkap dengan Validasi Peran Mitra)

import prisma from "../config/prisma.js";
import { createNotificationForUser, broadcastThemeUpdate } from "../socket.js";
import cloudinary from "../config/cloudinary.js";
import { loadThemeConfig } from "../config/theme.js";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// @desc    Get stats for admin dashboard
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        // PERBAIKAN: Menggunakan 'paid' (huruf kecil) sesuai enum
        status: "paid",
      },
    });
    const totalPlatformEarnings = await prisma.platformEarning.aggregate({
      // --- PERBAIKAN UTAMA DI SINI ---
      _sum: {
        earnedAmount: true,
      },
    });
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
    });
    const pendingPayouts = await prisma.payoutRequest.count({
      where: { status: "PENDING" },
    });

    res.json({
      totalUsers,
      totalStores,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPlatformEarnings: totalPlatformEarnings._sum.earnedAmount || 0, // Perbaikan nama field
      recentBookings,
      pendingPayouts,
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
      orderBy: {
        createdAt: "desc",
      },
      // Mungkin Anda ingin menambahkan informasi lain di sini, seperti jumlah transaksi
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
export const changeUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role: newRole } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    // --- BLOK VALIDASI BARU ---
    // Jika mencoba mengubah MITRA menjadi CUSTOMER
    if (user.role === "mitra" && newRole === "customer") {
      const activeStoresCount = await prisma.store.count({
        where: {
          ownerId: id,
          status: "ACTIVE", // Hanya cek toko yang aktif
        },
      });

      if (activeStoresCount > 0) {
        return res.status(400).json({
          message: `Tidak dapat mengubah peran. Pengguna ini masih memiliki ${activeStoresCount} toko aktif. Harap nonaktifkan atau pindahkan kepemilikan toko terlebih dahulu.`,
        });
      }
    }
    // --- AKHIR DARI BLOK VALIDASI BARU ---

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user status (active/blocked)
// @route   PATCH /api/admin/users/:id/status
export const changeUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stores
// @route   GET /api/admin/stores
export const getAllStores = async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store status
// @route   PATCH /api/admin/stores/:id/status
export const updateStoreStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: { status },
      include: { owner: true },
    });
    await createNotificationForUser(
      updatedStore.ownerId,
      `Status toko Anda "${updatedStore.name}" telah diubah menjadi ${status} oleh admin.`,
      "/partner/dashboard"
    );
    res.json(updatedStore);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store details (status and owner) by admin
// @route   PATCH /api/admin/stores/:id/details
export const updateStoreDetailsByAdmin = async (req, res, next) => {
  const { id: storeId } = req.params;
  const { status, ownerId } = req.body;

  try {
    const storeToUpdate = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!storeToUpdate) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const dataToUpdate = {
      status,
      ownerId,
    };

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: dataToUpdate,
      include: {
        owner: { select: { name: true } } // Untuk notifikasi
      }
    });

    // Kirim notifikasi ke pemilik lama (jika berubah)
    if (storeToUpdate.ownerId !== ownerId) {
      await createNotificationForUser(
        storeToUpdate.ownerId,
        `Kepemilikan toko "${storeToUpdate.name}" telah dipindahkan ke pengguna lain oleh admin.`,
        `/partner/dashboard`
      );
      // Notifikasi ke pemilik baru
       await createNotificationForUser(
        ownerId,
        `Anda telah ditunjuk sebagai pemilik baru untuk toko "${storeToUpdate.name}" oleh admin.`,
        `/partner/dashboard`
      );
    }
    
    // Kirim notifikasi jika status berubah
    if (storeToUpdate.status !== status) {
       await createNotificationForUser(
        ownerId, // Kirim ke pemilik yang sekarang
        `Status toko Anda "${storeToUpdate.name}" telah diubah menjadi ${status} oleh admin.`,
        "/partner/dashboard"
      );
    }

    res.json(updatedStore);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payout requests
// @route   GET /api/admin/payout-requests
export const getPayoutRequests = async (req, res, next) => {
  try {
    const requests = await prisma.payoutRequest.findMany({
      include: {
        store: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
  const { status, adminNotes } = req.body; // 'COMPLETED' or 'REJECTED'

  try {
    const request = await prisma.payoutRequest.findUnique({
      where: { id },
    });

    if (!request || request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Permintaan tidak valid atau sudah diproses." });
    }

    if (status === "REJECTED") {
      // Kembalikan dana ke wallet jika ditolak
      await prisma.storeWallet.update({
        where: { storeId: request.storeId },
        data: {
          balance: {
            increment: request.amount,
          },
        },
      });
    }

    const updatedRequest = await prisma.payoutRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        resolvedAt: new Date(),
      },
      include: { store: true },
    });

    await createNotificationForUser(
      updatedRequest.store.ownerId,
      `Permintaan penarikan dana Anda sebesar Rp ${request.amount.toLocaleString(
        "id-ID"
      )} telah di-${status.toLowerCase()}.`,
      "/partner/wallet"
    );
    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a booking status
// @route   PATCH /api/admin/bookings/:id/status
export const updateBookingStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, store: true },
    });
    await createNotificationForUser(
      updatedBooking.userId,
      `Status pesanan Anda #${updatedBooking.id} di toko "${updatedBooking.store.name}" telah diubah menjadi ${status}.`,
      `/track-order/${updatedBooking.id}`
    );
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res, next) => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan" });
    }

    await prisma.review.delete({ where: { id } });

    // Update rating toko setelah ulasan dihapus
    const storeRatings = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { storeId: review.storeId },
    });

    await prisma.store.update({
      where: { id: review.storeId },
      data: {
        averageRating: storeRatings._avg.rating || 0,
      },
    });

    res.json({ message: "Ulasan berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report data
// @route   GET /api/admin/reports
export const getReportData = async (req, res, next) => {
  try {
    // Implementasi logika laporan di sini
    res.json({ message: "Report data endpoint" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get operational settings
// @route   GET /api/admin/settings
export const getOperationalSettings = async (req, res, next) => {
  try {
    const settings = await prisma.globalSetting.findMany();
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsObject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update operational settings
// @route   POST /api/admin/settings
export const updateOperationalSettings = async (req, res, next) => {
  const settingsToUpdate = req.body;
  try {
    const updatePromises = Object.entries(settingsToUpdate).map(
      ([key, value]) =>
        prisma.globalSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
    );
    await Promise.all(updatePromises);

    // Jika tema berubah, broadcast pembaruan
    if (settingsToUpdate.homePageTheme) {
      await loadThemeConfig();
      broadcastThemeUpdate(getTheme());
    }

    res.json({ message: "Pengaturan berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store settings for admin
// @route   GET /api/admin/stores/:storeId/settings
export const getStoreSettingsForAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      // --- PERBAIKAN DI SINI ---
      select: {
        name: true,
        description: true,
        location: true,
        phone: true,
        images: true,
        headerImageUrl: true,
        schedules: true, // <-- TAMBAHKAN BARIS INI
        photoLimit: true,
        tier: true,
        commissionRate: true,
        subscriptionFee: true,
      },
      // --- AKHIR PERBAIKAN ---
    });

    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }
    res.json(store);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings by admin
// @route   PUT /api/admin/stores/:storeId/settings
export const updateStoreSettingsByAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  const { tier, commissionRate, subscriptionFee, businessModel } = req.body;
  const adminUserId = req.user.id;

  try {
    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!currentStore) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const changes = {
      from: {
        tier: currentStore.tier,
        commissionRate: currentStore.commissionRate,
        subscriptionFee: currentStore.subscriptionFee,
        businessModel: currentStore.businessModel,
      },
      to: {
        tier,
        commissionRate,
        subscriptionFee,
        businessModel,
      },
    };

    await prisma.approvalRequest.create({
      data: {
        requestType: "BUSINESS_MODEL_CHANGE",
        details: {
          message: `Admin (${req.user.name}) meminta perubahan model bisnis untuk toko "${currentStore.name}".`,
          ...changes,
        },
        status: "PENDING",
        requestedById: adminUserId,
        storeId: storeId,
      },
    });

    res.status(200).json({
      message:
        "Permintaan perubahan telah dikirim ke developer untuk persetujuan.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for store by admin
// @route   POST /api/admin/stores/upload-photo
export const uploadAdminPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }
  const fileStr = req.file.buffer.toString("base64");
  const uploadOptions = {
    folder: "stridebase/store-photos",
    // transformation: [{ width: 800, height: 600, crop: "limit" }],
  };
  cloudinary.uploader
    .upload(`data:${req.file.mimetype};base64,${fileStr}`, uploadOptions)
    .then((result) => {
      res.status(201).json({ imageUrl: result.secure_url });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Gagal mengunggah gambar.", error: err.message });
    });
};

// @desc    Create a new store by admin
// @route   POST /api/admin/stores/new
export const createStoreByAdmin = async (req, res, next) => {
  const { name, description, address, city, phone, ownerId, category, images } =
    req.body;
  try {
    const store = await prisma.store.create({
      data: {
        name,
        description,
        address,
        city,
        phone,
        owner: { connect: { id: ownerId } },
        category,
        images,
        status: "ACTIVE",
        tier: "BASIC",
        commissionRate: 0.1,
        subscriptionFee: 0,
        businessModel: "COMMISSION",
      },
    });
    // Create a wallet for the new store
    await prisma.storeWallet.create({
      data: {
        storeId: store.id,
        balance: 0,
      },
    });
    // Change user role to mitra if they are not already
    await prisma.user.update({
      where: { id: ownerId },
      data: { role: "mitra" },
    });
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners for admin
// @route   GET /api/admin/banners
export const getAllBannersForAdmin = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner
// @route   POST /api/admin/banners
export const createBanner = async (req, res, next) => {
  const { title, imageUrl, linkUrl, isActive, order } = req.body;
  try {
    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        order: Number(order),
      },
    });
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
export const updateBanner = async (req, res, next) => {
  const { id } = req.params;
  const { title, imageUrl, linkUrl, isActive, order } = req.body;
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        order: Number(order),
      },
    });
    res.json(banner);
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
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// @desc    Preview a store invoice
// @route   POST /api/admin/stores/:storeId/invoices/preview
export const previewStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { month, year, items } = req.body;
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    let totalAmount = 0;
    const invoiceItems = items.map((item) => {
      totalAmount += item.amount;
      return {
        description: item.description,
        amount: item.amount,
      };
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

    const previewData = {
      store,
      month,
      year,
      items: invoiceItems,
      totalAmount,
      dueDate,
      status: "DRAFT",
    };

    res.json(previewData);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a store invoice
// @route   POST /api/admin/stores/:storeId/invoices
export const createStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { month, year, items } = req.body;
  const adminUserId = req.user.id;

  try {
    let totalAmount = 0;
    const invoiceItems = items.map((item) => {
      totalAmount += item.amount;
      return {
        description: item.description,
        amount: item.amount,
      };
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const invoice = await prisma.invoice.create({
      data: {
        storeId,
        month,
        year,
        totalAmount,
        dueDate,
        status: "UNPAID",
        items: {
          create: invoiceItems,
        },
        issuedById: adminUserId,
      },
      include: {
        items: true,
        store: { select: { name: true, ownerId: true } },
      },
    });

    await createNotificationForUser(
      invoice.store.ownerId,
      `Tagihan baru telah diterbitkan untuk toko Anda "${
        invoice.store.name
      }" sebesar Rp ${totalAmount.toLocaleString("id-ID")}.`,
      `/partner/invoices/${invoice.id}`
    );

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invoices for a store
// @route   GET /api/admin/stores/:storeId/invoices
export const getStoreInvoices = async (req, res, next) => {
  const { storeId } = req.params;
  try {
    const invoices = await prisma.invoice.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Check if an invoice for a specific month/year already exists
// @route   POST /api/admin/stores/:storeId/invoices/check
export const checkExistingInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { month, year } = req.body;
  try {
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        storeId,
        month,
        year,
      },
    });
    res.json({ exists: !!existingInvoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Get an invoice by ID
// @route   GET /api/admin/invoices/:invoiceId
export const getInvoiceByIdForAdmin = async (req, res, next) => {
  const { invoiceId } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        store: { include: { owner: true } },
        items: true,
        issuedBy: { select: { name: true } },
      },
    });
    if (!invoice) {
      return res.status(404).json({ message: "Tagihan tidak ditemukan." });
    }
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a promo code
// @route   POST /api/admin/promos/validate
export const validatePromoCode = async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Kode promo diperlukan." });
  }
  try {
    const promo = await prisma.promo.findUnique({
      where: { code },
    });
    if (
      !promo ||
      !promo.isActive ||
      promo.status !== "ACTIVE" ||
      new Date() > new Date(promo.endDate)
    ) {
      return res.status(404).json({ message: "Kode promo tidak valid." });
    }
    res.json({ message: "Kode promo valid.", promo });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to delete a store
// @route   POST /api/admin/stores/:storeId/request-deletion
export const requestDeleteStore = async (req, res, next) => {
  const { storeId } = req.params;
  const adminUserId = req.user.id;

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const existingRequest = await prisma.approvalRequest.findFirst({
      where: {
        storeId,
        requestType: "STORE_DELETION",
        status: "PENDING",
      },
    });
    if (existingRequest) {
      return res.status(409).json({
        message:
          "Permintaan penghapusan untuk toko ini sudah ada dan menunggu persetujuan.",
      });
    }

    await prisma.approvalRequest.create({
      data: {
        requestType: "STORE_DELETION",
        details: {
          message: `Admin (${req.user.name}) meminta untuk menghapus toko "${store.name}".`,
          storeName: store.name,
        },
        status: "PENDING",
        requestedById: adminUserId,
        storeId: storeId,
      },
    });

    res.status(200).json({
      message:
        "Permintaan penghapusan toko telah dikirim ke developer untuk persetujuan.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user by an admin
// @route   POST /api/admin/users
export const createUserByAdmin = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "active", // Dibuat oleh admin, langsung aktif
        isEmailVerified: true, // Dibuat oleh admin, anggap email terverifikasi
      },
    });

    res.status(201).json({
      message: `Pengguna "${name}" berhasil dibuat dengan peran ${role}.`,
      user: newUser,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({
          message: "Email sudah terdaftar. Silakan gunakan email yang lain.",
        });
      }
    }
    next(error);
  }
};

// @desc    Request to delete a user by admin
// @route   POST /api/admin/users/:id/request-deletion
export const requestUserDeletion = async (req, res, next) => {
  const { id: userIdToDelete } = req.params;
  const adminUserId = req.user.id;

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
    });

    if (!userToDelete) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    if (userToDelete.role !== "customer") {
      return res.status(400).json({
        message:
          "Hanya pengguna dengan peran 'customer' yang bisa dihapus. Ubah peran pengguna ini terlebih dahulu.",
      });
    }

    const existingRequest = await prisma.approvalRequest.findFirst({
      where: {
        "details.userId": userIdToDelete,
        requestType: "USER_DELETION",
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        message:
          "Permintaan penghapusan untuk pengguna ini sudah ada dan sedang menunggu persetujuan.",
      });
    }

    await prisma.approvalRequest.create({
      data: {
        requestType: "USER_DELETION",
        details: {
          message: `Admin (${req.user.name}) meminta untuk menghapus pengguna "${userToDelete.name}".`,
          userId: userToDelete.id,
          userName: userToDelete.name,
          userEmail: userToDelete.email,
        },
        status: "PENDING",
        requestedById: adminUserId,
      },
    });

    res.status(200).json({
      message: `Permintaan untuk menghapus pengguna "${userToDelete.name}" telah dikirim ke developer untuk persetujuan.`,
    });
  } catch (error) {
    next(error);
  }
};

// PROMO MANAGEMENT

// @desc    Get all promos
// @route   GET /api/admin/promos
export const getAllPromos = async (req, res, next) => {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new promo
// @route   POST /api/admin/promos
export const createPromo = async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minPurchase,
    startDate,
    endDate,
    usageLimit,
  } = req.body;
  try {
    const newPromo = await prisma.promo.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        maxDiscount,
        minPurchase,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
      },
    });
    res.status(201).json(newPromo);
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("code")) {
      return res
        .status(400)
        .json({ message: "Kode promo sudah ada. Silakan gunakan kode lain." });
    }
    next(error);
  }
};

// @desc    Update a promo
// @route   PUT /api/admin/promos/:id
export const updatePromo = async (req, res, next) => {
  const { id } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minPurchase,
    startDate,
    endDate,
    usageLimit,
    status,
  } = req.body;
  try {
    const updatedPromo = await prisma.promo.update({
      where: { id },
      data: {
        code,
        description,
        discountType,
        discountValue,
        maxDiscount,
        minPurchase,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
        status,
      },
    });
    res.json(updatedPromo);
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("code")) {
      return res
        .status(400)
        .json({ message: "Kode promo sudah ada. Silakan gunakan kode lain." });
    }
    next(error);
  }
};

// @desc    Change promo status (activate/deactivate)
// @route   PATCH /api/admin/promos/:id/status
export const changePromoStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const promo = await prisma.promo.update({
      where: { id },
      data: { status },
    });
    res.json(promo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a promo
// @route   DELETE /api/admin/promos/:id
export const deletePromo = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.promo.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
