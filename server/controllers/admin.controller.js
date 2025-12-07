// File: server/controllers/admin.controller.js (FULL VERSION)

import prisma from "../config/prisma.js";
import { createNotificationForUser, broadcastThemeUpdate } from "../socket.js";
import cloudinary from "../config/cloudinary.js";
import { loadThemeConfig, getTheme } from "../config/theme.js";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// --- DASHBOARD & STATS ---

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalBookings = await prisma.booking.count();

    // REVISI: Total Revenue diambil dari Ledger (Pendapatan Platform)
    const totalRevenue = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        type: { in: ["PLATFORM_FEE", "COMMISSION"] },
      },
    });

    // Pendapatan kotor (Opsional, jika ingin melihat total uang yang berputar)
    const totalGrossParams = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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
      totalGrossTransaction: totalGrossParams._sum.amount || 0,
      recentBookings,
      pendingPayouts,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportData = async (req, res, next) => {
  try {
    // Implementasi laporan sederhana atau placeholder
    res.json({ message: "Report data endpoint ready" });
  } catch (error) {
    next(error);
  }
};

// --- USER MANAGEMENT ---

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role: newRole } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });

    if (user.role === "mitra" && newRole === "customer") {
      const activeStoresCount = await prisma.store.count({
        where: { ownerId: id, storeStatus: "active" },
      });
      if (activeStoresCount > 0) {
        return res.status(400).json({
          message: `User masih memiliki ${activeStoresCount} toko aktif. Nonaktifkan toko dulu.`,
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const changeUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  try {
    const dataToUpdate = { status: newStatus };
    if (newStatus === "active") {
      dataToUpdate.isEmailVerified = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    if (newStatus === "active") {
      await createNotificationForUser(
        updatedUser.id,
        "Selamat! Akun Anda telah diaktifkan oleh Admin.",
        "/dashboard"
      );
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const createUserByAdmin = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "active",
        isEmailVerified: true,
      },
    });

    res.status(201).json({
      message: `Pengguna "${name}" berhasil dibuat.`,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const requestUserDeletion = async (req, res, next) => {
  const { id: userIdToDelete } = req.params;
  const adminUserId = req.user.id;

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
    });
    if (!userToDelete)
      return res.status(404).json({ message: "User tidak ditemukan." });

    if (userToDelete.role !== "customer") {
      return res
        .status(400)
        .json({
          message: "Hanya user role customer yang bisa dihapus request ini.",
        });
    }

    const existingRequest = await prisma.approvalRequest.findFirst({
      where: {
        requestType: "USER_DELETION",
        status: "PENDING",
        details: { path: ["userId"], equals: userIdToDelete },
      },
    });

    if (existingRequest)
      return res
        .status(409)
        .json({ message: "Request penghapusan sudah ada." });

    await prisma.approvalRequest.create({
      data: {
        requestType: "USER_DELETION",
        details: {
          message: `Admin (${req.user.name}) meminta hapus user "${userToDelete.name}".`,
          userId: userToDelete.id,
          userName: userToDelete.name,
          userEmail: userToDelete.email,
        },
        status: "PENDING",
        requestedById: adminUserId,
      },
    });

    res
      .status(200)
      .json({ message: "Request penghapusan dikirim ke Developer." });
  } catch (error) {
    next(error);
  }
};

// --- STORE MANAGEMENT ---

export const getAllStores = async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

// REVISI: Create Store dengan Model Bisnis Baru
export const createStoreByAdmin = async (req, res, next) => {
  const {
    name,
    description,
    location,
    ownerId,
    billingType, // "COMMISSION" atau "CONTRACT"
    commissionRate, // Jika COMMISSION
    contractFee, // Jika CONTRACT
  } = req.body;

  try {
    const store = await prisma.store.create({
      data: {
        name,
        description,
        location,
        owner: { connect: { id: ownerId } },
        storeStatus: "active",

        // Model Bisnis Baru
        billingType: billingType || "COMMISSION",
        commissionRate:
          billingType === "COMMISSION" ? parseFloat(commissionRate || 10) : 0,
        contractFee:
          billingType === "CONTRACT" ? parseFloat(contractFee || 0) : 0,

        // Legacy
        tier: "BASIC",
        subscriptionFee: 0,
      },
    });

    await prisma.storeWallet.create({
      data: { storeId: store.id, balance: 0 },
    });

    await prisma.user.update({
      where: { id: ownerId },
      data: { role: "mitra" },
    });

    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

export const getStoreSettingsForAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { schedules: true },
    });
    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    res.json(store);
  } catch (error) {
    next(error);
  }
};

export const softDeleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ["pending", "confirmed", "in_progress"] },
              },
            },
            stores: {
              where: { storeStatus: "active" },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    // 1. Cek Booking Aktif (Sebagai Customer)
    if (user._count.bookings > 0) {
      return res.status(400).json({
        message: `Gagal hapus. User masih memiliki ${user._count.bookings} pesanan aktif.`,
      });
    }

    // 2. Cek Toko Aktif (Sebagai Mitra)
    if (user._count.stores > 0) {
      return res.status(400).json({
        message: `Gagal hapus. User masih memiliki ${user._count.stores} toko aktif. Nonaktifkan toko terlebih dahulu.`,
      });
    }

    // Eksekusi Soft Delete (Ubah status jadi 'inactive' atau 'deleted')
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: "deleted", // Menandai sebagai terhapus
        email: `deleted_${Date.now()}_${user.email}`, // Opsional: Agar email bisa dipakai lagi
        googleId: null, // Lepas kaitan Google
      },
    });

    res.json({
      message: "User berhasil dihapus (Soft Delete).",
      user: { id: updatedUser.id, status: updatedUser.status },
    });
  } catch (error) {
    next(error);
  }
};

