// File: server/controllers/partner.controller.js

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";
import cloudinary from "../config/cloudinary.js";

// --- MIDDLEWARE: Cari Toko ---
export const findMyStore = async (req, res, next) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
      include: { owner: true, schedules: true },
    });
    if (!store)
      return res
        .status(404)
        .json({ message: "Anda tidak memiliki toko terdaftar." });
    req.store = store;
    next();
  } catch (error) {
    next(error);
  }
};

// --- DASHBOARD ---
export const getPartnerDashboard = async (req, res, next) => {
  try {
    const storeId = req.store.id;

    // Total Revenue dari Ledger (Hanya pendapatan mitra)
    const netRevenue = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { storeId, type: "PARTNER_INCOME" },
    });

    const newOrders = await prisma.booking.count({
      where: { storeId, status: "confirmed" },
    });
    const completedOrders = await prisma.booking.count({
      where: { storeId, status: "completed" },
    });
    const totalCustomers = await prisma.booking.groupBy({
      by: ["userId"],
      where: { storeId },
    });

    const recentOrders = await prisma.booking.findMany({
      where: { storeId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    res.json({
      storeName: req.store.name,
      totalRevenue: netRevenue._sum.amount || 0,
      newOrders,
      completedOrders,
      totalCustomers: totalCustomers.length,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.user.name,
        serviceName: o.serviceName,
        status: o.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// --- ORDERS ---
export const getPartnerOrders = async (req, res, next) => {
  try {
    const orders = await prisma.booking.findMany({
      where: { storeId: req.store.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateWorkStatus = async (req, res, next) => {
  const { bookingId } = req.params;
  const { newWorkStatus } = req.body;
  const io = req.io;
  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { workStatus: newWorkStatus },
    });
    if (io) io.to(updated.userId).emit("bookingUpdated", updated);
    await createNotificationForUser(
      updated.userId,
      `Status pesanan #${bookingId.substring(0, 8)}: ${newWorkStatus.replace(
        "_",
        " "
      )}`,
      `/track-order/${bookingId}`
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// --- SERVICES ---
export const getPartnerServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { storeId: req.store.id },
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const createPartnerService = async (req, res, next) => {
  try {
    const { name, description, price, shoeType, duration } = req.body;
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        shoeType,
        duration: parseInt(duration),
        storeId: req.store.id,
      },
    });
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const updatePartnerService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await prisma.service.update({
      where: { id, storeId: req.store.id },
      data: {
        ...req.body,
        price: parseFloat(req.body.price),
        duration: parseInt(req.body.duration),
      },
    });
    res.json(updated);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Layanan tidak ditemukan." });
    next(error);
  }
};

export const deletePartnerService = async (req, res, next) => {
  try {
    await prisma.service.delete({
      where: { id: req.params.id, storeId: req.store.id },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Layanan tidak ditemukan." });
    next(error);
  }
};

// --- SETTINGS ---
export const getPartnerSettings = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.store.id },
      include: { owner: { select: { phone: true } }, schedules: true },
    });
    res.json({ ...store, phone: store.owner?.phone });
  } catch (error) {
    next(error);
  }
};

export const updatePartnerSettings = async (req, res, next) => {
  try {
    const { name, description, location, phone, headerImage, schedule } =
      req.body;
    await prisma.$transaction([
      prisma.store.update({
        where: { id: req.store.id },
        data: { name, description, location, headerImageUrl: headerImage },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { phone },
      }),
    ]);

    if (schedule) {
      for (const day of Object.keys(schedule)) {
        const d = schedule[day];
        await prisma.storeSchedule.upsert({
          where: {
            storeId_dayOfWeek: {
              storeId: req.store.id,
              dayOfWeek: d.dayOfWeek,
            },
          },
          update: {
            openTime: d.opens,
            closeTime: d.closes,
            isClosed: d.isClosed,
          },
          create: {
            storeId: req.store.id,
            dayOfWeek: d.dayOfWeek,
            openTime: d.opens,
            closeTime: d.closes,
            isClosed: d.isClosed,
          },
        });
      }
    }
    res.json({ message: "Pengaturan tersimpan." });
  } catch (error) {
    next(error);
  }
};

export const uploadPartnerPhoto = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "File required." });
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${b64}`,
      { folder: "stridebase_stores" }
    );
    res.json({ message: "Success", filePath: result.secure_url });
  } catch (error) {
    next(error);
  }
};

// --- WALLET & PAYOUT ---
export const getWalletData = async (req, res, next) => {
  try {
    const wallet = await prisma.storeWallet.findUnique({
      where: { storeId: req.store.id },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
    });

    const minPayoutSetting = await prisma.globalSetting.findUnique({
      where: { key: "minPayoutAmount" },
    });
    const minPayout = minPayoutSetting
      ? parseFloat(minPayoutSetting.value)
      : 100000;

    res.json({
      balance: wallet?.balance || 0,
      transactions: wallet?.transactions || [],
      minPayoutAmount: minPayout,
    });
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req, res, next) => {
  const { amount } = req.body;
  try {
    const wallet = await prisma.storeWallet.findUnique({
      where: { storeId: req.store.id },
    });
    if (!wallet || wallet.balance < amount)
      return res.status(400).json({ message: "Saldo tidak cukup." });

    const minPayoutSetting = await prisma.globalSetting.findUnique({
      where: { key: "minPayoutAmount" },
    });
    const minPayout = minPayoutSetting
      ? parseFloat(minPayoutSetting.value)
      : 100000;
    if (amount < minPayout)
      return res
        .status(400)
        .json({ message: `Minimum penarikan Rp ${minPayout}` });

    const pending = await prisma.payoutRequest.findFirst({
      where: { walletId: wallet.id, status: "PENDING" },
    });
    if (pending)
      return res.status(400).json({ message: "Ada penarikan pending." });

    await prisma.$transaction(async (tx) => {
      await tx.storeWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: parseFloat(amount) } },
      });
      const req = await tx.payoutRequest.create({
        data: {
          amount: parseFloat(amount),
          storeId: req.store.id,
          walletId: wallet.id,
          requestedById: req.user.id,
          status: "PENDING",
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          payoutRequestId: req.id,
          amount: parseFloat(amount),
          type: "DEBIT",
          description: "Penarikan Dana",
        },
      });
    });
    res.status(201).json({ message: "Request payout berhasil." });
  } catch (error) {
    next(error);
  }
};

// --- INVOICES (PARTNER SIDE) ---
export const getPartnerInvoices = async (req, res, next) => {
  try {
    // Ambil semua invoice (baik yang UNPAID maupun PAID)
    const invoices = await prisma.invoice.findMany({
      where: { storeId: req.store.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const getOutstandingInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { storeId: req.store.id, status: { in: ["SENT", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// --- REVIEWS ---
export const getPartnerReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { storeId: req.store.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    res.json(reviews.map((r) => ({ ...r, userName: r.user.name })));
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req, res, next) => {
  try {
    const updated = await prisma.review.update({
      where: { id: req.params.reviewId, storeId: req.store.id },
      data: { partnerReply: req.body.reply },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// --- PROMOS ---
export const getPartnerPromos = async (req, res, next) => {
  try {
    const sp = await prisma.storePromo.findMany({
      where: { storeId: req.store.id },
      include: { promo: true },
    });
    res.json(sp.map((s) => s.promo));
  } catch (error) {
    next(error);
  }
};

export const createPartnerPromo = async (req, res, next) => {
  const { code, description, discountType, value, status } = req.body;
  try {
    const promo = await prisma.promo.create({
      data: {
        code,
        description,
        discountType,
        value: parseFloat(value),
        status,
        scope: "STORE_SPECIFIC",
        stores: { create: [{ storeId: req.store.id }] },
      },
    });
    res.status(201).json(promo);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Kode promo sudah ada." });
    next(error);
  }
};

export const updatePartnerPromo = async (req, res, next) => {
  const { promoId } = req.params;
  const { code, description, discountType, value, status } = req.body;
  try {
    const check = await prisma.storePromo.findUnique({
      where: { storeId_promoId: { storeId: req.store.id, promoId } },
    });
    if (!check)
      return res.status(404).json({ message: "Promo tidak ditemukan." });

    const updated = await prisma.promo.update({
      where: { id: promoId },
      data: {
        code,
        description,
        discountType,
        value: parseFloat(value),
        status,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePartnerPromo = async (req, res, next) => {
  const { promoId } = req.params;
  try {
    const check = await prisma.storePromo.findUnique({
      where: { storeId_promoId: { storeId: req.store.id, promoId } },
    });
    if (!check)
      return res.status(404).json({ message: "Promo tidak ditemukan." });

    await prisma.$transaction([
      prisma.storePromo.deleteMany({ where: { promoId } }),
      prisma.promo.delete({ where: { id: promoId } }),
    ]);
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

export const getPartnerReports = async (req, res, next) => {
  try {
    // Placeholder report sederhana
    res.json({ message: "Report endpoint ready" });
  } catch (error) {
    next(error);
  }
};
