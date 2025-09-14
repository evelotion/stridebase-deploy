// File: server/controllers/user.controller.js (Perbaikan Final)

import prisma from "../config/prisma.js";

export const updateUserProfile = async (req, res, next) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Nama tidak boleh kosong." });
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
    res.json({
      message: "Profil berhasil diperbarui.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

export const addUserAddress = async (req, res, next) => {
  const {
    label,
    recipientName,
    phoneNumber,
    street,
    city,
    province,
    postalCode,
    country,
  } = req.body;
  if (
    !recipientName ||
    !phoneNumber ||
    !street ||
    !city ||
    !province ||
    !postalCode ||
    !country
  ) {
    return res.status(400).json({ message: "Semua kolom alamat wajib diisi." });
  }
  try {
    const newAddress = await prisma.address.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json(newAddress);
  } catch (error) {
    next(error);
  }
};

export const deleteUserAddress = async (req, res, next) => {
  try {
    const address = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!address) {
      return res
        .status(403)
        .json({
          message: "Anda tidak memiliki izin atau alamat tidak ditemukan.",
        });
    }
    await prisma.address.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Alamat berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    // --- PERBAIKAN DI SINI: Menggunakan 'isRead' bukan 'readStatus' ---
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsAsRead = async (req, res, next) => {
  try {
    // --- PERBAIKAN DI SINI: Menggunakan 'isRead' bukan 'readStatus' ---
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ message: "Semua notifikasi ditandai terbaca." });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyData = async (req, res, next) => {
  try {
    const loyaltyData = await prisma.loyaltyPoint.findUnique({
      where: { userId: req.user.id },
    });
    res.json(loyaltyData || { points: 0, transactions: [] });
  } catch (error) {
    next(error);
  }
};

export const redeemLoyaltyPoints = async (req, res, next) => {
  // Implementasi Anda di sini
  res.json({ message: "Fungsi redeem belum diimplementasikan." });
};

export const getRedeemedPromos = async (req, res, next) => {
  try {
    const promos = await prisma.promo.findMany({
      where: { userId: req.user.id, isRedeemed: false },
      orderBy: { startDate: "desc" },
    });
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const lastBookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { storeId: true },
    });

    if (lastBookings.length === 0) {
      return res.json([]);
    }

    const lastVisitedStoreIds = [
      ...new Set(lastBookings.map((b) => b.storeId)),
    ];

    const recommendations = await prisma.store.findMany({
      where: {
        id: { notIn: lastVisitedStoreIds },
        storeStatus: "active",
      },
      take: 3,
      orderBy: { rating: "desc" },
    });

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};
