import "./redis-client.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import redisClient from "./redis-client.js";
import emailQueue from "./queues/emailQueue.js";
import { servicesData } from "./data-stores.js";

// Helper untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = 5000;

// === SETUP SOCKET.IO ===
const server = http.createServer(app); // Bungkus aplikasi Express
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Izinkan koneksi dari frontend Vite
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ Seorang pengguna terhubung: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`❌ Pengguna terputus: ${socket.id}`);
  });
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    const userId = token.replace("fake-jwt-token-for-", "");
    if (!userId) return res.sendStatus(403);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === "blocked") return res.sendStatus(403);
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// ===================================
// API OTENTIKASI
// ===================================
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Semua kolom wajib diisi." });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      message: "Pendaftaran berhasil!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Email sudah terdaftar." });
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status === "blocked")
      return res.status(400).json({ message: "Email atau password salah." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Email atau password salah." });
    const token = `fake-jwt-token-for-${user.id}`;
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
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// ===================================
// API PENGGUNA (CUSTOMER)
// ===================================
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
      storeId: b.storeId,
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
      status: b.status,
    }));
    res.json(formattedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data booking." });
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
  const { storeId, service, deliveryOption, schedule } = req.body;

  if (!storeId || !service || !deliveryOption) {
    return res.status(400).json({ message: "Data booking tidak lengkap." });
  }

  try {
    const deliveryFee = deliveryOption === "pickup" ? 10000 : 0;
    const handlingFee = 2000;
    const totalPrice = service.price + deliveryFee + handlingFee;

    const scheduleDate = schedule ? new Date(schedule.date) : new Date();

    const newBooking = await prisma.booking.create({
      data: {
        totalPrice: totalPrice,
        deliveryFee: deliveryFee,
        status: "Processing",
        serviceName: service.name,
        deliveryOption: deliveryOption,
        scheduleDate: scheduleDate,
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

    await emailQueue.add("send-confirmation-email", {
      to: newBooking.user.email,
      subject: `Konfirmasi Booking Anda di ${newBooking.store.name}`,
      body: `Hai ${newBooking.user.name}, booking Anda untuk layanan ${newBooking.serviceName} dengan jadwal ${fullScheduleString} telah kami terima.`,
    });
    console.log(
      `Tugas email untuk booking #${newBooking.id} telah ditambahkan ke antrian.`
    );

    const formattedBooking = {
      id: newBooking.id,
      storeName: newBooking.store.name,
      totalPrice: newBooking.totalPrice,
      schedule: fullScheduleString,
    };
    res.status(201).json(formattedBooking);
  } catch (error) {
    console.error("Gagal membuat booking:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server saat membuat booking." });
  }
});

app.post("/api/reviews", authenticateToken, async (req, res) => {
  const { bookingId, storeId, rating, comment } = req.body;
  if (!bookingId || !storeId || !rating)
    return res.status(400).json({ message: "Data ulasan tidak lengkap." });
  try {
    const [, newReview] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "Reviewed" },
      }),
      prisma.review.create({
        data: {
          rating,
          comment,
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

// ===================================
// API PUBLIK
// ===================================
app.get("/api/stores", async (req, res) => {
  const { search, sortBy } = req.query;

  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};
  const orderBy = sortBy ? { [sortBy]: "desc" } : { createdAt: "desc" };

  const useCache = !search && !sortBy;
  const cacheKey = "stores:all";

  try {
    if (useCache) {
      const cachedStores = await redisClient.get(cacheKey);
      if (cachedStores) {
        console.log("CACHE HIT: Mengambil data toko dari Redis.");
        return res.json(JSON.parse(cachedStores));
      }
    }

    console.log(`DATABASE HIT: Mengambil data toko dengan filter:`, {
      where,
      orderBy,
    });
    const stores = await prisma.store.findMany({ where, orderBy });

    if (useCache) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(stores));
    }

    res.json(stores);
  } catch (error) {
    console.error("Gagal mengambil data toko:", error);
    res.status(500).json({ message: "Gagal mengambil data toko." });
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

app.get("/api/banners", async (req, res) => {
  try {
    const allBanners = await prisma.banner.findMany({
      where: { status: "active" },
    });
    res.json(allBanners);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data banner." });
  }
});

app.get("/api/services", (req, res) => {
  res.json(servicesData);
});

// ===================================
// API PARTNER
// ===================================
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
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server saat mencari data toko.",
      });
  }
};

partnerRouter.get("/dashboard", findMyStore, async (req, res) => {
  try {
    const { id: storeId, name: storeName } = req.store;
    const revenueResult = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { storeId: storeId, status: "Completed" },
    });
    const newOrdersCount = await prisma.booking.count({
      where: { storeId: storeId, status: "Processing" },
    });
    const completedOrdersCount = await prisma.booking.count({
      where: { storeId: storeId, status: "Completed" },
    });
    const distinctCustomers = await prisma.booking.findMany({
      where: { storeId: storeId },
      select: { userId: true },
      distinct: ["userId"],
    });

    res.json({
      totalRevenue: revenueResult._sum.totalPrice || 0,
      newOrders: newOrdersCount,
      completedOrders: completedOrdersCount,
      totalCustomers: distinctCustomers.length,
      storeName: storeName,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data dashboard." });
  }
});

