// File: server/config/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware Prisma untuk poin loyalitas tetap di sini bersama inisialisasi client
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (params.model === "Payment" && params.action === "update" && params.args.data?.status === "SUCCESS") {
    const payment = await prisma.payment.findUnique({
      where: { id: params.args.where.id },
      include: { booking: true },
    });

    if (payment && payment.booking) {
      const { booking } = payment;
      const pointsEarned = Math.floor(booking.totalPrice / 10000);
      
      if (pointsEarned > 0) {
        // ... (Logika penambahan poin loyalitas Anda)
        console.log(`✅ Logika poin loyalitas akan dijalankan untuk booking ${booking.id}`);
      }
    }
  }

  return result;
});

export default prisma;