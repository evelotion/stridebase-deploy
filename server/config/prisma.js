// File: server/config/prisma.js (Dengan Logika Komisi Otomatis)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  // Jalankan operasi database terlebih dahulu
  const result = await next(params);

  // Cek apakah operasinya adalah UPDATE pada tabel Payment dan statusnya menjadi 'paid'
  if (params.model === "Payment" && params.action === "update" && params.args.data?.status === "paid") {
    
    // Gunakan 'result' yang merupakan data payment setelah diupdate
    const payment = result;

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { store: true },
    });

    if (booking && booking.store) {
      const { store } = booking;
      const wallet = await prisma.storeWallet.findUnique({ where: { storeId: store.id } });

      if (wallet) {
        // --- LOGIKA UTAMA DIMULAI DI SINI ---
        if (store.tier === 'BASIC') {
          // 1. Hitung Komisi
          const commissionAmount = payment.amount * (store.commissionRate / 100);
          const amountForPartner = payment.amount - commissionAmount;

          await prisma.$transaction([
            // 2. Tambahkan saldo partner (sudah dipotong komisi)
            prisma.storeWallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: amountForPartner } },
            }),
            // 3. Catat pemasukan ke dompet partner
            prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amount: payment.amount,
                type: 'CREDIT',
                description: `Pemasukan dari booking #${booking.id.substring(0, 8)}`,
                bookingId: booking.id,
              },
            }),
            // 4. Catat pemotongan komisi dari dompet partner
            prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amount: commissionAmount,
                type: 'DEBIT',
                description: `Biaya komisi (${store.commissionRate}%) untuk booking #${booking.id.substring(0, 8)}`,
                bookingId: booking.id,
              },
            }),
            // 5. Catat pendapatan untuk platform
            prisma.platformEarning.create({
                data: {
                    bookingId: booking.id,
                    storeId: store.id,
                    earnedAmount: commissionAmount,
                }
            })
          ]);
          console.log(`✅ [AUTO-COMMISSION] Komisi Rp ${commissionAmount} berhasil dipotong untuk toko ${store.name}`);

        } else { // Untuk Toko PRO, masukkan 100% ke saldo mereka
            await prisma.$transaction([
                prisma.storeWallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: payment.amount } },
                }),
                prisma.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        amount: payment.amount,
                        type: 'CREDIT',
                        description: `Pemasukan dari booking #${booking.id.substring(0, 8)}`,
                        bookingId: booking.id,
                    },
                }),
            ]);
            console.log(`✅ [PRO-INCOME] Saldo Rp ${payment.amount} berhasil ditambahkan ke toko PRO ${store.name}`);
        }
      }
    }
  }

  return result;
});

export default prisma;