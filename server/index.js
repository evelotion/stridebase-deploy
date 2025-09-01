// File: server/index.js
// VERSI LENGKAP DENGAN PERBAIKAN CORS FINAL DAN ENDPOINT SUPERUSER UPLOAD

console.log("SERVER CODE VERSION 2.1 - SUPERUSER UPLOAD FIXED");

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import crypto from "crypto"; // <-- TAMBAHKAN BARIS INI
import rateLimit from "express-rate-limit";
import fs from "fs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import sharp from "sharp";
import cors from "cors";
import { sendVerificationEmail } from "./email-service.js";
import redisClient from "./redis-client.js";
import { v2 as cloudinary } from "cloudinary";

  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

let currentThemeConfig = {}; // Variabel global untuk menyimpan tema
const themeConfigPath = path.join(__dirname, "config", "theme.json");

/**
 * Memuat konfigurasi tema.
 * Prioritas: Database -> File theme.json -> Objek default.
 * Jika dari file, akan disimpan ke database untuk penggunaan selanjutnya.
 */
async function loadThemeConfig() {
  try {
    let themeSetting = await prisma.globalSetting.findUnique({
      where: { key: "themeConfig" },
    });

    if (themeSetting) {
      console.log("🎨 Theme loaded successfully from DATABASE.");
      currentThemeConfig = themeSetting.value;
    } else {
      console.log("⚠️ Theme config not found in database, falling back to theme.json...");
      if (fs.existsSync(themeConfigPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(themeConfigPath, "utf8"));
        currentThemeConfig = fileConfig;

        // Simpan konfigurasi dari file ke database untuk pertama kali
        await prisma.globalSetting.create({
          data: {
            key: "themeConfig",
            value: fileConfig,
          },
        });
        console.log("🎨 Theme from file has been saved to the database.");
      } else {
        console.error("❌ CRITICAL: theme.json file not found. Using empty config.");
        currentThemeConfig = {};
      }
    }
  } catch (error) {
    console.error("❌ Failed to load theme configuration:", error);
    // Fallback darurat jika database error saat startup
    currentThemeConfig = fs.existsSync(themeConfigPath)
      ? JSON.parse(fs.readFileSync(themeConfigPath, "utf8"))
      : {};
  }
}

prisma.$use(async (params, next) => {
  const result = await next(params);
  if (params.model === "Payment" && params.action === "updateMany") {
    if (params.args.data && params.args.data.status === "SUCCESS") {
      const paymentWhere = params.args.where;
      if (paymentWhere && paymentWhere.bookingId) {
        const bookingId = paymentWhere.bookingId;
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
        });
        if (booking) {
          const pointsEarned = Math.floor(booking.totalPrice / 10000);
          if (pointsEarned > 0) {
            const loyaltyPoint = await prisma.loyaltyPoint.upsert({
              where: { userId: booking.userId },
              update: { points: { increment: pointsEarned } },
              create: { userId: booking.userId, points: pointsEarned },
            });
            await prisma.pointTransaction.create({
              data: {
                loyaltyPointId: loyaltyPoint.id,
                bookingId: booking.id,
                points: pointsEarned,
                description: `Poin dari pesanan di ${booking.serviceName}`,
              },
            });
            console.log(
              `✅ Berhasil menambahkan ${pointsEarned} poin untuk pengguna ${booking.userId}`
            );
          }
        }
      }
    }
  }
  return result;
});

const app = express();
app.set("trust proxy", 1);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = 5000;

const server = http.createServer(app);
loadThemeConfig();
// =================== KODE BARU DIMULAI DI SINI ===================

// 1. Definisikan asal (origin) yang diizinkan dan opsi CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://stridebase-client-ctct.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti dari Postman atau aplikasi mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// 2. Gunakan corsOptions untuk Server Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

const createNotification = async (
  userId,
  message,
  linkUrl = null,
  bookingId = null
) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, message, linkUrl, bookingId },
    });
    io.to(userId).emit("new_notification", notification);
    console.log(`Notifikasi terkirim untuk pengguna ${userId}: ${message}`);
  } catch (error) {
    console.error(`Gagal membuat notifikasi untuk pengguna ${userId}:`, error);
  }
};

io.on("connection", (socket) => {
  console.log(`✅ Seorang pengguna terhubung: ${socket.id}`);
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(
      `Socket ${socket.id} bergabung ke room untuk pengguna ${userId}`
    );
  }
  socket.on("disconnect", () => {
    console.log(`❌ Pengguna terputus: ${socket.id}`);
  });
});

// 3. Gunakan corsOptions yang sama untuk Aplikasi Express
app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/public/theme-config", (req, res) => {
  // Sekarang langsung mengembalikan dari variabel yang sudah dimuat
  res.json(currentThemeConfig);
});

const checkMaintenanceMode = (req, res, next) => {
  // Langsung gunakan variabel global, tidak ada deklarasi baru di sini
  if (currentThemeConfig.featureFlags?.maintenanceMode) {
    if (
      req.path.startsWith("/api/auth/login") ||
      req.path.startsWith("/api/admin") ||
      req.path.startsWith("/api/superuser") ||
      req.path.startsWith("/api/public/theme-config") ||
      req.path.startsWith("/uploads") || 
      req.path.includes(".")
    ) {
      return next();
    }
    
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err && (decoded.role === "admin" || decoded.role === "developer")) {
          return next();
        } else {
           return res.status(503).json({
             message: "Situs sedang dalam perbaikan. Silakan coba lagi nanti.",
           });
        }
      });
    } else {
        return res.status(503).json({
            message: "Situs sedang dalam perbaikan. Silakan coba lagi nanti.",
        });
    }
  } else {
      next();
  }
};

app.use(checkMaintenanceMode);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 4. Modifikasi middleware authenticateToken
const authenticateToken = async (req, res, next) => {
  // KUNCI PERBAIKAN: Izinkan preflight request (OPTIONS) untuk lewat
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403);
    }
    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status === "blocked") return res.sendStatus(403);
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  });
};

// =================== AKHIR DARI KODE BARU ===================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    prisma.securityLog
      .create({
        data: {
          eventType: "IP_BLOCKED",
          ipAddress: req.ip,
          details: `IP diblokir setelah melebihi batas percobaan login.`,
        },
      })
      .catch(console.error);

    return res.status(429).json({
      message:
        "Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerValidation = [
  body("email").isEmail().withMessage("Format email tidak valid."),
  body("name").notEmpty().withMessage("Nama tidak boleh kosong."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal harus 8 karakter."),
];

app.post("/api/auth/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
      },
    });

    // SIMULASI PENGIRIMAN EMAIL
    // Di aplikasi produksi, Anda akan menggunakan library seperti Nodemailer di sini.
    // Untuk sekarang, kita cetak link-nya ke konsol server.
    await sendVerificationEmail(newUser.email, verificationToken);
    
    res.status(201).json({
      message: "Pendaftaran berhasil! Silakan periksa email Anda untuk link verifikasi.",
    });
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Email sudah terdaftar." });
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.post("/api/auth/login", loginLimiter, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Pengecekan 1: User ada atau tidak
    if (!user || user.status === "blocked") {
      return res.status(400).json({ message: "Email atau password salah." });
    }

    // Pengecekan 2: Password cocok
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // (logika security log tetap sama)
      return res.status(400).json({ message: "Email atau password salah." });
    }
    
    // PENGECEKAN BARU: Apakah email sudah terverifikasi?
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Akun Anda belum diverifikasi. Silakan periksa email Anda." });
    }

    // Jika semua pengecekan lolos, buat token dan kirim response
    const tokenPayload = { id: user.id, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      message: "Login berhasil!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token verifikasi tidak valid atau hilang.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).send("Token verifikasi tidak valid atau sudah kedaluwarsa.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Hapus token setelah digunakan
      },
    });

    // Arahkan pengguna ke halaman sukses di frontend
    res.redirect("/email-verified");

  } catch (error) {
    console.error("Gagal verifikasi email:", error);
    res.status(500).send("Terjadi kesalahan pada server saat verifikasi email.");
  }
});

app.put("/api/user/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Nama tidak boleh kosong." });
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
    res.json({
      message: "Profil berhasil diperbarui.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
});

app.get("/api/user/addresses", authenticateToken, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data alamat." });
  }
});

app.post("/api/user/addresses", authenticateToken, async (req, res) => {
  const { label, recipientName, phoneNumber, fullAddress, city, postalCode } =
    req.body;
  if (
    !label ||
    !recipientName ||
    !phoneNumber ||
    !fullAddress ||
    !city ||
    !postalCode
  ) {
    return res.status(400).json({ message: "Semua kolom alamat wajib diisi." });
  }
  try {
    const newAddress = await prisma.address.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan alamat baru." });
  }
});

