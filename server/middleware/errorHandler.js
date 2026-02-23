
import { Prisma } from "@prisma/client";

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR LOG:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan pada server.";

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
   
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
     
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};