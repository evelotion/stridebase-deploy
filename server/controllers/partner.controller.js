// File: server/controllers/partner.controller.js

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";
import cloudinary from "../config/cloudinary.js";

// Middleware untuk menemukan toko milik mitra dan melampirkannya ke request
export const findMyStore = async (req, res, next) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
      include: {
        owner: true,
        schedules: true,
      },
    });
    if (!store) {
      return res
        .status(404)
        .json({ message: "Anda tidak memiliki toko terdaftar." });
    }
    req.store = store;
    next();
  } catch (error) {
    next(error);
  }
};

// @desc    Get partner dashboard stats
// @route   GET /api/partner/dashboard
export const getPartnerDashboard = async (req, res, next) => {
  try {
    const storeId = req.store.id;

    const totalRevenuePromise = prisma.payment.aggregate({
      _sum: { amount: true },
      where: { booking: { storeId: storeId }, status: "paid" },
    });

    const newOrdersPromise = prisma.booking.count({
      where: { storeId: storeId, status: "confirmed" },
    });

    const completedOrdersPromise = prisma.booking.count({
      where: { storeId: storeId, status: "completed" }, // 'reviewed' status does not exist
    });

    const totalCustomersPromise = prisma.booking.groupBy({
      by: ["userId"],
      where: { storeId: storeId },
    });

    const recentOrdersPromise = prisma.booking.findMany({
      where: { storeId: storeId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const [
      totalRevenue,
      newOrders,
      completedOrders,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      totalRevenuePromise,
      newOrdersPromise,
      completedOrdersPromise,
      totalCustomersPromise,
      recentOrdersPromise,
    ]);

    res.json({
      storeName: req.store.name,
      totalRevenue: totalRevenue._sum.amount || 0,
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

// @desc    Get all orders for the partner's store
// @route   GET /api/partner/orders
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

// @desc    Update work status of an order
// @route   PATCH /api/partner/orders/:bookingId/work-status
export const updateWorkStatus = async (req, res, next) => {
  const { bookingId } = req.params;
  const { newWorkStatus } = req.body;
  const io = req.io; // Mengambil instance Socket.IO dari request

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { workStatus: newWorkStatus },
    });

    // --- PERBAIKAN UTAMA: Kirim event ke room spesifik pengguna ---
    if (io) {
      // Kirim pembaruan real-time hanya ke pengguna yang memesan
      io.to(updatedBooking.userId).emit("bookingUpdated", updatedBooking);
      console.log(
        `Socket event 'bookingUpdated' dipancarkan untuk booking ${updatedBooking.id} ke user ${updatedBooking.userId}`
      );
    }
    // --- AKHIR PERBAIKAN ---

    await createNotificationForUser(
      updatedBooking.userId,
      `Status pengerjaan pesanan Anda #${bookingId.substring(
        0,
        8
      )} telah diperbarui menjadi: ${newWorkStatus}.`,
      `/track/${bookingId}`
    );

    res.json({
      message: "Status pengerjaan berhasil diperbarui.",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services for the partner's store
// @route   GET /api/partner/services
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

// @desc    Create a new service
// @route   POST /api/partner/services
export const createPartnerService = async (req, res, next) => {
  const { name, description, price, shoeType, duration } = req.body;
  try {
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        shoeType,
        duration: parseInt(duration),
        storeId: req.store.id,
      },
    });
    res.status(201).json(newService);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing service
// @route   PUT /api/partner/services/:serviceId
export const updatePartnerService = async (req, res, next) => {
  const { name, description, price, shoeType, duration } = req.body;
  try {
    const updatedService = await prisma.service.update({
      where: { id: req.params.serviceId },
      data: {
        name,
        description,
        price: parseFloat(price),
        shoeType,
        duration: parseInt(duration),
      },
    });
    res.json(updatedService);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/partner/services/:serviceId
export const deletePartnerService = async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.serviceId } });
    res.status(200).json({ message: "Layanan berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get partner's store settings
// @route   GET /api/partner/settings
export const getPartnerSettings = async (req, res, next) => {
  try {
    const storeWithDetails = await prisma.store.findUnique({
      where: { id: req.store.id },
      include: {
        // Secara eksplisit ambil data pemilik untuk mendapatkan nomor telepon
        owner: {
          select: {
            phone: true,
          },
        },
        schedules: true, // Mengganti 'schedule' menjadi 'schedules' agar konsisten dengan skema
      },
    });

    if (!storeWithDetails) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    // Gabungkan data toko dengan nomor telepon pemiliknya secara aman
    const response = {
      ...storeWithDetails,
      // Cek apakah 'owner' ada sebelum mencoba mengakses 'phone'
      phone: storeWithDetails.owner?.phone || "", // Gunakan optional chaining (?.)
    };
    // Hapus relasi 'owner' dari response akhir agar tidak redundan
    delete response.owner;
    // --- AKHIR PERBAIKAN ---

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update partner's store settings
// @route   PUT /api/partner/settings
export const updatePartnerSettings = async (req, res, next) => {
  const {
    name,
    description,
    location,
    phone, // Data telepon
    images,
    headerImage, // Frontend mengirim 'headerImage'
    schedule,
  } = req.body;

  try {
    await prisma.$transaction([
      prisma.store.update({
        where: { id: req.store.id },
        data: {
          name,
          description,
          location,
          images,
          // Simpan ke database sebagai 'headerImageUrl'
          headerImageUrl: headerImage,
        },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { phone }, // Simpan telepon di tabel User
      }),
    ]);

    if (schedule) {
      for (const day of Object.keys(schedule)) {
        const dayData = schedule[day];
        await prisma.storeSchedule.upsert({
          where: {
            storeId_dayOfWeek: {
              storeId: req.store.id,
              dayOfWeek: dayData.dayOfWeek,
            },
          },
          update: {
            openTime: dayData.opens,
            closeTime: dayData.closes,
            isClosed: dayData.isClosed,
          },
          create: {
            storeId: req.store.id,
            dayOfWeek: dayData.dayOfWeek,
            openTime: dayData.opens,
            closeTime: dayData.closes,
            isClosed: dayData.isClosed,
          },
        });
      }
    }

    res.json({ message: "Pengaturan toko berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for the store gallery
// @route   POST /api/partner/upload-photo
export const uploadPartnerPhoto = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }
  try {
    // Mengubah buffer menjadi data URI yang bisa diunggah
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Mengunggah ke Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "stridebase_stores", // Nama folder di Cloudinary
    });

    // Mengembalikan URL gambar yang aman
    res.json({
      message: "Foto berhasil diunggah.",
      filePath: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for the partner's store
// @route   GET /api/partner/reviews
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

// @desc    Reply to a customer review
// @route   POST /api/partner/reviews/:reviewId/reply
export const replyToReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId, storeId: req.store.id },
      data: { partnerReply: reply },
    });
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get promos for the partner's store
// @route   GET /api/partner/promos
export const getPartnerPromos = async (req, res, next) => {
  try {
    const storePromos = await prisma.storePromo.findMany({
      where: { storeId: req.store.id },
      include: {
        promo: true,
      },
      orderBy: {
        promo: { createdAt: "desc" },
      },
    });

    // Ubah format data agar hanya berisi detail promo
    const promos = storePromos.map((sp) => sp.promo);

    res.json(promos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new promo for the partner's store
// @route   POST /api/partner/promos
export const createPartnerPromo = async (req, res, next) => {
  const { code, description, discountType, value, status } = req.body;
  const storeId = req.store.id;

  try {
    // Validasi batasan promo untuk tier BASIC
    if (req.store.tier === 'BASIC') {
      const promoCount = await prisma.storePromo.count({ where: { storeId } });
      if (promoCount >= 3) {
        return res.status(403).json({ message: "Toko tier BASIC hanya dapat memiliki maksimal 3 promo." });
      }
    }

    const newPromo = await prisma.promo.create({
      data: {
        code,
        description,
        discountType,
        value: parseFloat(value),
        status,
        scope: 'STORE_SPECIFIC', // Promo yang dibuat mitra selalu spesifik untuk tokonya
        stores: {
          create: [{ storeId: storeId }],
        },
      },
    });
    res.status(201).json(newPromo);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        return res.status(400).json({ message: 'Kode promo sudah ada. Silakan gunakan kode lain.' });
    }
    next(error);
  }
};

// @desc    Update a promo for the partner's store
// @route   PUT /api/partner/promos/:promoId
export const updatePartnerPromo = async (req, res, next) => {
  const { promoId } = req.params;
  const { code, description, discountType, value, status } = req.body;
  const storeId = req.store.id;

  try {
    // Pastikan promo ini milik toko yang sedang login
    const storePromo = await prisma.storePromo.findUnique({
      where: { storeId_promoId: { storeId, promoId } },
    });
    if (!storePromo) {
      return res.status(404).json({ message: "Promo tidak ditemukan atau bukan milik Anda." });
    }

    const updatedPromo = await prisma.promo.update({
      where: { id: promoId },
      data: {
        code,
        description,
        discountType,
        value: parseFloat(value),
        status,
      },
    });
    res.json(updatedPromo);
  } catch (error) {
     if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        return res.status(400).json({ message: 'Kode promo sudah ada. Silakan gunakan kode lain.' });
    }
    next(error);
  }
};

// @desc    Delete a promo for the partner's store
// @route   DELETE /api/partner/promos/:promoId
export const deletePartnerPromo = async (req, res, next) => {
  const { promoId } = req.params;
  const storeId = req.store.id;
  try {
     const storePromo = await prisma.storePromo.findUnique({
      where: { storeId_promoId: { storeId, promoId } },
    });
    if (!storePromo) {
      return res.status(404).json({ message: "Promo tidak ditemukan atau bukan milik Anda." });
    }
    
    // Hapus relasi dan promo itu sendiri dalam satu transaksi
    await prisma.$transaction([
        prisma.storePromo.deleteMany({ where: { promoId } }),
        prisma.promo.delete({ where: { id: promoId } })
    ]);
    
    res.json({ message: "Promo berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};


// @desc    Get partner's wallet data
// @route   GET /api/partner/wallet
export const getWalletData = async (req, res, next) => {
  try {
    const wallet = await prisma.storeWallet.findUnique({
      where: { storeId: req.store.id },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });
    res.json(wallet || { balance: 0, transactions: [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a payout
// @route   POST /api/partner/payout-requests
export const requestPayout = async (req, res, next) => {
  const { amount } = req.body;
  try {
    const wallet = await prisma.storeWallet.findUnique({
      where: { storeId: req.store.id },
    });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Saldo tidak mencukupi." });
    }
    const newRequest = await prisma.payoutRequest.create({
      data: {
        amount: parseFloat(amount),
        storeId: req.store.id,
        walletId: wallet.id,
        requestedById: req.user.id,
      },
    });
    res.status(201).json({
      message: "Permintaan penarikan dana berhasil diajukan.",
      request: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outstanding invoices for a partner
// @route   GET /api/partner/invoices/outstanding
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

// @desc    Get aggregated report data for a partner's store
// @route   GET /api/partner/reports
export const getPartnerReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const storeId = req.store.id;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 29));
    end.setHours(23, 59, 59, 999);

    const dateFilter = { createdAt: { gte: start, lte: end } };
    const bookingDateFilter = { ...dateFilter, storeId: storeId };
    const paymentDateFilter = {
      ...dateFilter,
      booking: { storeId: storeId },
      status: "paid",
    };

    const totalRevenuePromise = prisma.payment.aggregate({
      _sum: { amount: true },
      where: paymentDateFilter,
    });
    const totalOrdersPromise = prisma.booking.count({
      where: bookingDateFilter,
    });
    const averageRatingPromise = prisma.review.aggregate({
      _avg: { rating: true },
      where: { storeId: storeId, ...dateFilter },
    });
    const topServicesPromise = prisma.booking.groupBy({
      by: ["serviceName"],
      where: bookingDateFilter,
      _count: { serviceName: true },
      orderBy: { _count: { serviceName: "desc" } },
      take: 5,
    });

    const recentReviewsPromise = prisma.review.findMany({
      where: { storeId: storeId, ...dateFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    const [
      totalRevenueResult,
      totalOrders,
      averageRatingResult,
      topServices,
      recentReviews,
    ] = await Promise.all([
      totalRevenuePromise,
      totalOrdersPromise,
      averageRatingPromise,
      topServicesPromise,
      recentReviewsPromise,
    ]);

    res.json({
      summary: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        totalOrders: totalOrders || 0,
        averageRating: averageRatingResult._avg.rating || 0,
      },
      topServices: topServices.map((s) => ({
        name: s.serviceName,
        count: s._count.serviceName,
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        userName: r.user?.name || "N/A",
        rating: r.rating,
        comment: r.comment,
      })),
    });
  } catch (error) {
    next(error);
  }
};
