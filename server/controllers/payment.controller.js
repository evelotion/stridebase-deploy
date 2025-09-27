// File: server/controllers/payment.controller.js
import prisma from "../config/prisma.js";
import { createNotificationForUser } from "../socket.js"; // 

// @desc    Create a payment transaction for a booking
// @route   POST /api/payments/create-transaction
export const createPaymentTransaction = async (req, res, next) => {
    const { bookingId } = req.body;
    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID dibutuhkan." });
    }

    try {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.userId !== req.user.id) {
            return res.status(403).json({ message: "Booking tidak ditemukan atau akses ditolak." });
        }

        // Simulasi Midtrans
        const order_id = `BOOK-${booking.id}-${Date.now()}`;
        const redirect_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-finish?order_id=${order_id}&status=pending&type=booking`;

        const newPayment = await prisma.payment.create({
            data: {
                bookingId: booking.id,
                midtransOrderId: order_id,
                amount: booking.totalPrice,
                status: "pending",
                paymentMethod: "Midtrans (Simulasi)",
            },
        });

        // Di dunia nyata, Anda akan menggunakan token dari Midtrans.
        // Di sini kita langsung kirim redirect_url.
        res.json({ redirectUrl: redirect_url, token: `dummy-token-${order_id}` });

    } catch (error) {
        next(error);
    }
};

// @desc    Webhook handler for payment notifications
// @route   POST /api/payments/notification
export const paymentNotificationHandler = async (req, res, next) => {
    // Logika webhook Anda akan berada di sini.
    // Ini adalah operasi yang sangat penting dan kompleks.
    console.log("🔔 Menerima notifikasi pembayaran:", req.body);
    // Untuk saat ini, kita anggap semua notifikasi sukses
    res.status(200).json({ message: "Webhook received." });
};

// @desc    Confirm a booking payment after successful simulation
// @route   POST /api/payments/confirm-simulation/:bookingId
export const confirmPaymentSimulation = async (req, res, next) => {
    const { bookingId } = req.params;
    const io = req.io; // Mengambil instance Socket.IO dari request

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { store: true }
        });

        if (!booking) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan." });
        }

        if (booking.status === 'pending') {
            const updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'confirmed' },
            });

            // LANGKAH PENTING: Kirim event WebSocket ke semua client
            if (io) {
                io.emit('payment_confirmed', { bookingId: updatedBooking.id });
                console.log(`Socket event 'payment_confirmed' dipancarkan untuk booking ${updatedBooking.id}`);
            }
            
            // Kirim notifikasi ke pemilik toko (ini bisa tetap ada)
            await createNotificationForUser(
              booking.store.ownerId,
              `Pesanan #${booking.id.substring(0,8)} telah dibayar dan dikonfirmasi.`,
              `/partner/orders`
            );

            res.json({ message: "Pembayaran berhasil dikonfirmasi.", booking: updatedBooking });
        } else {
            res.status(200).json({ message: "Status pesanan ini sudah diproses sebelumnya." });
        }
    } catch (error) {
        next(error);
    }
};