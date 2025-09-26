// File: server/controllers/booking.controller.js (Versi Lengkap & Perbaikan)

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";

// @desc    Get all bookings for the logged-in user
// @route   GET /api/user/bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const userBookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { store: true },
      orderBy: { createdAt: "desc" }, // Diubah agar lebih relevan
    });

    // Format data sebelum dikirim ke frontend
    const formattedBookings = userBookings.map((b) => ({
      id: b.id,
      storeId: b.store.id,
      service: b.serviceName,
      storeName: b.store.name,
      scheduleDate: b.scheduleDate, // Menggunakan createdAt sebagai fallback jika scheduleDate null
      status: b.status,
      store: b.store,
      userId: b.userId, // Menambahkan userId untuk socket update
    }));
    res.json(formattedBookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
  const { storeId, service, deliveryOption, schedule, addressId, promoCode } =
    req.body;
  const userId = req.user.id;

  if (!storeId || !service || !deliveryOption) {
    return res.status(400).json({ message: "Data booking tidak lengkap." });
  }

  try {
    const originalService = await prisma.service.findUnique({
      where: { id: service.id },
    });
    if (!originalService) {
      return res
        .status(404)
        .json({ message: "Layanan yang dipilih tidak ditemukan." });
    }

    // Kalkulasi harga yang akurat, sama seperti di frontend
    const handlingFee = 2000;
    const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
    let discountAmount = 0;

    // (Opsional) Tambahkan validasi promo code di sini jika diperlukan
    // ...

    const finalTotalPrice =
      originalService.price + handlingFee + deliveryFee - discountAmount;

    const newBooking = await prisma.booking.create({
      data: {
        totalPrice: finalTotalPrice,
        status: "pending", // PERBAIKAN: Menggunakan enum 'pending' yang valid
        serviceName: originalService.name,
        deliveryOption: deliveryOption,
        scheduleDate: schedule?.date ? new Date(schedule.date) : null,
        notes: req.body.notes || null,
        addressId: deliveryOption === "pickup" ? addressId : null,
        userId: userId,
        storeId: storeId,
        serviceId: service.id,
      },
      include: { store: { select: { ownerId: true } } },
    });

    // Kirim notifikasi ke pemilik toko
    await createNotificationForUser(
      newBooking.store.ownerId,
      `Pesanan baru #${newBooking.id.substring(
        0,
        8
      )} telah masuk dari ${req.user.name}.`,
      `/partner/orders`
    );

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        store: { select: { name: true, location: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // Otorisasi: Pastikan hanya user yang bersangkutan atau admin/mitra yang bisa melihat
    if (
      !booking ||
      (req.user.role === "customer" && booking.userId !== req.user.id)
    ) {
      return res
        .status(404)
        .json({
          message: "Pesanan tidak ditemukan atau Anda tidak memiliki akses.",
        });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};