app.delete("/api/user/addresses/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const address = await prisma.address.findFirst({
      where: { id: id, userId: req.user.id },
    });
    if (!address) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin atau alamat tidak ditemukan.",
      });
    }
    await prisma.address.delete({ where: { id } });
    res.status(200).json({ message: "Alamat berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus alamat." });
  }
});

app.get("/api/user/bookings", authenticateToken, async (req, res) => {
  try {
    const userBookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { store: true },
      orderBy: { scheduleDate: "desc" },
    });

    const formattedBookings = userBookings.map((b) => ({
      id: b.id,
      storeId: b.store.id,
      service: b.serviceName,
      storeName: b.store.name,
      schedule: b.scheduleDate
        ? new Date(b.scheduleDate).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      scheduleDate: b.scheduleDate,
      status: b.status,
      store: b.store,
    }));
    res.json(formattedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data booking." });
  }
});

app.get("/api/user/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readStatus: false },
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil notifikasi." });
  }
});

app.post(
  "/api/user/notifications/mark-read",
  authenticateToken,
  async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, readStatus: false },
        data: { readStatus: true },
      });
      res.status(200).json({ message: "Semua notifikasi ditandai terbaca." });
    } catch (error) {
      res.status(500).json({ message: "Gagal memperbarui notifikasi." });
    }
  }
);
app.get("/api/user/loyalty", authenticateToken, async (req, res) => {
  try {
    const loyaltyData = await prisma.loyaltyPoint.findUnique({
      where: { userId: req.user.id },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!loyaltyData) {
      return res.json({ points: 0, transactions: [] });
    }

    res.json(loyaltyData);
  } catch (error) {
    console.error("Gagal mengambil data poin loyalitas:", error);
    res.status(500).json({ message: "Gagal mengambil data poin." });
  }
});

app.post("/api/user/loyalty/redeem", authenticateToken, async (req, res) => {
  const { pointsToRedeem } = req.body;
  const userId = req.user.id;

  const REDEMPTION_RATE_POINTS = 100;
  const VOUCHER_VALUE_RP = 10000;

  if (pointsToRedeem < REDEMPTION_RATE_POINTS) {
    return res.status(400).json({
      message: `Minimal penukaran adalah ${REDEMPTION_RATE_POINTS} poin.`,
    });
  }

  try {
    const loyaltyData = await prisma.loyaltyPoint.findUnique({
      where: { userId },
    });

    if (!loyaltyData || loyaltyData.points < pointsToRedeem) {
      return res.status(400).json({ message: "Poin Anda tidak mencukupi." });
    }

    const numberOfVouchers = Math.floor(
      pointsToRedeem / REDEMPTION_RATE_POINTS
    );
    const totalPointsToDeduct = numberOfVouchers * REDEMPTION_RATE_POINTS;
    const totalVoucherValue = numberOfVouchers * VOUCHER_VALUE_RP;

    const newPromoCode = `REDEEM-${userId.substring(0, 4)}-${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      await tx.loyaltyPoint.update({
        where: { userId },
        data: { points: { decrement: totalPointsToDeduct } },
      });

      await tx.pointTransaction.create({
        data: {
          loyaltyPointId: loyaltyData.id,
          points: -totalPointsToDeduct,
          description: `Tukar ${totalPointsToDeduct} poin dengan voucher diskon.`,
        },
      });

      await tx.promo.create({
        data: {
          code: newPromoCode,
          description: `Voucher Diskon Rp ${totalVoucherValue.toLocaleString(
            "id-ID"
          )} hasil penukaran poin.`,
          discountType: "fixed",
          value: totalVoucherValue,
          status: "active",
          isRedeemed: true,
          userId: userId,
          usageLimit: 1,
        },
      });
    });

    res.status(200).json({
      message: `Berhasil menukarkan ${totalPointsToDeduct} poin dengan voucher diskon senilai Rp ${totalVoucherValue.toLocaleString(
        "id-ID"
      )}!`,
      promoCode: newPromoCode,
    });
  } catch (error) {
    console.error("Gagal menukarkan poin:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.get("/api/user/redeemed-promos", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.json([]);
    }

    const promos = await prisma.promo.findMany({
      where: {
        userId: req.user.id,
        isRedeemed: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });
    res.json(promos);
  } catch (error) {
    console.error("Gagal mengambil promo hasil redeem:", error);
    res.status(500).json({ message: "Gagal mengambil data promo." });
  }
});

app.get("/api/bookings/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        store: true,
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Invoice tidak ditemukan atau Anda tidak memiliki akses.",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error("Gagal mengambil data invoice:", error);
    res.status(500).json({ message: "Gagal mengambil data invoice." });
  }
});

app.post("/api/bookings", authenticateToken, async (req, res) => {
  const { storeId, service, deliveryOption, schedule, addressId, promoCode } =
    req.body;

  if (!storeId || !service || !deliveryOption) {
    return res.status(400).json({ message: "Data booking tidak lengkap." });
  }

  try {
    const originalService = await prisma.service.findFirst({
      where: { id: service.id, storeId: storeId },
    });

    if (!originalService) {
      return res
        .status(404)
        .json({ message: "Layanan yang dipilih tidak valid untuk toko ini." });
    }

    const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
    const handlingFee = 2000;
    let finalTotalPrice = originalService.price + deliveryFee + handlingFee;
    let discountAmount = 0;

    if (promoCode) {
      const promo = await prisma.promo.findFirst({
        where: {
          code: promoCode,
          status: "active",
        },
      });

      if (!promo) {
        return res
          .status(404)
          .json({ message: "Kode promo tidak ditemukan atau tidak aktif." });
      }

      if (promo.storeId && promo.storeId !== storeId) {
        return res.status(400).json({
          message: "Kode promo ini tidak berlaku untuk toko yang Anda pilih.",
        });
      }

      if (promo.discountType === "percentage") {
        discountAmount = (originalService.price * promo.value) / 100;
      } else {
        discountAmount = promo.value;
      }
      finalTotalPrice -= discountAmount;

      await prisma.promo.update({
        where: { id: promo.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    const scheduleDate = schedule ? new Date(schedule.date) : new Date();

    const newBooking = await prisma.booking.create({
      data: {
        totalPrice: finalTotalPrice,
        deliveryFee: deliveryFee,
        status: "Pending Payment",
        serviceName: originalService.name,
        deliveryOption: deliveryOption,
        scheduleDate: scheduleDate,
        addressId: addressId,
        userId: req.user.id,
        storeId: storeId,
      },
      include: { store: true, user: true },
    });

    const fullScheduleString = schedule
      ? `${scheduleDate.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - Pukul ${schedule.time}`
      : "Langsung diantar ke toko";

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Gagal membuat booking:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server saat membuat booking." });
  }
});

app.post("/api/reviews", authenticateToken, async (req, res) => {
  const { bookingId, storeId, rating, comment, imageUrl } = req.body;

  if (!bookingId || !storeId || !rating)
    return res.status(400).json({ message: "Data ulasan tidak lengkap." });
  try {
    const storeForReview = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!storeForReview) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const [, newReview] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "Reviewed" },
      }),
      prisma.review.create({
        data: {
          rating,
          comment,
          imageUrl,
          bookingId,
          storeId,
          userId: req.user.id,
          userName: req.user.name,
        },
      }),
    ]);

    const storeReviews = await prisma.review.findMany({ where: { storeId } });
    const totalRating = storeReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = parseFloat(
      (totalRating / storeReviews.length).toFixed(1)
    );
    await prisma.store.update({
      where: { id: storeId },
      data: { rating: newAverageRating },
    });

    if (storeForReview.ownerId) {
      await createNotification(
        storeForReview.ownerId,
        `Selamat! Anda menerima ulasan baru dengan ${rating} bintang dari ${req.user.name}.`,
        `/partner/reviews`
      );
    }

    res.status(201).json(newReview);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Booking ini sudah direview." });
    res.status(500).json({ message: "Gagal mengirim ulasan." });
  }
});

app.get("/api/reviews/store/:storeId", async (req, res) => {
  const { storeId } = req.params;
  try {
    const storeReviews = await prisma.review.findMany({
      where: { storeId },
      orderBy: { date: "desc" },
    });
    res.json(storeReviews);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data ulasan." });
  }
});

app.get("/api/stores", async (req, res) => {
  const { search, sortBy, lat, lng, minRating, services, openNow } = req.query;
  try {
    const whereClause = {
      storeStatus: "active",
      name: { contains: search || "", mode: "insensitive" },
      rating: { gte: parseFloat(minRating) || 0 },
    };

    if (services) {
      const serviceNames = services.split(",");
      whereClause.services = {
        some: {
          name: {
            in: serviceNames,
            mode: "insensitive",
          },
        },
      };
    }

    let stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        services: true,
      },
    });

    if (openNow === "true") {
      const now = new Date();
      const dayOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][now.getDay()];
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      stores = stores.filter((store) => {
        const schedule = store.schedule?.[dayOfWeek];
        return (
          schedule &&
          schedule.isOpen &&
          currentTime >= schedule.opens &&
          currentTime <= schedule.closes
        );
      });
    }

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      stores = stores.map((store) => {
        const distance = getDistance(
          userLat,
          userLng,
          store.latitude,
          store.longitude
        );
        return { ...store, distance };
      });
      if (sortBy === "distance") {
        stores.sort((a, b) => a.distance - b.distance);
      }
    }

    if (sortBy === "rating") {
      stores.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "createdAt") {
      stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(stores || []);
  } catch (error) {
    console.error("Gagal mengambil data toko:", error);
    res.status(500).json([]);
  }
});

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get("/sitemap.xml", async (req, res) => {
  const baseUrl = "http://localhost:5173";
  try {
    const stores = await prisma.store.findMany({
      where: { storeStatus: "active" },
      select: { id: true },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    xml += `<url><loc>${baseUrl}/</loc></url>`;
    xml += `<url><loc>${baseUrl}/store</loc></url>`;
    xml += `<url><loc>${baseUrl}/about</loc></url>`;

    stores.forEach((store) => {
      xml += `<url><loc>${baseUrl}/store/${store.id}</loc></url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Gagal membuat sitemap:", error);
    res.status(500).send("Gagal membuat sitemap");
  }
});

app.get("/api/stores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const store = await prisma.store.findUnique({ where: { id } });
    if (store) res.json(store);
    else res.status(404).json({ message: "Toko tidak ditemukan" });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data toko." });
  }
});

