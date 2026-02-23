
import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { createNotificationForUser, io } from '../socket.js';

export const cleanupExpiredBookings = async () => {
   
   
    
    try {
        const now = new Date();
        
       
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'pending',
                expiresAt: {
                    lt: now,
                },
            },
            include: {
                user: true
            }
        });

        if (expiredBookings.length === 0) {
            return;
        }

       
        console.log(`[CRON] Ditemukan ${expiredBookings.length} pesanan kadaluwarsa. Membatalkan...`);
        
        const bookingIdsToCancel = expiredBookings.map(b => b.id);
        
       
        await prisma.booking.updateMany({
            where: {
                id: { in: bookingIdsToCancel },
            },
            data: {
                status: 'cancelled',
            },
        });

       
        for (const booking of expiredBookings) {
            const message = `Pesanan #${booking.id.substring(0, 8)} dibatalkan otomatis karena batas waktu pembayaran habis.`;
            
           
            await createNotificationForUser(booking.userId, message, '/dashboard');
            
           
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


export const startCronJobs = () => {
   
    cron.schedule('*/5 * * * *', cleanupExpiredBookings);
    console.log('✅ Cron Jobs System Started (Check every 5 mins)');
};