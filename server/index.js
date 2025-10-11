// File: server/index.js (Dengan sintaks 'import' yang benar)

import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSocket } from './socket.js';
import { corsOptions } from './config/cors.js';
import cronJobs from './cron/jobs.js';
import { startEmailWorker } from './queues/emailWorker.js';

// --- TAMBAHKAN MULAI DARI SINI (Bagian 1: Impor) ---
import session from 'express-session';
import passport from 'passport';
import './config/passport.js'; // Mengimpor untuk menjalankan konfigurasi
// --- AKHIR PENAMBAHAN (Bagian 1) ---

// Import Routes
import authRoutes from './routes/auth.routes.js';
import storeRoutes from './routes/store.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import userRoutes from './routes/user.routes.js';
import publicRoutes from './routes/public.routes.js';
import reviewRoutes from './routes/review.routes.js';
import superuserRoutes from './routes/superuser.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import maintenanceMiddleware from './middleware/maintenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- TAMBAHKAN MULAI DARI SINI (Bagian 2: Middleware) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // 'true' jika pakai HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
// --- AKHIR PENAMBAHAN (Bagian 2) ---


// Apply maintenance middleware to all routes except /api/public
app.use((req, res, next) => {
    if (req.path.startsWith('/api/public') || req.path.startsWith('/api/auth/superuser-login')) {
        return next();
    }
    maintenanceMiddleware(req, res, next);
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/superuser', superuserRoutes);
app.use('/api', uploadRoutes);
app.use('/api/payment', paymentRoutes);

// Jalankan cron jobs
cronJobs();

// Mulai worker email
startEmailWorker();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});