app.get("/api/stores/:storeId/services", async (req, res) => {
  const { storeId } = req.params;
  try {
    const storeExists = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!storeExists) {
      return res
        .status(404)
        .json({ message: "Toko dengan ID tersebut tidak ditemukan." });
    }

    const services = await prisma.service.findMany({
      where: { storeId: storeId },
      orderBy: [{ shoeType: "asc" }, { name: "asc" }],
    });

    res.json(services || []);
  } catch (error) {
    console.error(`Error fetching services for store ${storeId}:`, error);
    res.status(500).json({ message: "Gagal mengambil data layanan toko." });
  }
});

app.get("/api/banners", async (req, res) => {
  try {
    const allBanners = await prisma.banner.findMany({
      where: { status: "active" },
    });
    res.json(allBanners || []);
  } catch (error) {
    console.error("Gagal mengambil banner:", error);
    res.status(500).json([]);
  }
});

app.get("/api/services", (req, res) => {
  res.json(servicesData);
});

app.get("/api/user/recommendations", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const userBookings = await prisma.booking.findMany({
      where: {
        userId: userId,
        status: { in: ["Completed", "Reviewed"] },
      },
      select: {
        serviceName: true,
        storeId: true,
      },
      orderBy: {
        scheduleDate: "desc",
      },
      take: 10,
    });

    if (userBookings.length === 0) {
      return res.json([]);
    }

    const uniqueServiceNames = [
      ...new Set(userBookings.map((b) => b.serviceName)),
    ];
    const visitedStoreIds = [...new Set(userBookings.map((b) => b.storeId))];

    const recommendedStores = await prisma.store.findMany({
      where: {
        storeStatus: "active",
        id: {
          notIn: visitedStoreIds,
        },
        services: {
          some: {
            name: {
              in: uniqueServiceNames,
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        services: true,
      },
      take: 3,
    });

    res.json(recommendedStores);
  } catch (error) {
    console.error("Gagal mengambil data rekomendasi:", error);
    res.status(500).json({ message: "Gagal mengambil rekomendasi." });
  }
});

const partnerRouter = express.Router();
partnerRouter.use(authenticateToken);

const findMyStore = async (req, res, next) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!store) {
      return res
        .status(404)
        .json({ message: "Anda tidak memiliki toko terdaftar." });
    }
    req.store = store;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat mencari data toko.",
    });
  }
};

partnerRouter.get("/dashboard", findMyStore, async (req, res) => {
  try {
    const { id: storeId, name: storeName } = req.store;

    const allBookings = await prisma.booking.findMany({
      where: { storeId: storeId },
      include: { user: { select: { name: true } } },
      orderBy: { scheduleDate: "desc" },
    });

    const totalRevenue = allBookings
      .filter((b) => b.status === "Completed" || b.status === "Reviewed")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const newOrdersCount = allBookings.filter(
      (b) => b.status === "Processing"
    ).length;
    const completedOrdersCount = allBookings.filter(
      (b) => b.status === "Completed" || b.status === "Reviewed"
    ).length;
    const totalCustomers = new Set(allBookings.map((b) => b.userId)).size;

    const recentOrders = allBookings.slice(0, 5).map((order) => ({
      id: order.id,
      customerName: order.user.name,
      serviceName: order.serviceName,
      status: order.status,
    }));

    const revenueLast7Days = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dailySales = allBookings
          .filter((b) => {
            const bookingDate = new Date(b.scheduleDate);
            return (
              (b.status === "Completed" || b.status === "Reviewed") &&
              bookingDate >= dayStart &&
              bookingDate <= dayEnd
            );
          })
          .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
          date: dayStart.toLocaleDateString("id-ID", { weekday: "short" }),
          revenue: dailySales,
        };
      })
      .reverse();

    res.json({
      totalRevenue,
      newOrders: newOrdersCount,
      completedOrders: completedOrdersCount,
      totalCustomers,
      storeName,
      recentOrders,
      revenueLast7Days,
    });
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    res.status(500).json({ message: "Gagal mengambil data dashboard." });
  }
});

partnerRouter.get("/orders", findMyStore, async (req, res) => {
  const storeId = req.store.id;
  try {
    const orders = await prisma.booking.findMany({
      where: { storeId: storeId },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
      },
      orderBy: { scheduleDate: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan." });
  }
});

partnerRouter.patch(
  "/orders/:bookingId/work-status",
  findMyStore,
  async (req, res) => {
    const { bookingId } = req.params;
    const { newWorkStatus } = req.body;
    const { id: storeId } = req.store;

    const validStatuses = [
      "RECEIVED",
      "WASHING",
      "DRYING",
      "QUALITY_CHECK",
      "READY_FOR_PICKUP",
    ];
    if (!validStatuses.includes(newWorkStatus)) {
      return res
        .status(400)
        .json({ message: "Status pengerjaan tidak valid." });
    }

    try {
      const bookingToUpdate = await prisma.booking.findFirst({
        where: { id: bookingId, storeId: storeId },
      });

      if (!bookingToUpdate) {
        return res
          .status(404)
          .json({ message: "Pesanan tidak ditemukan di toko Anda." });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { workStatus: newWorkStatus },
        include: { user: true },
      });

      const workStatusLabel = {
        WASHING: "sedang dicuci",
        DRYING: "sedang dikeringkan",
        QUALITY_CHECK: "sedang dicek kualitasnya",
        READY_FOR_PICKUP: "sudah siap diambil",
      };

      if (workStatusLabel[newWorkStatus]) {
        await createNotification(
          updatedBooking.userId,
          `Pesanan #${bookingId.substring(0, 8)} kini ${
            workStatusLabel[newWorkStatus]
          }.`,
          `/track/${bookingId}`,
          bookingId
        );
      }

      io.emit("bookingUpdated", updatedBooking);

      res.status(200).json({
        message: "Status pengerjaan berhasil diperbarui.",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Gagal memperbarui status pengerjaan:", error);
      res.status(500).json({ message: "Gagal memperbarui status pengerjaan." });
    }
  }
);

partnerRouter.get("/settings", findMyStore, async (req, res) => {
  res.json(req.store);
});

partnerRouter.put("/settings", findMyStore, async (req, res) => {
  const { name, description, schedule, images, headerImage } = req.body;

  if (!name || !schedule || !images) {
    return res
      .status(400)
      .json({ message: "Data yang dikirim tidak lengkap." });
  }

  try {
    const updatedStore = await prisma.store.update({
      where: { id: req.store.id },
      data: {
        name,
        description: description || "",
        schedule,
        images,
        headerImage,
      },
    });
    res.status(200).json({
      message: "Pengaturan toko berhasil diperbarui.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Gagal memperbarui pengaturan toko:", error);
    res.status(500).json({
      message: "Gagal memperbarui pengaturan karena kesalahan server.",
    });
  }
});

partnerRouter.get("/services", findMyStore, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { storeId: req.store.id },
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data layanan." });
  }
});

partnerRouter.post("/services", findMyStore, async (req, res) => {
  const { name, description, price, shoeType } = req.body;

  const currentServiceCount = await prisma.service.count({
    where: { storeId: req.store.id },
  });

  if (currentServiceCount >= req.store.serviceLimit) {
    return res.status(403).json({
      message: `Batas maksimal ${req.store.serviceLimit} layanan untuk tier Anda telah tercapai. Silakan upgrade ke PRO.`,
    });
  }

  if (!name || price === undefined || !shoeType) {
    return res
      .status(400)
      .json({ message: "Nama, harga, dan tipe sepatu wajib diisi." });
  }
  try {
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseInt(price, 10),
        shoeType,
        storeId: req.store.id,
      },
    });
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat layanan baru." });
  }
});

