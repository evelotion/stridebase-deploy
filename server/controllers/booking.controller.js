

import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js";




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
  const io = req.io;

  try {
   
    if (!storeId || !serviceId || !serviceName || !scheduleDate) {
      return res.status(400).json({ message: "Data wajib tidak lengkap." });
    }

   
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: { select: { id: true, email: true } } },
    });

    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Layanan tidak ditemukan." });
    }

   
    let totalPrice = service.price;
    const deliveryFee = deliveryOption === "pickup_delivery" ? 15000 : 0;
    const handlingFee = 2000;
    totalPrice += deliveryFee + handlingFee;

   
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode },
      });

      if (
        promo &&
        promo.status === "active" &&
        (!promo.startDate || new Date() >= promo.startDate) &&
        (!promo.endDate || new Date() <= promo.endDate) &&
        (!promo.usageLimit || promo.usageLimit > promo.usageCount)
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

   
    const validAddressId =
      addressId && addressId.trim() !== "" ? addressId : undefined;

   
    const bookingExpiryMinutes = 15;
    const expiresAt = new Date(Date.now() + bookingExpiryMinutes * 60 * 1000);

   
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        storeId,
        serviceId,
        serviceName,
        scheduleDate: new Date(scheduleDate),
        deliveryOption,
        addressId: validAddressId,
        notes,
        totalPrice: Math.max(0, totalPrice),
        status: "pending",
        expiresAt: expiresAt,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

   
    if (io && store.ownerId) {
     
      io.to(store.ownerId).emit("newOrder", newBooking);
      console.log(`Real-time order sent to Partner: ${store.ownerId}`);
    }

   
    await createNotificationForUser(
      store.ownerId,
      `Pesanan Baru! ${req.user.name} memesan layanan ${serviceName}.`,
      `/partner/orders`
    );
   

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};




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
      totalPrice: b.totalPrice,
    }));

    res.json(formattedBookings);
  } catch (error) {
    next(error);
  }
};




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




export const getActiveBooking = async (req, res) => {
  try {
    const userId = req.user.id;

   
    const activeBooking = await prisma.booking.findFirst({
      where: {
        userId: userId,
        status: {
          in: ["pending", "confirmed", "in_progress"],
        },
        workStatus: {
          not: "completed",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          select: { name: true },
        },
      },
    });

    if (!activeBooking) {
     
      return res.status(200).json(null);
    }

   
    let progress = 0;
    let statusText = "Menunggu Konfirmasi";

    if (activeBooking.status === "pending") {
      progress = 10;
      statusText = "Menunggu Pembayaran";
    } else if (activeBooking.status === "confirmed") {
      progress = 30;
      statusText = "Dikonfirmasi";
    } else if (activeBooking.status === "in_progress") {
      progress = 60;
      statusText = "Sedang Dikerjakan";
      if (activeBooking.workStatus === "in_progress") progress = 70;
    }

   
    const widgetData = {
      id: activeBooking.id,
      displayId: activeBooking.id.slice(-6).toUpperCase(),
      status: statusText,
      service: activeBooking.serviceName,
      store: activeBooking.store.name,
      progress: progress,
    };

    res.json(widgetData);
  } catch (error) {
    console.error("Error fetching active booking:", error);
    res.status(500).json({ message: "Gagal mengambil data booking aktif" });
  }
};