// Soft Delete Store (Menutup Toko)
export const softDeleteStore = async (req, res, next) => {
  const { id } = req.params;

  try {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        wallet: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ["pending", "confirmed", "in_progress"] },
              },
            },
          },
        },
      },
    });

    if (!store) return res.status(404).json({ message: "Toko tidak ditemukan." });

    // 1. Cek Pesanan Berjalan
    if (store._count.bookings > 0) {
      return res.status(400).json({
        message: `Gagal hapus. Toko masih memiliki ${store._count.bookings} pesanan yang belum selesai.`,
      });
    }

    // 2. Cek Saldo Dompet (Opsional: Cegah hapus jika masih ada uang mengendap)
    if (store.wallet && store.wallet.balance > 10000) {
       // Bisa di-skip jika kebijakan membolehkan hangus, tapi baiknya diingatkan
       // return res.status(400).json({ message: "Toko masih memiliki saldo > 10.000. Lakukan payout dulu." });
    }

    // Eksekusi Soft Delete (Ubah status jadi 'inactive')
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        storeStatus: "inactive",
      },
    });

    res.json({
      message: "Toko berhasil dinonaktifkan (Soft Delete).",
      store: updatedStore,
    });
  } catch (error) {
    next(error);
  }
};

// REVISI: Update Store dengan Model Bisnis Baru
export const updateStoreSettingsByAdmin = async (req, res, next) => {
  const { storeId } = req.params;
  const {
    name,
    description,
    storeStatus,
    ownerId,
    billingType,
    commissionRate,
    contractFee,
    schedule, // Opsional jika admin mau update jadwal
  } = req.body;

  try {
    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!currentStore)
      return res.status(404).json({ message: "Toko tidak ditemukan." });

    // Update Jadwal jika ada
    if (schedule) {
      for (const day of Object.keys(schedule)) {
        const dayData = schedule[day];
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

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        description,
        storeStatus,
        ownerId,
        billingType,
        commissionRate:
          billingType === "COMMISSION" ? parseFloat(commissionRate) : 0,
        contractFee: billingType === "CONTRACT" ? parseFloat(contractFee) : 0,
      },
      include: { owner: { select: { name: true } } },
    });

    // Notifikasi Pindah Tangan
    if (ownerId && currentStore.ownerId !== ownerId) {
      await createNotificationForUser(
        currentStore.ownerId,
        `Kepemilikan toko "${currentStore.name}" dipindahkan.`,
        `/partner/dashboard`
      );
      await createNotificationForUser(
        ownerId,
        `Anda ditunjuk sebagai pemilik toko "${currentStore.name}".`,
        `/partner/dashboard`
      );
    }

    res.json({ message: "Toko berhasil diperbarui.", store: updatedStore });
  } catch (error) {
    next(error);
  }
};

export const updateStoreDetailsByAdmin = async (req, res, next) => {
  const { id } = req.params;
  const { name, location, description, headerImageUrl, images } = req.body;

  try {
    // Cek apakah toko ada
    const existingStore = await prisma.store.findUnique({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    // Update data dasar toko
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        name,
        location,
        description,
        headerImageUrl,
        images, // Pastikan dikirim sebagai array string
      },
    });

    res.json({
      message: "Detail toko berhasil diperbarui.",
      store: updatedStore,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: { storeStatus: status },
      include: { owner: true },
    });
    await createNotificationForUser(
      updatedStore.ownerId,
      `Status toko "${updatedStore.name}" diubah menjadi ${status}.`,
      "/partner/dashboard"
    );
    res.json(updatedStore);
  } catch (error) {
    next(error);
  }
};