partnerRouter.put("/services/:serviceId", findMyStore, async (req, res) => {
  const { serviceId } = req.params;
  const { name, description, price, shoeType } = req.body;
  try {
    const serviceToUpdate = await prisma.service.findFirst({
      where: { id: serviceId, storeId: req.store.id },
    });
    if (!serviceToUpdate) {
      return res
        .status(403)
        .json({ message: "Akses ditolak atau layanan tidak ditemukan." });
    }
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { name, description, price: parseInt(price, 10), shoeType },
    });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate layanan." });
  }
});

partnerRouter.delete("/services/:serviceId", findMyStore, async (req, res) => {
  const { serviceId } = req.params;
  try {
    const serviceToDelete = await prisma.service.findFirst({
      where: { id: serviceId, storeId: req.store.id },
    });
    if (!serviceToDelete) {
      return res
        .status(403)
        .json({ message: "Akses ditolak atau layanan tidak ditemukan." });
    }
    await prisma.service.delete({ where: { id: serviceId } });
    res.status(200).json({ message: "Layanan berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus layanan." });
  }
});

partnerRouter.post(
  "/upload-photo",
  findMyStore,
  upload.single("photo"),
  async (req, res) => {
    const storeData = await prisma.store.findUnique({
      where: { id: req.store.id },
    });
    const currentPhotoCount = storeData.images.length;

    if (currentPhotoCount >= req.store.photoLimit) {
      return res.status(403).json({
        message: `Batas maksimal ${req.store.photoLimit} foto untuk tier Anda telah tercapai. Silakan upgrade ke PRO.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }

    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "stridebase_photos",
        public_id: `photo-${req.store.id}-${Date.now()}`,
      });

      res.status(200).json({
        message: "Foto berhasil diunggah.",
        filePath: result.secure_url,
      });
    } catch (error) {
      console.error("Gagal memproses gambar:", error);
      res
        .status(500)
        .json({ message: `Gagal memproses gambar: ${error.message}` });
    }
  }
);

partnerRouter.get("/promos", findMyStore, async (req, res) => {
  try {
    const promos = await prisma.promo.findMany({
      where: { storeId: req.store.id },
      orderBy: { code: "asc" },
    });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data promo toko." });
  }
});

partnerRouter.post("/promos", findMyStore, async (req, res) => {
  const { code, description, discountType, value } = req.body;
  if (!code || !description || !discountType || !value) {
    return res.status(400).json({ message: "Data promo tidak lengkap." });
  }

  try {
    const currentPromoCount = await prisma.promo.count({
      where: { storeId: req.store.id },
    });

    const PROMO_LIMIT_BASIC = 3;
    if (req.store.tier === "BASIC" && currentPromoCount >= PROMO_LIMIT_BASIC) {
      return res.status(403).json({
        message: `Anda telah mencapai batas maksimal ${PROMO_LIMIT_BASIC} promo untuk tier BASIC. Upgrade ke PRO untuk promo tanpa batas.`,
      });
    }

    const newPromo = await prisma.promo.create({
      data: {
        ...req.body,
        value: parseInt(req.body.value, 10),
        storeId: req.store.id,
      },
    });
    res.status(201).json(newPromo);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Kode promo sudah digunakan." });
    }
    res.status(500).json({ message: "Gagal membuat promo baru." });
  }
});

partnerRouter.put("/promos/:promoId", findMyStore, async (req, res) => {
  const { promoId } = req.params;
  try {
    const promoToUpdate = await prisma.promo.findFirst({
      where: { id: promoId, storeId: req.store.id },
    });

    if (!promoToUpdate) {
      return res
        .status(403)
        .json({ message: "Akses ditolak atau promo tidak ditemukan." });
    }

    const updatedPromo = await prisma.promo.update({
      where: { id: promoId },
      data: {
        ...req.body,
        value: parseInt(req.body.value, 10),
      },
    });
    res.json(updatedPromo);
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui promo." });
  }
});

partnerRouter.patch(
  "/promos/:promoId/status",
  findMyStore,
  async (req, res) => {
    const { promoId } = req.params;
    const { newStatus } = req.body;
    try {
      const promoToUpdate = await prisma.promo.findFirst({
        where: { id: promoId, storeId: req.store.id },
      });
      if (!promoToUpdate) {
        return res
          .status(403)
          .json({ message: "Akses ditolak atau promo tidak ditemukan." });
      }
      const updatedPromo = await prisma.promo.update({
        where: { id: promoId },
        data: { status: newStatus },
      });
      res.json(updatedPromo);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengubah status promo." });
    }
  }
);

partnerRouter.delete("/promos/:promoId", findMyStore, async (req, res) => {
  const { promoId } = req.params;
  try {
    const promoToDelete = await prisma.promo.findFirst({
      where: { id: promoId, storeId: req.store.id },
    });
    if (!promoToDelete) {
      return res
        .status(403)
        .json({ message: "Akses ditolak atau promo tidak ditemukan." });
    }
    await prisma.promo.delete({ where: { id: promoId } });
    res.status(200).json({ message: "Promo berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus promo." });
  }
});

partnerRouter.get("/reviews", findMyStore, async (req, res) => {
  const storeId = req.store.id;

  try {
    const reviews = await prisma.review.findMany({
      where: { storeId: storeId },
      orderBy: { date: "desc" },
    });
    res.json(reviews);
  } catch (error) {
    console.error(`Gagal mengambil ulasan untuk toko ${storeId}:`, error);
    res.status(500).json({ message: "Gagal mengambil data ulasan." });
  }
});

partnerRouter.post(
  "/reviews/:reviewId/reply",
  findMyStore,
  async (req, res) => {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Balasan tidak boleh kosong." });
    }

    try {
      const review = await prisma.review.findFirst({
        where: { id: reviewId, storeId: req.store.id },
        include: { user: true },
      });

      if (!review) {
        return res.status(404).json({
          message: "Ulasan tidak ditemukan atau Anda tidak memiliki akses.",
        });
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          partnerReply: reply,
          partnerReplyDate: new Date(),
        },
      });

      await createNotification(
        review.userId,
        `${req.store.name} membalas ulasan Anda.`,
        `/store/${req.store.id}`
      );

      res.status(200).json(updatedReview);
    } catch (error) {
      console.error("Gagal menyimpan balasan:", error);
      res.status(500).json({ message: "Gagal menyimpan balasan." });
    }
  }
);

partnerRouter.get("/invoices/outstanding", findMyStore, async (req, res) => {
  try {
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        storeId: req.store.id,
        NOT: { status: "PAID" },
      },
      orderBy: { dueDate: "asc" },
    });
    res.json(outstandingInvoices);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data tagihan." });
  }
});

partnerRouter.get("/invoices/:id", findMyStore, async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: id, storeId: req.store.id },
      include: { items: true },
    });
    if (!invoice)
      return res.status(404).json({ message: "Invoice tidak ditemukan." });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail invoice." });
  }
});

partnerRouter.post("/invoices/:id/pay", findMyStore, async (req, res) => {
  const { id: invoiceId } = req.params;
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, storeId: req.store.id },
    });
    if (
      !invoice ||
      (invoice.status !== "SENT" && invoice.status !== "OVERDUE")
    ) {
      return res
        .status(400)
        .json({ message: "Tagihan ini tidak dapat dibayar." });
    }
    const order_id = `INV-PAY-${invoice.id}-${Date.now()}`;
    const transaction = {
      token: `dummy-token-${order_id}`,
      redirect_url: `http://localhost:5173/payment-finish?order_id=${order_id}&status=pending&type=invoice`,
    };
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        status: "PENDING",
        provider: "Midtrans (Simulasi)",
        transactionToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
    });
    res.json({ redirectUrl: transaction.redirect_url });
  } catch (error) {
    res.status(500).json({ message: "Gagal memulai proses pembayaran." });
  }
});

