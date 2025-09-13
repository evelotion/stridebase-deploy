// File: server/index.js (Versi Final Refaktorisasi Lengkap)

import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Impor Konfigurasi & Modul
import { PORT } from "./config/constants.js";
import { corsOptions } from "./config/cors.js";
import { setupSocket } from "./socket.js";
import { loadThemeConfig } from "./config/theme.js";

// Impor SEMUA Routes
import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import userRoutes from "./routes/user.routes.js";
import storeRoutes from "./routes/store.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import superUserRoutes from "./routes/superuser.routes.js";
import helmet from 'helmet'; 

// Impor Middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { checkMaintenanceMode } from "./middleware/maintenance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);

async function startServer() {
  await loadThemeConfig();
  const io = setupSocket(server);
  app.use((req, res, next) => { req.io = io; next(); });

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use(checkMaintenanceMode);

  // === PENGGUNAAN ROUTES ===
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/stores", storeRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/partner", partnerRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/superuser", superUserRoutes);
  
  app.get("/", (req, res) => res.send("StrideBase Server is running!"));

  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

startServer();