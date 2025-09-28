// File: server/index.js (Dengan Perbaikan Impor corsOptions)

import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';
import { setupSocket } from './socket.js';
import { corsOptions } from './config/cors.js'; // <-- PERBAIKAN DI BARIS INI
import { checkMaintenanceMode } from './middleware/maintenance.js';

// Impor Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import storeRoutes from './routes/store.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import superuserRoutes from './routes/superuser.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO dan dapatkan instance io
const io = setupSocket(server);

// Setelah io diinisialisasi, baru kita impor dan jalankan cron job
import cancelExpiredBookingsJob from './cron/jobs.js';
cancelExpiredBookingsJob.start();
console.log('Cron jobs for the application have been scheduled.');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  req.io = io; // Lampirkan io ke request
  next();
});

app.use(checkMaintenanceMode);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/superuser', superuserRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('StrideBase Server is running!');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});