partnerRouter.get("/orders", findMyStore, async (req, res) => {
  const storeId = req.store.id;
  try {
    const orders = await prisma.booking.findMany({
      where: { storeId: storeId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { scheduleDate: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan." });
  }
});

partnerRouter.get("/settings", findMyStore, (req, res) => {
  res.json(req.store.schedule || {});
});

partnerRouter.put("/settings", findMyStore, async (req, res) => {
  const { schedule } = req.body;
  try {
    const updatedStore = await prisma.store.update({
      where: { id: req.store.id },
      data: { schedule: schedule },
    });
    res
      .status(200)
      .json({
        message: "Jadwal berhasil diperbarui.",
        schedule: updatedStore.schedule,
      });
  } catch (error) {
    console.error("Gagal memperbarui jadwal:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui jadwal karena kesalahan server." });
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

app.use("/api/partner", partnerRouter);

// ===================================
// API PEMBAYARAN (FASE 10)
// ===================================
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
      redirect_url: `http://localhost:5173/payment-finish?order_id=${booking.id}&status=pending`,
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

// ===================================
// API WEBHOOK (Tanpa Autentikasi)
// ===================================
app.post("/api/webhooks/payment-notification", async (req, res) => {
  const { order_id, transaction_status } = req.body;
  console.log(
    `Webhook diterima untuk order ${order_id} dengan status ${transaction_status}`
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
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      paymentStatus = "CANCELLED";
    } else {
      paymentStatus = "FAILED";
    }

    await prisma.payment.update({
      where: { bookingId: order_id },
      data: { status: paymentStatus },
    });

    if (paymentStatus === "SUCCESS") {
      await prisma.booking.update({
        where: { id: order_id },
        data: { status: "Processing" },
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ===================================
// API ADMIN
// ===================================
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

adminRouter.get("/stats", async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalRevenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    });
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    res.json({
      totalBookings,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      totalUsers,
      totalStores,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data statistik." });
  }
});

adminRouter.get("/transactions", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
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

adminRouter.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    // Ini adalah cara yang lebih sederhana untuk demo
    const usersWithStats = await Promise.all(users.map(async (user) => {
        const bookings = await prisma.booking.findMany({ where: { userId: user.id } });
        const bookingIds = bookings.map(b => b.id);
        
        const payments = await prisma.payment.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: {
                bookingId: { in: bookingIds },
                status: 'SUCCESS'
            }
        });

        return {
            ...user,
            totalSpent: payments._sum.amount || 0,
            transactionCount: payments._count.id || 0
        };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);
    res.status(500).json({ message: "Gagal mengambil data pengguna." });
  }
});

adminRouter.patch("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  if (!["customer", "admin", "mitra"].includes(newRole))
    return res.status(400).json({ message: "Peran tidak valid." });
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
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

adminRouter.get("/stores", async (req, res) => {
  try {
    const stores = await prisma.store.findMany();
    
    const storesWithStats = await Promise.all(stores.map(async (store) => {
        const bookings = await prisma.booking.findMany({ where: { storeId: store.id } });
        const bookingIds = bookings.map(b => b.id);

        const payments = await prisma.payment.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: {
                bookingId: { in: bookingIds },
                status: 'SUCCESS'
            }
        });
        
        return {
            ...store,
            totalRevenue: payments._sum.amount || 0,
            transactionCount: payments._count.id || 0
        };
    }));

    res.json(storesWithStats);
  } catch (error) {
    console.error("Gagal mengambil data toko:", error);
    res.status(500).json({ message: "Gagal mengambil data toko." });
  }
});

adminRouter.post("/stores", async (req, res) => {
  const { name, location, owner } = req.body;
  if (!name || !location || !owner)
    return res
      .status(400)
      .json({ message: "Nama, lokasi, dan pemilik wajib diisi." });
  try {
    const newStore = await prisma.store.create({
      data: {
        name,
        location,
        owner,
        images: ["/images/store-placeholder.jpg"],
      },
    });
    res.status(201).json(newStore);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat toko baru." });
  }
});

adminRouter.put("/stores/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, owner } = req.body;
  if (!name || !location || !owner)
    return res
      .status(400)
      .json({ message: "Nama, lokasi, dan pemilik wajib diisi." });
  try {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: { name, location, owner },
    });
    res.json(updatedStore);
  } catch (error) {
    res.status(404).json({ message: "Toko tidak ditemukan." });
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

adminRouter.patch("/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  if (!["Processing", "Completed", "Cancelled"].includes(newStatus)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: { status: newStatus },
    });
    io.emit("bookingUpdated", updatedBooking);
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(404).json({ message: "Booking tidak ditemukan." });
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

app.use("/api/admin", adminRouter);

// JALANKAN SERVER
server.listen(PORT, () => {
  console.log(
    `🚀 Server berjalan di http://localhost:${PORT} dan siap untuk koneksi real-time.`
  );
});
