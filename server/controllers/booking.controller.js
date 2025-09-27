import prisma from "../config/prisma.js";

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
export const createBooking = async (req, res, next) => {
  const {
    storeId,
    serviceId,
    serviceName,
    scheduleDate,
    deliveryOption,
    addressId,
    notes,
    promoCode,
  } = req.body;
  const userId = req.user.id;

  try {
    // Validasi dasar
    if (!storeId || !serviceId || !serviceName || !scheduleDate) {
      return res.status(400).json({ message: "Data wajib tidak lengkap." });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Layanan tidak ditemukan." });
    }

    // Hitung total harga awal
    let totalPrice = service.price;
    const deliveryFee = deliveryOption === "pickup" ? 10000 : 0; // Contoh biaya antar-jemput
    const handlingFee = 2000; // Contoh biaya penanganan
    totalPrice += deliveryFee + handlingFee;

    // Validasi dan terapkan promo jika ada
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode },
      });
      if (
        promo &&
        promo.isActive &&
        new Date() >= promo.startDate &&
        new Date() <= promo.endDate &&
        promo.usageLimit > promo.timesUsed
      ) {
        let discountAmount = 0;
        if (promo.discountType === "PERCENTAGE") {
          discountAmount = (service.price * promo.value) / 100;
        } else {
          discountAmount = promo.value;
        }
        totalPrice -= discountAmount;
      }
    }

    // --- INI ADALAH LOGIKA BARU YANG DITAMBAHKAN ---
    const bookingExpiryMinutes = 15; // Atur durasi kedaluwarsa di sini (15 menit)
    const expiresAt = new Date(Date.now() + bookingExpiryMinutes * 60 * 1000);
    // ---------------------------------------------

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        storeId,
        serviceId,
        serviceName,
        scheduleDate: new Date(scheduleDate),
        deliveryOption,
        addressId,
        notes,
        totalPrice: Math.max(0, totalPrice), // Pastikan harga tidak negatif
        status: "pending",
        expiresAt: expiresAt, // <-- Field baru ditambahkan di sini
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            name: true,
            location: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Pastikan pengguna hanya bisa mengakses booking miliknya, atau jika dia admin/mitra toko tsb
    if (
      booking.userId !== userId &&
      userRole !== "admin" &&
      booking.store.ownerId !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Tidak diizinkan mengakses pesanan ini." });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/user/bookings
// @access  Private (User)
export const getUserBookings = async (req, res, next) => {
  try {
    const userBookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        store: true,
        payment: { select: { status: true } },
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
      paymentStatus: b.payment?.status || "pending",
      store: b.store,
      userId: b.userId,
    }));
    res.json(formattedBookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (User)
export const cancelBooking = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Tidak diizinkan membatalkan pesanan ini." });
    }

    // Hanya pesanan yang masih 'pending' yang bisa dibatalkan
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Tidak dapat membatalkan pesanan dengan status '${booking.status}'.`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.json({
      message: "Pesanan berhasil dibatalkan.",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