export const requestDeleteStore = async (req, res, next) => {
  const { storeId } = req.params;
  const adminUserId = req.user.id;
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan." });

    const existingRequest = await prisma.approvalRequest.findFirst({
      where: { storeId, requestType: "STORE_DELETION", status: "PENDING" },
    });
    if (existingRequest)
      return res.status(409).json({ message: "Request hapus toko sudah ada." });

    await prisma.approvalRequest.create({
      data: {
        requestType: "STORE_DELETION",
        details: {
          message: `Admin (${req.user.name}) meminta hapus toko "${store.name}".`,
          storeName: store.name,
        },
        status: "PENDING",
        requestedById: adminUserId,
        storeId: storeId,
      },
    });
    res
      .status(200)
      .json({ message: "Request hapus toko dikirim ke Developer." });
  } catch (error) {
    next(error);
  }
};

export const uploadAdminPhoto = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File required." });
  const fileStr = req.file.buffer.toString("base64");
  cloudinary.uploader
    .upload(`data:${req.file.mimetype};base64,${fileStr}`, {
      folder: "stridebase/store-photos",
    })
    .then((result) => res.status(201).json({ imageUrl: result.secure_url }))
    .catch((err) =>
      res.status(500).json({ message: "Upload failed.", error: err.message })
    );
};

// --- PAYOUT & FINANCE ---

export const getPayoutRequests = async (req, res, next) => {
  try {
    const requests = await prisma.payoutRequest.findMany({
      include: {
        store: { select: { name: true, owner: { select: { name: true } } } },
        requestedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const resolvePayoutRequest = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  try {
    // Gunakan transaksi database agar perubahan bersifat atomik (semua sukses atau semua gagal)
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.payoutRequest.findUnique({ where: { id } });
      
      if (!request || request.status !== "PENDING") {
        throw new Error("Request invalid atau sudah diproses.");
      }

      // Logika REJECTED (Kembalikan Saldo)
      if (status === "REJECTED") {
        await tx.storeWallet.update({
          where: { storeId: request.storeId },
          data: { balance: { increment: request.amount } },
        });
      }

      // Logika APPROVED (Catat di Ledger - BUG FIX Phase 2.2)
      if (status === "APPROVED") {
        await tx.ledgerEntry.create({
          data: {
            storeId: request.storeId,
            payoutId: request.id, // Relasikan dengan payout request
            amount: -request.amount, // Nilai negatif karena uang keluar
            type: "PAYOUT",
            description: `Penarikan Dana disetujui: ${adminNotes || "Oleh Admin"}`,
          },
        });
      }

      // Update status request
      const updatedRequest = await tx.payoutRequest.update({
        where: { id },
        data: {
          status,
          adminNotes,
          resolvedAt: new Date(),
          processedById: req.user.id,
        },
        include: { store: true },
      });

      return updatedRequest;
    });

    // Kirim notifikasi di luar transaksi
    await createNotificationForUser(
      result.store.ownerId,
      `Request Payout Rp ${result.amount.toLocaleString()} telah di-${status}.`,
      "/partner/wallet"
    );

    res.json(result);
  } catch (error) {
    // Tangani error khusus logic kita agar status code-nya sesuai (400 Bad Request)
    if (error.message === "Request invalid atau sudah diproses.") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// --- INVOICE (CONTRACT MODEL) ---

export const previewStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period, notes } = req.body;

  try {
    const [year, month] = period.split("-").map(Number);
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan." });

    if (store.billingType !== "CONTRACT") {
      return res.status(400).json({ message: "Toko bukan tipe KONTRAK." });
    }

    const amount = store.contractFee || 0;
    const dateStr = new Date(year, month - 1).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

    res.json({
      invoiceNumber: `INV/${year}/${month}/PREVIEW`,
      store,
      issuer: req.user,
      items: [
        {
          description: `Biaya Kontrak Mitra - ${dateStr}`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
        },
      ],
      totalAmount: amount,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      notes,
      status: "PREVIEW",
    });
  } catch (error) {
    next(error);
  }
};

export const createStoreInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period, notes } = req.body;

  try {
    const [year, month] = period.split("-").map(Number);
    const store = await prisma.store.findUnique({ where: { id: storeId } });

    if (!store || store.billingType !== "CONTRACT")
      return res.status(400).json({ message: "Invalid Store for Invoice." });

    const existing = await prisma.invoice.findFirst({
      where: { storeId, month, year },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "Invoice periode ini sudah ada." });

    const totalAmount = store.contractFee || 0;
    const dateStr = new Date(year, month - 1).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await prisma.invoice.create({
      data: {
        storeId,
        month,
        year,
        totalAmount,
        issueDate: new Date(),
        dueDate,
        status: "SENT",
        notes,
        issuedById: req.user.id,
        invoiceNumber: `INV/${year}${month
          .toString()
          .padStart(2, "0")}/${store.name.substring(0, 3).toUpperCase()}`,
        items: {
          create: [
            {
              description: `Biaya Kontrak Mitra - ${dateStr}`,
              quantity: 1,
              unitPrice: totalAmount,
              total: totalAmount,
            },
          ],
        },
      },
      include: { store: true },
    });

    await createNotificationForUser(
      store.ownerId,
      `Tagihan Baru: Rp ${totalAmount.toLocaleString("id-ID")}`,
      `/partner/invoices/${invoice.id}`
    );

    res.status(201).json({ message: "Invoice terkirim." });
  } catch (error) {
    next(error);
  }
};

