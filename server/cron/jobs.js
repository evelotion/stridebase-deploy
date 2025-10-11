// File: server/cron/jobs.js (Perbaikan Final)

import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { createNotificationForUser, io } from '../socket.js';

// Fungsi ini berisi logika untuk membersihkan booking yang kedaluwarsa
export const cleanupExpiredBookings = async () => {
    console.log('Running cron task: Checking for expired bookings...');
    
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
            console.log('No expired bookings found.');
            return;
        }

        console.log(`Found ${expiredBookings.length} expired bookings to cancel.`);
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
            const message = `Pesanan Anda #${booking.id.substring(0, 8)} telah dibatalkan karena melewati batas waktu pembayaran.`;
            
            createNotificationForUser(booking.userId, message, '/dashboard');
            
            // Pastikan 'io' ada sebelum digunakan
            if (io) {
                io.emit('bookingUpdated', { 
                    id: booking.id, 
                    userId: booking.userId, 
                    status: 'cancelled' 
                });
            }
        }

        console.log('Successfully cancelled expired bookings.');

    } catch (error) {
        console.error('Error during cleanupExpiredBookings task:', error);
    }
};

// Fungsi untuk memulai semua cron jobs di aplikasi Anda
export const startCronJobs = () => {
    // Menjalankan tugas setiap 5 menit
    cron.schedule('*/5 * * * *', cleanupExpiredBookings);
    console.log('Cron jobs for booking cleanup has been started.');
    // Anda bisa menambahkan cron.schedule lainnya di sini jika perlu
};