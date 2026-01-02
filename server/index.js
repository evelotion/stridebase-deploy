// File: server/index.js

// 1. Load env vars
import "dotenv/config"; 

import express from "express";
import cors from "cors";
import http from "http";
// import passport from "passport"; // <-- [DIKOMENTARI] Matikan import passport
import path from "path";
import { fileURLToPath } from "url";
import { initializeSocket } from "./socket.js";
import { startCronJobs } from "./cron/jobs.js";

// --- PERBAIKAN: Impor fungsi loadThemeConfig ---
import { loadThemeConfig } from "./config/theme.js"; 

// Konfigurasi Passport
// import "./config/passport.js"; // <-- [DIKOMENTARI] Matikan konfigurasi strategi Google

// Impor Middleware & Konfigurasi
import { errorHandler } from "./middleware/errorHandler.js";
import { checkMaintenanceMode } from "./middleware/maintenance.js";
import { corsOptions } from './config/cors.js';

// Impor Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import storeRoutes from './routes/store.routes.js';
import publicRoutes from './routes/public.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import adminRoutes from './routes/admin.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import superuserRoutes from './routes/superuser.routes.js';

const app = express();
const server = http.createServer(app);
initializeSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
// app.use(passport.initialize()); // <-- [DIKOMENTARI] Matikan inisialisasi passport

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Maintenance Mode Middleware
app.use(checkMaintenanceMode);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/superuser', superuserRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// --- PERBAIKAN: Panggil loadThemeConfig saat server start ---
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Memuat konfigurasi tema dari Database/JSON saat startup
  await loadThemeConfig(); 
  
  startCronJobs();
});