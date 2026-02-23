
import prisma from "../config/prisma.js";



export const createReview = async (req, res, next) => {
    const { bookingId, storeId, rating, comment, imageUrl } = req.body;
    if (!bookingId || !storeId || !rating) {
        return res.status(400).json({ message: "Data ulasan tidak lengkap." });
    }

    try {
       
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
        
       

       
       

        res.status(201).json(newReview);
    } catch (error) {
        next(error);
    }
};