partnerRouter.post(
  "/upgrade/create-transaction",
  findMyStore,
  async (req, res) => {
    const store = req.store;
    const PRO_PRICE = 99000;

    try {
      const configData = fs.readFileSync(themeConfigPath, "utf8");
      const config = JSON.parse(configData);
      if (!config.featureFlags?.enableProTierUpgrade) {
        return res.status(403).json({
          message: "Fitur upgrade keanggotaan saat ini sedang dinonaktifkan.",
        });
      }
      if (store.tier === "PRO") {
        return res
          .status(400)
          .json({ message: "Toko Anda sudah berstatus PRO." });
      }

      const subscription = await prisma.subscription.upsert({
        where: { storeId: store.id },
        update: { status: "PENDING_PAYMENT" },
        create: {
          storeId: store.id,
          status: "PENDING_PAYMENT",
        },
      });

      const order_id = `SUB-${subscription.id}-${Date.now()}`;

      const transaction = {
        token: `dummy-token-${order_id}`,
        redirect_url: `http://localhost:5173/payment-finish?order_id=${order_id}&status=pending&type=subscription`,
      };

      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: PRO_PRICE,
          status: "PENDING",
          provider: "Midtrans (Simulasi)",
          transactionToken: transaction.token,
          redirectUrl: transaction.redirect_url,
        },
      });

      res.json({ redirectUrl: transaction.redirect_url });
    } catch (error) {
      console.error("Gagal membuat transaksi langganan:", error);
      res.status(500).json({ message: "Gagal memproses permintaan upgrade." });
    }
  }
);

app.use("/api/partner", partnerRouter);

const paymentRouter = express.Router();
paymentRouter.use(authenticateToken);

paymentRouter.post("/create-transaction", async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID dibutuhkan." });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Booking tidak ditemukan atau akses ditolak." });
    }

    const transaction = {
      token: `dummy-token-${booking.id}-${Date.now()}`,
      redirect_url: `http://localhost:5173/payment-finish?order_id=${booking.id}&status=pending&type=booking`,
    };

    const newPayment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        status: "PENDING",
        provider: "Midtrans (Simulasi)",
        transactionToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
    });

    res.json({ redirectUrl: newPayment.redirectUrl });
  } catch (error) {
    console.error("Gagal membuat transaksi:", error);
    res.status(500).json({ message: "Gagal memproses pembayaran." });
  }
});

app.use("/api/payments", paymentRouter);

app.post("/api/webhooks/payment-notification", async (req, res) => {
  const { order_id, transaction_status } = req.body;
  console.log(
    `Webhook diterima untuk ID ${order_id} dengan status ${transaction_status}`
  );

  try {
    let paymentStatus;
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      paymentStatus = "SUCCESS";
    } else if (transaction_status === "pending") {
      paymentStatus = "PENDING";
    } else {
      paymentStatus = "CANCELLED";
    }

    if (order_id.startsWith("SUB-")) {
      const subscriptionId = order_id.split("-")[1];

      if (paymentStatus === "SUCCESS") {
        await prisma.$transaction(async (tx) => {
          const subscription = await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: "ACTIVE",
              currentPeriodEnd: new Date(
                new Date().setDate(new Date().getDate() + 30)
              ),
            },
            include: { store: true },
          });

          await tx.store.update({
            where: { id: subscription.storeId },
            data: { tier: "PRO" },
          });

          await tx.payment.updateMany({
            where: { subscriptionId: subscriptionId },
            data: { status: "SUCCESS" },
          });

          await createNotification(
            subscription.store.ownerId,
            `Selamat! Toko Anda "${subscription.store.name}" kini berstatus PRO.`,
            "/partner/dashboard"
          );
        });
      }
    } else {
      let bookingStatus;
      if (paymentStatus === "SUCCESS") bookingStatus = "Processing";
      else if (paymentStatus === "PENDING") bookingStatus = "Pending Payment";
      else bookingStatus = "Cancelled";

      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { bookingId: order_id },
          data: { status: paymentStatus },
        });

        const booking = await tx.booking.update({
          where: { id: order_id },
          data: { status: bookingStatus },
          include: { store: true },
        });

        if (paymentStatus === "SUCCESS" && booking && booking.store) {
          const commissionRate = booking.store.commissionRate;
          const grossAmount = booking.totalPrice;
          const earnedAmount = (grossAmount * commissionRate) / 100;

          await tx.platformEarning.create({
            data: {
              bookingId: booking.id,
              storeId: booking.storeId,
              grossAmount: grossAmount,
              commissionRate: commissionRate,
              earnedAmount: earnedAmount,
            },
          });

          await createNotification(
            booking.userId,
            `Pembayaran untuk pesanan #${booking.id.substring(0, 8)} berhasil!`,
            `/track/${booking.id}`,
            booking.id
          );
        }
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const adminRouter = express.Router();
adminRouter.use(authenticateToken);

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya untuk Admin." });
  }
  next();
};

adminRouter.use(isAdmin);

