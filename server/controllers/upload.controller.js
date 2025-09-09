// File: server/controllers/upload.controller.js
import cloudinary from "../config/cloudinary.js";

// @desc    Upload image for reviews
// @route   POST /api/upload/review
export const uploadReviewImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "stridebase_reviews",
            public_id: `review-${req.user.id}-${Date.now()}`,
        });

        res.status(200).json({
            message: "Gambar berhasil diunggah.",
            imageUrl: result.secure_url,
        });
    } catch (error) {
        next(error);
    }
};