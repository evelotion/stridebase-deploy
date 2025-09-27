// File: server/controllers/booking.controller.js (Versi Lengkap & Perbaikan)

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";

// @desc    Get all bookings for the logged-in user
// @route   GET /api/user/bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const userBookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { 
        store: true,
        payment: { select: { status: true } } // <-- TAMBAHKAN INI
      },
      orderBy: { createdAt: "desc" },
    });

    // Format data sebelum dikirim ke frontend
    const formattedBookings = userBookings.map((b) => ({
      id: b.id,
      storeId: b.store.id,
      service: b.serviceName,
      storeName: b.store.name,
      scheduleDate: b.scheduleDate,
      status: b.status,
      paymentStatus: b.payment?.status || 'pending', // <-- TAMBAHKAN INI
      store: b.store,
      userId: b.userId,
    }));
    res.json(formattedBookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
  // Ganti 'service' menjadi 'serviceId'
  const { storeId, serviceId, deliveryOption, schedule, addressId, promoCode } = req.body;
  const userId = req.user.id;

  if (!storeId || !serviceId || !deliveryOption) { // Cek serviceId
    return res.status(400).json({ message: "Data booking tidak lengkap." });
  }

  try {
    // Cari layanan berdasarkan serviceId
    const originalService = await prisma.service.findUnique({
      where: { id: serviceId }, 
    });
    if (!originalService) {
      return res.status(404).json({ message: "Layanan yang dipilih tidak ditemukan." });
    }

    // Kalkulasi harga (logika tetap sama)
    const handlingFee = 2000;
    const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
    let discountAmount = 0;
    const finalTotalPrice = originalService.price + handlingFee + deliveryFee - discountAmount;

    const newBooking = await prisma.booking.create({
      data: {
        totalPrice: finalTotalPrice,
        status: "pending",
        serviceName: originalService.name,
        deliveryOption: deliveryOption,
        scheduleDate: schedule?.date ? new Date(schedule.date) : null,
        notes: req.body.notes || null,
        addressId: deliveryOption === "pickup" ? addressId : null,
        userId: userId,
        storeId: storeId,
        serviceId: serviceId, // Langsung gunakan serviceId
      },
      include: { store: { select: { ownerId: true } } },
    });

    await createNotificationForUser(
      newBooking.store.ownerId,
      `Pesanan baru #${newBooking.id.substring(0,8)} telah masuk dari ${req.user.name}.`,
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

// Fungsi baru untuk membatalkan booking
export const cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id; // Diambil dari token JWT

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Pastikan hanya user yang membuat booking yang bisa membatalkan
        if (booking.userId !== userId) {
            return res.status(403).json({ message: 'Anda tidak berwenang untuk aksi ini.' });
        }

        // Hanya batalkan jika statusnya masih PENDING
        if (booking.status === 'PENDING') {
            const cancelledBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
            });
            res.status(200).json({ message: 'Pesanan berhasil dibatalkan.', booking: cancelledBooking });
        } else {
            // Jika sudah dibayar atau sudah batal sebelumnya
            res.status(400).json({ message: `Pesanan tidak dapat dibatalkan karena statusnya sudah ${booking.status}.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
};