adminRouter.get("/export/transactions", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            user: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID_Pesanan",
      "Pengguna",
      "Toko",
      "Tanggal",
      "Jumlah",
      "Status_Pembayaran",
      "Penyedia_Pembayaran",
    ];
    const csvData = payments
      .map((p) =>
        [
          p.bookingId,
          p.booking.user.name,
          p.booking.store.name,
          new Date(p.createdAt).toLocaleDateString("id-ID"),
          p.amount,
          p.status,
          p.provider,
        ].join(",")
      )
      .join("\n");

    const csv = `${headers.join(",")}\n${csvData}`;

    res.header("Content-Type", "text/csv");
    res.attachment(`Laporan_Transaksi_${startDate}_hingga_${endDate}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Gagal mengekspor data transaksi:", error);
    res.status(500).json({ message: "Gagal mengekspor data." });
  }
});

adminRouter.get("/config", (req, res) => {
  fs.readFile(themeConfigPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal membaca file konfigurasi." });
    }
    res.json(JSON.parse(data));
  });
});

adminRouter.post("/config", async (req, res) => {
  const newConfigData = req.body;
  const requester = req.user;

  try {
    await prisma.approvalRequest.create({
      data: {
        requestedById: requester.id,
        actionType: "UPDATE_GLOBAL_SETTINGS",
        payload: newConfigData,
        status: "PENDING",
      },
    });

    res.status(202).json({
      message:
        "Permintaan untuk mengubah pengaturan global telah dikirim dan menunggu persetujuan Developer.",
    });
  } catch (error) {
    console.error("Gagal membuat permintaan perubahan konfigurasi:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat permintaan perubahan konfigurasi." });
  }
});

adminRouter.get("/stats", async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalRevenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    });
    const platformEarningsResult = await prisma.platformEarning.aggregate({
      _sum: { earnedAmount: true },
    });
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();

    res.json({
      totalBookings,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      platformRevenue: platformEarningsResult._sum.earnedAmount || 0,
      totalUsers,
      totalStores,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data statistik." });
  }
});

adminRouter.get("/transactions", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            user: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(payments);
  } catch (error) {
    console.error("Gagal mengambil data transaksi:", error);
    res.status(500).json({ message: "Gagal mengambil data transaksi." });
  }
});

adminRouter.get("/bookings", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
      orderBy: {
        scheduleDate: "desc",
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error("Gagal mengambil data semua booking:", error);
    res.status(500).json({ message: "Gagal mengambil data booking." });
  }
});

adminRouter.patch("/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  const validStatuses = ["Processing", "Completed", "Cancelled"];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: { status: newStatus },
    });

    const message = `Status pesanan Anda #${id.substring(
      0,
      8
    )} telah diubah oleh admin menjadi "${newStatus}".`;
    await createNotification(
      updatedBooking.userId,
      message,
      `/track/${id}`,
      id
    );

    io.emit("bookingUpdated", updatedBooking);

    res.status(200).json(updatedBooking);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Booking tidak ditemukan." });
    }
    console.error("Gagal mengubah status booking:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

adminRouter.get("/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
      orderBy: {
        date: "desc",
      },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data ulasan." });
  }
});

adminRouter.delete("/reviews/:id", async (req, res) => {
  const { id: reviewId } = req.params;
  const requester = req.user;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: { select: { name: true } } },
    });
    if (!review) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    const payload = {
      reviewId: review.id,
      reviewComment: review.comment,
      reviewRating: review.rating,
      userName: review.user.name,
    };

    await prisma.approvalRequest.create({
      data: {
        requestedById: requester.id,
        actionType: "DELETE_REVIEW",
        payload: payload,
        status: "PENDING",
      },
    });

    res.status(202).json({
      message: `Permintaan untuk menghapus ulasan telah dikirim dan menunggu persetujuan Developer.`,
    });
  } catch (error) {
    console.error("Gagal membuat permintaan hapus ulasan:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat permintaan penghapusan ulasan." });
  }
});

adminRouter.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookings = await prisma.booking.findMany({
          where: { userId: user.id },
        });
        const bookingIds = bookings.map((b) => b.id);

        const payments = await prisma.payment.aggregate({
          _sum: { amount: true },
          _count: { id: true },
          where: {
            bookingId: { in: bookingIds },
            status: "SUCCESS",
          },
        });

        return {
          ...user,
          totalSpent: payments._sum.amount || 0,
          transactionCount: payments._count.id || 0,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);
    res.status(500).json({ message: "Gagal mengambil data pengguna." });
  }
});

adminRouter.patch("/users/:id/role", async (req, res) => {
  const { id: targetUserId } = req.params;
  const { newRole } = req.body;
  const requester = req.user;

  if (!["customer", "admin", "mitra", "developer"].includes(newRole)) {
    return res.status(400).json({ message: "Peran tidak valid." });
  }

  if (newRole === "admin" || newRole === "developer") {
    try {
      const payload = { targetUserId, newRole };
      await prisma.approvalRequest.create({
        data: {
          requestedById: requester.id,
          actionType: "CHANGE_USER_ROLE",
          payload: payload,
          status: "PENDING",
        },
      });
      return res.status(202).json({
        message: `Permintaan untuk mengubah peran menjadi "${newRole}" telah dikirim dan menunggu persetujuan Developer.`,
      });
    } catch (error) {
      return res.status(500).json({ message: "Gagal membuat permintaan." });
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: "Pengguna tidak ditemukan." });
  }
});

adminRouter.patch("/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  if (!["active", "blocked"].includes(newStatus))
    return res.status(400).json({ message: "Status tidak valid." });
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: "Pengguna tidak ditemukan." });
  }
});

adminRouter.delete("/users/:id", async (req, res) => {
  const { id: userIdToDelete } = req.params;
  const requester = req.user;

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
    });

    if (!userToDelete) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    if (
      userToDelete.id === requester.id ||
      userToDelete.role === "admin" ||
      userToDelete.role === "developer"
    ) {
      return res.status(403).json({
        message:
          "Aksi tidak diizinkan. Admin dan Developer tidak dapat dihapus melalui alur ini.",
      });
    }

    const payload = {
      userId: userToDelete.id,
      userName: userToDelete.name,
      userEmail: userToDelete.email,
    };

    await prisma.approvalRequest.create({
      data: {
        requestedById: requester.id,
        actionType: "DELETE_USER",
        payload: payload,
        status: "PENDING",
      },
    });

    res.status(202).json({
      message: `Permintaan untuk menghapus pengguna "${userToDelete.name}" telah dikirim dan menunggu persetujuan Developer.`,
    });
  } catch (error) {
    console.error("Gagal membuat permintaan hapus pengguna:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat permintaan penghapusan pengguna." });
  }
});

adminRouter.get("/stores", async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        ownerUser: {
          select: {
            name: true,
          },
        },
      },
    });

    const storesWithStats = await Promise.all(
      stores.map(async (store) => {
        const bookings = await prisma.booking.findMany({
          where: { storeId: store.id },
        });
        const bookingIds = bookings.map((b) => b.id);

        const payments = await prisma.payment.aggregate({
          _sum: { amount: true },
          _count: { id: true },
          where: {
            bookingId: { in: bookingIds },
            status: "SUCCESS",
          },
        });

        const ownerName = store.ownerUser ? store.ownerUser.name : "N/A";
        const { ownerUser, ...storeData } = store;

        return {
          ...storeData,
          owner: ownerName,
          totalRevenue: payments._sum.amount || 0,
          transactionCount: payments._count.id || 0,
        };
      })
    );

    res.json(storesWithStats);
  } catch (error) {
    console.error("Gagal mengambil data toko:", error);
    res.status(500).json({ message: "Gagal mengambil data toko." });
  }
});

adminRouter.post("/stores", async (req, res) => {
  const {
    name,
    location,
    ownerId,
    latitude,
    longitude,
    commissionRate,
    billingType,
  } = req.body;

  if (!name || !location || !ownerId || !billingType) {
    return res.status(400).json({
      message: "Nama, lokasi, pemilik, dan tipe penagihan wajib diisi.",
    });
  }

  try {
    const newStore = await prisma.store.create({
      data: {
        name,
        location,
        ownerId,
        billingType,
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        commissionRate: parseFloat(commissionRate) || 10.0,
        storeStatus: "active",
        images: ["/images/store-placeholder.jpg"],
      },
    });
    res.status(201).json(newStore);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ message: "ID Pemilik tidak ditemukan." });
    }
    console.error("Gagal membuat toko baru:", error);
    res.status(500).json({ message: "Gagal membuat toko baru." });
  }
});

adminRouter.put("/stores/:id", async (req, res) => {
  const { id: storeId } = req.params;
  const requester = req.user;

  const {
    name,
    location,
    ownerId,
    commissionRate,
    billingType,
    latitude,
    longitude,
    storeStatus,
  } = req.body;

  try {
    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!currentStore) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    if (
      commissionRate !== undefined &&
      parseFloat(commissionRate) !== currentStore.commissionRate
    ) {
      const payload = {
        storeId,
        newCommissionRate: parseFloat(commissionRate),
      };
      await prisma.approvalRequest.create({
        data: {
          requestedById: requester.id,
          actionType: "UPDATE_COMMISSION_RATE",
          payload: payload,
          status: "PENDING",
        },
      });
      return res.status(202).json({
        message: `Permintaan untuk mengubah komisi menjadi ${commissionRate}% telah dikirim. Perubahan lain belum disimpan.`,
      });
    }

    const dataToUpdate = {
      name,
      location,
      ownerId,
      billingType,
      storeStatus,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: dataToUpdate,
    });
    res.json(updatedStore);
  } catch (error) {
    console.error("Gagal memperbarui toko:", error);
    res.status(500).json({ message: "Gagal memperbarui toko." });
  }
});

adminRouter.delete("/stores/:id", async (req, res) => {
  const { id: storeId } = req.params;
  const requester = req.user;

  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    const payload = { storeId, storeName: store.name };
    await prisma.approvalRequest.create({
      data: {
        requestedById: requester.id,
        actionType: "DELETE_STORE",
        payload: payload,
        status: "PENDING",
      },
    });

    res.status(202).json({
      message: `Permintaan untuk menghapus toko "${store.name}" telah dikirim dan menunggu persetujuan Developer.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat permintaan penghapusan toko." });
  }
});

adminRouter.patch("/stores/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  if (!["active", "inactive", "pending"].includes(newStatus))
    return res.status(400).json({ message: "Status tidak valid." });
  try {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: { storeStatus: newStatus },
    });
    res.json(updatedStore);
  } catch (error) {
    res.status(404).json({ message: "Toko tidak ditemukan." });
  }
});

adminRouter.patch("/stores/:id/tier", async (req, res) => {
  const { id } = req.params;
  const { newTier } = req.body;

  if (!["BASIC", "PRO"].includes(newTier)) {
    return res.status(400).json({ message: "Tingkatan (tier) tidak valid." });
  }

  try {
    const dataToUpdate = {
      tier: newTier,
    };

    if (newTier === "PRO") {
      dataToUpdate.billingType = "INVOICE";
      dataToUpdate.commissionRate = 0;
      dataToUpdate.isFeatured = true;
      dataToUpdate.photoLimit = 10;
      dataToUpdate.serviceLimit = 50;
    } else {
      dataToUpdate.billingType = "COMMISSION";
      dataToUpdate.commissionRate = 10.0;
      dataToUpdate.isFeatured = false;
      dataToUpdate.photoLimit = 3;
      dataToUpdate.serviceLimit = 5;
    }

    const updatedStore = await prisma.store.update({
      where: { id: id },
      data: dataToUpdate,
    });

    if (updatedStore.ownerId) {
      await createNotification(
        updatedStore.ownerId,
        `Status keanggotaan toko Anda "${updatedStore.name}" telah diubah oleh admin menjadi ${newTier}.`,
        "/partner/dashboard"
      );
    }

    res.status(200).json(updatedStore);
  } catch (error) {
    console.error("Gagal mengubah tingkatan toko:", error);
    res
      .status(404)
      .json({ message: "Toko tidak ditemukan atau terjadi kesalahan." });
  }
});

adminRouter.get("/promos", async (req, res) => {
  try {
    const allPromos = await prisma.promo.findMany();
    res.json(allPromos);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data promo." });
  }
});

adminRouter.post("/promos/validate", async (req, res) => {
  const { code, storeId } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Kode promo dibutuhkan." });
  }

  try {
    const promo = await prisma.promo.findFirst({
      where: {
        code: code.toUpperCase(),
        status: "active",
      },
    });

    if (!promo) {
      return res
        .status(404)
        .json({ message: "Kode promo tidak valid atau sudah tidak aktif." });
    }

    if (promo.storeId && promo.storeId !== storeId) {
      return res
        .status(400)
        .json({ message: "Kode promo tidak berlaku untuk toko ini." });
    }

    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: "Gagal memvalidasi promo." });
  }
});

