// File: server/middleware/errorHandler.js
import { Prisma } from "@prisma/client";

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR LOG:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan pada server.";

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Kesalahan umum dari Prisma (misalnya, data unik sudah ada)
    if (err.code === 'P2002') {
      statusCode = 400;
      const target = err.meta?.target || ['data'];
      message = `Data duplikat: ${target.join(', ')} sudah ada.`;
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = `Data yang Anda cari tidak ditemukan.`;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      // Tampilkan stack trace hanya di environment development untuk keamanan
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};