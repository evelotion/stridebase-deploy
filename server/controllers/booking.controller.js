// File: server/controllers/booking.controller.js
import prisma from "../config/prisma.js";

// @desc    Get all bookings for the logged-in user
// @route   GET /api/user/bookings
export const getUserBookings = async (req, res, next) => {
    try {
        const userBookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: { store: true },
            orderBy: { scheduleDate: "desc" },
        });

        // Format data sebelum dikirim ke frontend
        const formattedBookings = userBookings.map((b) => ({
            id: b.id,
            storeId: b.store.id,
            service: b.serviceName,
            storeName: b.store.name,
            scheduleDate: b.scheduleDate,
            status: b.status,
            store: b.store, // Sertakan seluruh objek toko jika diperlukan
        }));
        res.json(formattedBookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
    const { storeId, service, deliveryOption, schedule, addressId, promoCode } = req.body;
    if (!storeId || !service || !deliveryOption) {
        return res.status(400).json({ message: "Data booking tidak lengkap." });
    }

    try {
        // ... Logika kompleks Anda untuk validasi promo, perhitungan harga, dll.
        // akan berada di sini.
        
        const originalService = await prisma.service.findUnique({ where: { id: service.id } });
        if (!originalService) {
            return res.status(404).json({ message: "Layanan tidak ditemukan." });
        }

        const finalTotalPrice = originalService.price; // Tambahkan logika diskon & ongkir di sini
        
        const newBooking = await prisma.booking.create({
            data: {
                totalPrice: finalTotalPrice,
                status: "Pending Payment",
                serviceName: originalService.name,
                deliveryOption: deliveryOption,
                scheduleDate: schedule ? new Date(schedule.date) : new Date(),
                addressId: addressId,
                userId: req.user.id,
                storeId: storeId,
                serviceId: service.id,
            },
            include: { store: true, user: true },
        });

        res.status(201).json(newBooking);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single booking by ID (sudah ada)
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res, next) => { /* ...kode sudah ada... */ };