adminRouter.post("/promos", async (req, res) => {
  const { code, description, discountType, value } = req.body;
  if (!code || !description || !discountType || !value)
    return res.status(400).json({ message: "Semua field wajib diisi." });
  try {
    const newPromo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        value: parseInt(value, 10),
      },
    });
    res.status(201).json(newPromo);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Kode promo sudah ada." });
    res.status(500).json({ message: "Gagal membuat promo baru." });
  }
});

adminRouter.put("/promos/:id", async (req, res) => {
  const { id } = req.params;
  const { code, description, discountType, value } = req.body;
  if (!code || !description || !discountType || !value)
    return res.status(400).json({ message: "Semua field wajib diisi." });
  try {
    const updatedPromo = await prisma.promo.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        value: parseInt(value, 10),
      },
    });
    res.json(updatedPromo);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Kode promo sudah ada." });
    res.status(404).json({ message: "Promo tidak ditemukan." });
  }
});

adminRouter.patch("/promos/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  if (!["active", "inactive"].includes(newStatus))
    return res.status(400).json({ message: "Status baru tidak valid." });
  try {
    const updatedPromo = await prisma.promo.update({
      where: { id },
      data: { status: newStatus },
    });
    res.json(updatedPromo);
  } catch (error) {
    res.status(404).json({ message: "Promo tidak ditemukan." });
  }
});

adminRouter.delete("/promos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.promo.delete({ where: { id } });
    res.status(200).json({ message: "Promo berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Promo tidak ditemukan." });
  }
});

adminRouter.get("/banners", async (req, res) => {
  try {
    const allBanners = await prisma.banner.findMany();
    res.json(allBanners);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data banner." });
  }
});

adminRouter.delete("/banners/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ message: "Banner berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Banner tidak ditemukan." });
  }
});

adminRouter.post("/banners", async (req, res) => {
  const { imageUrl, linkUrl } = req.body;
  if (!imageUrl || !linkUrl)
    return res
      .status(400)
      .json({ message: "URL Gambar dan Link Tujuan wajib diisi." });
  try {
    const newBanner = await prisma.banner.create({
      data: { imageUrl, linkUrl },
    });
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah banner." });
  }
});

adminRouter.get("/stores/:storeId/invoices", async (req, res) => {
  const { storeId } = req.params;
  try {
    const invoices = await prisma.invoice.findMany({
      where: { storeId: storeId },
      orderBy: { issueDate: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    console.error("Gagal mengambil data invoice:", error);
    res.status(500).json({ message: "Gagal mengambil data invoice." });
  }
});

adminRouter.post("/stores/:storeId/invoices", async (req, res) => {
  const { storeId } = req.params;
  const { issueDate, dueDate, items, notes } = req.body;

  if (!issueDate || !dueDate || !items || items.length === 0) {
    return res.status(400).json({ message: "Data invoice tidak lengkap." });
  }

  try {
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(invoiceCount + 1)
      .toString()
      .padStart(5, "0")}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        storeId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        totalAmount,
        notes,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity, 10),
            unitPrice: parseInt(item.unitPrice, 10),
            total: parseInt(item.total, 10),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Gagal membuat invoice baru:", error);
    res.status(500).json({ message: "Gagal membuat invoice baru." });
  }
});

adminRouter.patch("/invoices/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  if (!newStatus) {
    return res.status(400).json({ message: "Status baru dibutuhkan." });
  }

  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: newStatus },
      include: { store: true },
    });

    if (newStatus === "PAID" && updatedInvoice.store.ownerId) {
      await createNotification(
        updatedInvoice.store.ownerId,
        `Anda menerima tagihan baru: ${
          updatedInvoice.invoiceNumber
        } sejumlah Rp ${updatedInvoice.totalAmount.toLocaleString("id-ID")}.`,
        `/partner/invoices/${updatedInvoice.id}`
      );
    }

    res.json(updatedInvoice);
  } catch (error) {
    console.error("Gagal mengubah status invoice:", error);
    res.status(500).json({ message: "Gagal mengubah status invoice." });
  }
});

adminRouter.patch("/invoices/:id/send", async (req, res) => {
  const { id } = req.params;
  try {
    const invoiceToSend = await prisma.invoice.findUnique({ where: { id } });
    if (invoiceToSend.status !== "DRAFT") {
      return res
        .status(400)
        .json({ message: "Hanya invoice DRAFT yang bisa dikirim." });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: "SENT" },
      include: { store: true },
    });

    if (updatedInvoice.store.ownerId) {
      await createNotification(
        updatedInvoice.store.ownerId,
        `Anda menerima tagihan baru: ${
          updatedInvoice.invoiceNumber
        } sejumlah Rp ${updatedInvoice.totalAmount.toLocaleString("id-ID")}.`,
        "/partner/dashboard"
      );
    }

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengirim invoice." });
  }
});

adminRouter.patch("/invoices/:id/overdue", async (req, res) => {
  const { id } = req.params;
  const PENALTY_AMOUNT = 50000;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice tidak ditemukan." });
    }

    const hasPenalty = invoice.items.some((item) =>
      item.description.includes("Denda Keterlambatan")
    );
    if (hasPenalty) {
      return res
        .status(400)
        .json({ message: "Invoice ini sudah dikenakan denda." });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "OVERDUE",
        totalAmount: {
          increment: PENALTY_AMOUNT,
        },
        items: {
          create: {
            description: "Denda Keterlambatan",
            quantity: 1,
            unitPrice: PENALTY_AMOUNT,
            total: PENALTY_AMOUNT,
          },
        },
      },
    });
    res.json(updatedInvoice);
  } catch (error) {
    console.error("Gagal menandai invoice sebagai overdue:", error);
    res.status(500).json({ message: "Gagal memproses denda keterlambatan." });
  }
});

adminRouter.get("/invoices/:id", async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        store: {
          select: {
            name: true,
            location: true,
            ownerUser: { select: { email: true } },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice tidak ditemukan." });
    }

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "PRINT_INVOICE_VIEW",
        details: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          storeName: invoice.store.name,
        },
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error("Gagal mengambil atau mencatat log invoice:", error);
    res.status(500).json({ message: "Gagal mengambil detail invoice." });
  }
});

app.post(
  "/api/upload",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "stridebase_reviews",
        public_id: `review-${req.user.id}-${Date.now()}`,
      });

      res.status(200).json({
        message: "Gambar berhasil diunggah dan dioptimalkan.",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error("Gagal memproses gambar:", error);
      res
        .status(500)
        .json({ message: `Gagal memproses gambar: ${error.message}` });
    }
  }
);

// =================================================================
// === ENDPOINT BARU UNTUK ADMIN MENGELOLA PENGATURAN TOKO DETAIL ===
// =================================================================

// 1. Mengambil data detail satu toko untuk halaman pengaturan
adminRouter.get("/stores/:storeId/settings", async (req, res) => {
  const { storeId } = req.params;
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pengaturan toko." });
  }
});

// 2. Memperbarui data detail satu toko
adminRouter.put("/stores/:storeId/settings", async (req, res) => {
  const { storeId } = req.params;
  const { name, description, schedule, images, headerImage } = req.body;

  if (!name || !schedule || !images) {
    return res.status(400).json({ message: "Data yang dikirim tidak lengkap." });
  }

  try {
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        description: description || "",
        schedule,
        images,
        headerImage,
      },
    });
    res.status(200).json({
      message: "Pengaturan toko berhasil diperbarui oleh admin.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Gagal memperbarui pengaturan toko oleh admin:", error);
    res.status(500).json({
      message: "Gagal memperbarui pengaturan karena kesalahan server.",
    });
  }
});

// 3. Mengunggah foto untuk toko tertentu
adminRouter.post("/stores/upload-photo", upload.single("photo"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "stridebase_photos",
            public_id: `photo-admin-upload-${Date.now()}`,
        });

        res.status(200).json({
            message: "Foto berhasil diunggah oleh admin.",
            filePath: result.secure_url,
        });
    } catch (error) {
        console.error("Admin gagal memproses gambar:", error);
        res.status(500).json({ message: `Gagal memproses gambar: ${error.message}` });
    }
});

app.use("/api/admin", adminRouter);

const isDeveloper = (req, res, next) => {
  if (req.user.role !== "developer") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya untuk Developer." });
  }
  next();
};

const superUserRouter = express.Router();
superUserRouter.use(authenticateToken);
superUserRouter.use(isDeveloper);

superUserRouter.get("/config", (req, res) => {
  fs.readFile(themeConfigPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal membaca file konfigurasi." });
    }
    res.json(JSON.parse(data));
  });
});

