// File: server/cron/jobs.js (FILE BARU)

import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { createNotificationForUser, io } from '../socket.js';

// Tugas ini akan berjalan setiap menit
const cancelExpiredBookingsJob = cron.schedule('* * * * *', async () => {
    console.log('Running cron job: Checking for expired bookings...');
    
    try {
        const now = new Date();
        
        // 1. Cari semua booking yang statusnya 'pending' dan sudah melewati waktu expiresAt
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'pending',
                expiresAt: {
                    lt: now, // lt (less than) berarti lebih kecil dari waktu sekarang
                },
            },
            include: {
                user: true // Ambil data user untuk mengirim notifikasi
            }
        });

        if (expiredBookings.length === 0) {
            console.log('No expired bookings found.');
            return;
        }

        console.log(`Found ${expiredBookings.length} expired bookings to cancel.`);

        // 2. Ubah status semua booking yang kedaluwarsa menjadi 'cancelled'
        const bookingIdsToCancel = expiredBookings.map(b => b.id);
        
        await prisma.booking.updateMany({
            where: {
                id: {
                    in: bookingIdsToCancel,
                },
            },
            data: {
                status: 'cancelled',
            },
        });

        // 3. (Opsional) Kirim notifikasi ke setiap pengguna
        for (const booking of expiredBookings) {
            const message = `Pesanan Anda #${booking.id.substring(0, 8)} telah dibatalkan karena melewati batas waktu pembayaran.`;
            
            // Kirim notifikasi via WebSocket
            createNotificationForUser(booking.userId, message, '/dashboard');
            
            // Emit event agar UI di dashboard bisa update secara real-time
            io.emit('bookingUpdated', { 
                id: booking.id, 
                userId: booking.userId, 
                status: 'cancelled' 
            });
        }

        console.log('Successfully cancelled expired bookings.');

    } catch (error) {
        console.error('Error during cancel expired bookings job:', error);
    }
});

export default cancelExpiredBookingsJob;