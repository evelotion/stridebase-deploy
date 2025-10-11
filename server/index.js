// File: server/index.js (Kode Lengkap Final & Perbaikan)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import cron from "node-cron";

// Import Konfigurasi dan Middleware
import corsOptions from "./config/cors.js";
import "./config/passport.js"; // Inisialisasi Passport.js
import { errorHandler } from "./middleware/errorHandler.js";
import { maintenanceMiddleware } from "./middleware/maintenance.js"; // <-- PERBAIKAN DI SINI
import { cleanupExpiredBookings } from "./cron/jobs.js";
import { initializeSocket } from "./socket.js";

// Import Rute
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import storeRoutes from "./routes/store.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import publicRoutes from "./routes/public.routes.js";
import userRoutes from "./routes/user.routes.js";
import superuserRoutes from "./routes/superuser.routes.js";

// Inisialisasi environment variables
dotenv.config();

// Konfigurasi path untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.IO
initializeSocket(server);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Middleware Maintenance Mode (diterapkan sebelum rute)
app.use(maintenanceMiddleware);

// Middleware untuk menyajikan file statis dari folder 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Definisi Rute API
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/user", userRoutes);
app.use("/api/superuser", superuserRoutes);

// Menyajikan aplikasi client (React/Vue/Angular) jika ada
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

// Middleware Error Handler (selalu di paling akhir)
app.use(errorHandler);

// Menjalankan Cron Job (setiap 5 menit)
cron.schedule("*/5 * * * *", () => {
  console.log("Running cron job: cleaning up expired bookings...");
  cleanupExpiredBookings();
});

// Menjalankan server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
