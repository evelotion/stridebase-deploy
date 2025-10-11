// File: server/index.js (Perbaikan Final)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";

// Import Konfigurasi dan Middleware
import { corsOptions } from "./config/cors.js"; // <-- PERBAIKAN DI SINI
import "./config/passport.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { maintenanceMiddleware } from "./middleware/maintenance.js";
import { startCronJobs } from "./cron/jobs.js";
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

initializeSocket(server);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(maintenanceMiddleware);
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

// Menyajikan aplikasi client
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

// Error Handler
app.use(errorHandler);

// Menjalankan Cron Job
startCronJobs();

// Menjalankan Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});