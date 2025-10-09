import midtransClient from "midtrans-client";
import prisma from "../config/prisma.js"; // <-- INI PERBAIKANNYA

// Inisialisasi Snap API dari Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * @desc    Create a new Midtrans transaction token
 * @route   POST /api/payment/create-transaction
 * @access  Private (User)
 */
export const createPaymentGatewayTransaction = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    // 1. Validasi Booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        store: true,
        user: true,
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak berhak mengakses pesanan ini." });
    }
    if (booking.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Pesanan ini sudah diproses atau dibatalkan." });
    }
    if (new Date() > new Date(booking.expiresAt)) {
      return res
        .status(400)
        .json({ message: "Pesanan ini sudah kedaluwarsa." });
    }

    // 2. Siapkan Parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: booking.id, // Gunakan Booking ID sebagai Order ID
        gross_amount: booking.totalPrice,
      },
      customer_details: {
        first_name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || "N/A",
      },
      item_details: [
        {
          id: booking.service.id,
          price: booking.service.price,
          quantity: 1,
          name: booking.service.name,
          merchant_name: booking.store.name,
        },
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/finish?order_id=${booking.id}`,
      },
    };

    // 3. Buat Transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // 4. Kirim Token ke Client
    res
      .status(200)
      .json({
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Midtrans notification webhook
 * @route   POST /api/payment/midtrans-notification
 * @access  Public
 */
export const handleMidtransNotification = async (req, res, next) => {
  try {
    const notificationJson = req.body;

    const statusResponse = await snap.transaction.notification(
      notificationJson
    );
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const grossAmount = statusResponse.gross_amount;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    // Cari booking berdasarkan orderId
    const existingBooking = await prisma.booking.findUnique({
      where: { id: orderId },
    });

    if (!existingBooking) {
      // Jika booking tidak ditemukan, mungkin ini notifikasi untuk transaksi lain.
      // Kirim respons 200 agar Midtrans berhenti mengirim notifikasi.
      console.warn(`Booking with ID ${orderId} not found.`);
      return res.status(200).send("OK");
    }

    // Hanya proses jika status booking masih PENDING untuk menghindari double processing
    if (existingBooking.status !== "PENDING") {
      console.log(
        `Booking ${orderId} has already been processed. Current status: ${existingBooking.status}. Ignoring notification.`
      );
      return res.status(200).send("OK");
    }

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        // TODO: Aksi untuk status capture dan fraud accept
      }
    } else if (transactionStatus == "settlement") {
      // Update status booking menjadi CONFIRMED
      await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          status: "CONFIRMED",
          paymentDetails: { ...notificationJson },
        },
      });

      // --- LOGIKA BUKU BESAR (LEDGER) BARU DIMULAI DI SINI ---

      // Ambil detail toko untuk memeriksa tipe dan tarif komisi
      const bookingWithStore = await prisma.booking.findUnique({
        where: { id: existingBooking.id },
        include: {
          store: {
            select: {
              storeType: true,
              commissionRate: true,
            },
          },
        },
      });

      const store = bookingWithStore.store;
      const totalAmount = parseInt(grossAmount);

      // Cek apakah toko bertipe KOMISI
      if (store.storeType === "COMMISSION") {
        const commissionRate = store.commissionRate;
        const commissionAmount = Math.round(
          (totalAmount * commissionRate) / 100
        );
        const netIncomeForPartner = totalAmount - commissionAmount;

        // Gunakan Prisma Transaction untuk memastikan kedua data berhasil dibuat
        await prisma.$transaction([
          // 1. Catat pendapatan bersih untuk Mitra
          prisma.ledgerEntry.create({
            data: {
              storeId: existingBooking.storeId,
              bookingId: existingBooking.id,
              amount: netIncomeForPartner,
              type: "PARTNER_INCOME",
              description: `Pendapatan bersih dari pesanan #${existingBooking.id}`,
            },
          }),
          // 2. Catat komisi untuk Platform
          prisma.ledgerEntry.create({
            data: {
              storeId: existingBooking.storeId,
              bookingId: existingBooking.id,
              amount: commissionAmount,
              type: "COMMISSION",
              description: `Komisi ${commissionRate}% dari pesanan #${existingBooking.id}`,
            },
          }),
        ]);
      } else {
        // Untuk toko tipe INVOICE atau lainnya, catat sebagai pendapatan penuh
        await prisma.ledgerEntry.create({
          data: {
            storeId: existingBooking.storeId,
            bookingId: existingBooking.id,
            amount: totalAmount,
            type: "PARTNER_INCOME",
            description: `Pendapatan dari pesanan #${existingBooking.id}`,
          },
        });
      }
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // Update status booking menjadi FAILED
      await prisma.booking.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentDetails: { ...notificationJson },
        },
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    // Jangan gunakan next(error) di webhook karena akan mengirim respons error ke Midtrans
    // Cukup log error di server Anda
    console.error("Error handling Midtrans notification:", error);
    // Kirim respons error yang umum ke Midtrans
    res.status(500).send("Internal Server Error");
  }
};

// @desc    Get payment status by booking ID
// @route   GET /api/payment/status/:bookingId
// @access  Private
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: userId,
      },
      select: {
        status: true,
        paymentDetails: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    res.status(200).json({
      status: booking.status,
      details: booking.paymentDetails,
    });
  } catch (error) {
    next(error);
  }
};