superUserRouter.post("/config", async (req, res) => {
  const newConfig = req.body;
  try {
    // Simpan konfigurasi baru ke database
    const updatedSetting = await prisma.globalSetting.update({
      where: { key: "themeConfig" },
      data: { value: newConfig },
    });

    // Perbarui variabel global dan siarkan ke semua klien
    currentThemeConfig = updatedSetting.value;
    io.emit("themeUpdated", currentThemeConfig);
    console.log("🚀 Theme updated and broadcasted to all clients.");

    res.status(200).json({ message: "Konfigurasi berhasil diperbarui di database." });
  } catch (error) {
    console.error("❌ Failed to save theme config to database:", error);
    res.status(500).json({ message: "Gagal menyimpan konfigurasi ke database." });
  }
});

superUserRouter.post(
  "/upload-asset",
  upload.single("asset"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "stridebase_assets",
        public_id: `${req.file.fieldname}-${Date.now()}`,
      });

      res.status(200).json({
        message: "File berhasil diunggah ke Cloudinary.",
        filePath: result.secure_url,
      });
    } catch (error) {
      console.error("Gagal memproses aset:", error);
      res
        .status(500)
        .json({ message: `Gagal memproses aset: ${error.message}` });
    }
  }
);

superUserRouter.get("/maintenance/health-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = "Operasional";
    const redisStatus = "Tidak Digunakan";
    res.status(200).json({
      database: dbStatus,
      redis: redisStatus,
      overallStatus: "Semua Sistem Berjalan Normal",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      database: error.message.includes("database")
        ? "Bermasalah"
        : "Operasional",
      redis: error.message.includes("Redis") ? "Bermasalah" : "Operasional",
      overallStatus: "Masalah Kritis Terdeteksi",
    });
  }
});

superUserRouter.post("/maintenance/clear-cache", (req, res) => {
  redisClient
    .flushDb()
    .then(() => {
      console.log("Cache Redis berhasil dibersihkan oleh Developer.");
      res
        .status(200)
        .json({ message: "Cache aplikasi (Redis) berhasil dibersihkan." });
    })
    .catch((err) => {
      console.error("Gagal membersihkan cache Redis:", err);
      res.status(500).json({ message: "Gagal membersihkan cache." });
    });
});

superUserRouter.post("/maintenance/reseed-database", (req, res) => {
  console.log("Menerima permintaan untuk reset & seed database...");
  exec(
    "npx prisma migrate reset --force",
    { cwd: __dirname },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error saat menjalankan db seed: ${error.message}`);
        return res.status(500).json({ message: `Error: ${error.message}` });
      }
      if (stderr) {
        console.warn(`Stderr saat menjalankan db seed: ${stderr}`);
      }
      console.log(`Stdout dari db seed: ${stdout}`);
      res.status(200).json({
        message: "Database berhasil di-reset dan di-seed ulang.",
        log: stdout,
      });
    }
  );
});

superUserRouter.get("/maintenance/security-logs", async (req, res) => {
  try {
    const logs = await prisma.securityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error("Gagal mengambil log keamanan:", error);
    res.status(500).json({ message: "Gagal mengambil log keamanan." });
  }
});

superUserRouter.get("/approval-requests", async (req, res) => {
  try {
    const requests = await prisma.approvalRequest.findMany({
      where: { status: "PENDING" },
      include: {
        requestedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil daftar permintaan." });
  }
});

superUserRouter.post("/approval-requests/:id/resolve", async (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;
  const resolver = req.user;

  if (!["APPROVED", "REJECTED"].includes(resolution)) {
    return res.status(400).json({ message: "Resolusi tidak valid." });
  }

  try {
    const request = await prisma.approvalRequest.findUnique({
      where: { id },
    });
    if (!request || request.status !== "PENDING") {
      return res
        .status(404)
        .json({ message: "Permintaan tidak ditemukan atau sudah diproses." });
    }

    if (resolution === "REJECTED") {
      await prisma.approvalRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          resolvedById: resolver.id,
          resolvedAt: new Date(),
        },
      });
      return res.json({ message: "Permintaan berhasil ditolak." });
    }

    if (resolution === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        switch (request.actionType) {
          case "CHANGE_USER_ROLE":
            const { targetUserId, newRole } = request.payload;
            await tx.user.update({
              where: { id: targetUserId },
              data: { role: newRole },
            });
            break;
          case "UPDATE_COMMISSION_RATE":
            const { storeId, newCommissionRate } = request.payload;
            await tx.store.update({
              where: { id: storeId },
              data: { commissionRate: newCommissionRate },
            });
            break;
          case "DELETE_STORE":
            const { storeId: storeIdToDelete } = request.payload;
            await tx.store.delete({ where: { id: storeIdToDelete } });
            break;
          case "DELETE_USER":
            const { userId: userIdToDelete } = request.payload;
            await tx.user.delete({ where: { id: userIdToDelete } });
            break;
          case "DELETE_REVIEW":
            const { reviewId: reviewIdToDelete } = request.payload;
            await tx.review.delete({ where: { id: reviewIdToDelete } });
            break;
          case "UPDATE_GLOBAL_SETTINGS":
            fs.writeFileSync(
              themeConfigPath,
              JSON.stringify(request.payload, null, 2),
              "utf8"
            );
            io.emit("themeUpdated", request.payload);
            break;
          default:
            throw new Error("Tipe aksi tidak dikenal.");
        }

        await tx.approvalRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            resolvedById: resolver.id,
            resolvedAt: new Date(),
          },
        });
      });
      return res.json({
        message: `Aksi "${request.actionType}" berhasil dieksekusi.`,
      });
    }
  } catch (error) {
    console.error("Gagal memproses permintaan:", error);
    res
      .status(500)
      .json({ message: `Gagal memproses permintaan: ${error.message}` });
  }
});

superUserRouter.get("/config/payment", (req, res) => {
  try {
    const currentMode = process.env.PAYMENT_GATEWAY_MODE || "sandbox";
    res.status(200).json({
      mode: currentMode,
    });
  } catch (error) {
    console.error("Gagal membaca konfigurasi payment gateway:", error);
    res.status(500).json({ message: "Gagal membaca konfigurasi." });
  }
});

superUserRouter.post("/config/payment", async (req, res) => {
  const { mode } = req.body;
  const requester = req.user;

  if (!["sandbox", "production"].includes(mode)) {
    return res.status(400).json({ message: "Mode tidak valid." });
  }

  try {
    const envPath = path.join(__dirname, ".env");
    let envFileContent = fs.readFileSync(envPath, "utf8");

    const oldMode = process.env.PAYMENT_GATEWAY_MODE;
    process.env.PAYMENT_GATEWAY_MODE = mode;

    envFileContent = envFileContent.replace(
      /PAYMENT_GATEWAY_MODE=.*/g,
      `PAYMENT_GATEWAY_MODE="${mode}"`
    );

    fs.writeFileSync(envPath, envFileContent);

    await prisma.securityLog.create({
      data: {
        eventType: "PAYMENT_CONFIG_UPDATED",
        ipAddress: req.ip,
        details: `Developer ${requester.name} mengubah mode payment gateway dari '${oldMode}' menjadi '${mode}'.`,
      },
    });

    res.status(200).json({
      message: `Mode Payment Gateway berhasil diubah menjadi '${mode}'. Server mungkin perlu di-restart untuk menerapkan sepenuhnya.`,
    });
  } catch (error) {
    console.error("Gagal mengubah konfigurasi payment gateway:", error);
    res.status(500).json({ message: "Gagal menyimpan perubahan konfigurasi." });
  }
});

superUserRouter.get("/unverified-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        emailVerified: null,
        role: "customer", // Hanya tampilkan customer biasa
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Gagal mengambil data pengguna belum terverifikasi:", error);
    res.status(500).json({ message: "Gagal mengambil data." });
  }
});

// Endpoint untuk memverifikasi user secara manual
superUserRouter.patch("/users/:userId/verify", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Hapus token jika ada
      },
    });

    res.json({ message: `Pengguna ${updatedUser.name} berhasil diverifikasi.` });
  } catch (error) {
    console.error("Gagal memverifikasi pengguna secara manual:", error);
    res.status(500).json({ message: "Gagal memproses verifikasi." });
  }
});

app.use("/api/superuser", superUserRouter);

const errorLogger = async (err, req, res, next) => {
  if (err.status === 500 || !err.status) {
    try {
      await prisma.errorLog.create({
        data: {
          statusCode: err.status || 500,
          message: err.message,
          stackTrace: err.stack,
          requestInfo: `Method: ${req.method}, Path: ${
            req.originalUrl
          }, Body: ${JSON.stringify(req.body)}`,
        },
      });
      console.error("Critical error logged to database:", err.message);
    } catch (dbError) {
      console.error("Failed to log error to database:", dbError);
      console.error("Original error:", err);
    }
  }
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada server.",
  });
};

app.use(errorLogger);

server.listen(PORT, () => {
  console.log(
    `🚀 Server berjalan di http://localhost:${PORT} dan siap untuk koneksi real-time.`
  );
});