export const getStoreInvoices = async (req, res, next) => {
  const { storeId } = req.params;
  try {
    const invoices = await prisma.invoice.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const checkExistingInvoice = async (req, res, next) => {
  const { storeId } = req.params;
  const { period } = req.body;
  const [year, month] = period.split("-").map(Number);
  try {
    const existing = await prisma.invoice.findFirst({
      where: { storeId, month, year },
    });
    res.json({ exists: !!existing });
  } catch (error) {
    next(error);
  }
};

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
    if (!invoice) return res.status(404).json({ message: "Not Found" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// --- BOOKINGS & REVIEWS ---

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
        service: { select: { name: true } },
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
  const { status } = req.body;
  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, store: true },
    });
    await createNotificationForUser(
      updated.userId,
      `Pesanan #${updated.id.substring(0, 8)} diupdate menjadi ${status}.`,
      `/track-order/${updated.id}`
    );
    res.json(updated);
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
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    await prisma.review.delete({ where: { id } });

    // Recalculate rating
    const agg = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { storeId: review.storeId },
    });
    await prisma.store.update({
      where: { id: review.storeId },
      data: { rating: agg._avg.rating || 0 },
    });

    res.json({ message: "Review deleted." });
  } catch (error) {
    next(error);
  }
};

// --- PROMO & BANNER & SETTINGS ---

export const getAllPromos = async (req, res, next) => {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

export const createPromo = async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    value,
    startDate,
    endDate,
    usageLimit,
    minTransaction,
    forNewUser,
  } = req.body;
  try {
    const newPromo = await prisma.promo.create({
      data: {
        code,
        description,
        discountType,
        value,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        minTransaction,
        forNewUser,
      },
    });
    res.status(201).json(newPromo);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Kode Promo sudah ada." });
    next(error);
  }
};

export const updatePromo = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  try {
    // Konversi tanggal string ke Date object jika ada
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const updated = await prisma.promo.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const changePromoStatus = async (req, res, next) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  try {
    const updated = await prisma.promo.update({
      where: { id },
      data: { status: newStatus },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePromo = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.promo.delete({ where: { id } });
    res.json({ message: "Promo deleted." });
  } catch (error) {
    next(error);
  }
};

export const validatePromoCode = async (req, res, next) => {
  const { code } = req.body;
  try {
    const promo = await prisma.promo.findUnique({ where: { code } });
    if (!promo || promo.status !== "active")
      return res.status(404).json({ message: "Invalid Code" });
    res.json(promo);
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
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: req.body,
    });
    res.json(banner);
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.banner.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getOperationalSettings = async (req, res, next) => {
  try {
    const settings = await prisma.globalSetting.findMany();
    const settingsObject = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsObject);
  } catch (error) {
    next(error);
  }
};

export const updateOperationalSettings = async (req, res, next) => {
  const settings = req.body;
  try {
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.globalSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    if (settings.homePageTheme) {
      await loadThemeConfig();
      broadcastThemeUpdate(getTheme());
    }
    res.json({ message: "Settings updated." });
  } catch (error) {
    next(error);
  }
};
