// File: server/cron/jobs.js
import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { createNotificationForUser, io } from '../socket.js';

export const cleanupExpiredBookings = async () => {
    // HAPUS log ini agar tidak nyampah setiap 5 menit
    // console.log('Running cron task: Checking for expired bookings...');
    
    try {
        const now = new Date();
        
        // Cari booking yang pending DAN sudah lewat waktu expired-nya
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'pending',
                expiresAt: {
                    lt: now, // lt = less than (sebelum waktu sekarang)
                },
            },
            include: {
                user: true
            }
        });

        if (expiredBookings.length === 0) {
            return; // Diam saja jika tidak ada yang expired
        }

        // Log hanya muncul jika ada aksi
        console.log(`[CRON] Ditemukan ${expiredBookings.length} pesanan kadaluwarsa. Membatalkan...`);
        
        const bookingIdsToCancel = expiredBookings.map(b => b.id);
        
        // Update status di database secara massal (Efisien)
        await prisma.booking.updateMany({
            where: {
                id: { in: bookingIdsToCancel },
            },
            data: {
                status: 'cancelled',
            },
        });

        // Kirim notifikasi satu per satu
        for (const booking of expiredBookings) {
            const message = `Pesanan #${booking.id.substring(0, 8)} dibatalkan otomatis karena batas waktu pembayaran habis.`;
            
            // Simpan notifikasi ke DB
            await createNotificationForUser(booking.userId, message, '/dashboard');
            
            // Kirim notifikasi realtime via Socket
            if (io) {
                io.to(booking.userId).emit('bookingUpdated', { 
                    id: booking.id, 
                    userId: booking.userId, 
                    status: 'cancelled',
                    message: message
                });
            }
        }

        console.log('[CRON] Berhasil membatalkan pesanan kadaluwarsa.');

    } catch (error) {
        console.error('[CRON ERROR] Gagal membersihkan pesanan:', error);
    }
};

// Fungsi untuk memulai Cron Job
export const startCronJobs = () => {
    // Jalankan setiap 5 menit
    cron.schedule('*/5 * * * *', cleanupExpiredBookings);
    console.log('✅ Cron Jobs System Started (Check every 5 mins)');
};