// File: server/controllers/review.controller.js
import prisma from "../config/prisma.js";

// @desc    Create a new review
// @route   POST /api/reviews
export const createReview = async (req, res, next) => {
    const { bookingId, storeId, rating, comment, imageUrl } = req.body;
    if (!bookingId || !storeId || !rating) {
        return res.status(400).json({ message: "Data ulasan tidak lengkap." });
    }

    try {
        // Gunakan transaksi untuk memastikan update status booking dan pembuatan review terjadi bersamaan
        const [, newReview] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: "Reviewed" },
            }),
            prisma.review.create({
                data: {
                    rating,
                    comment,
                    imageUrl,
                    bookingId,
                    storeId,
                    userId: req.user.id,
                    userName: req.user.name,
                },
            }),
        ]);
        
        // Logika untuk update rating toko...

        // Kirim notifikasi ke pemilik toko
        // req.io.to(storeOwnerId).emit(...)

        res.status(201).json(newReview);
    } catch (error) {
        next(error);
    }
};