


import "dotenv/config"; 

import express from "express";
import cors from "cors";
import http from "http";

import path from "path";
import { fileURLToPath } from "url";
import { initializeSocket } from "./socket.js";
import { startCronJobs } from "./cron/jobs.js";


import { loadThemeConfig } from "./config/theme.js"; 





import { errorHandler } from "./middleware/errorHandler.js";
import { checkMaintenanceMode } from "./middleware/maintenance.js";
import { corsOptions } from './config/cors.js';


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




global.serverStats = {
  requestsPerMinute: Array(60).fill(0),
  currentMinuteRequestCount: 0,
  totalRequests: 0,
  totalErrors: 0,
  responseTimes: [],
  startTime: Date.now(),
};


setInterval(() => {
 
  global.serverStats.requestsPerMinute.shift();
  global.serverStats.requestsPerMinute.push(global.serverStats.currentMinuteRequestCount);
  
 
  global.serverStats.currentMinuteRequestCount = 0;
  
 
  if (global.serverStats.responseTimes.length > 5000) {
    global.serverStats.responseTimes = global.serverStats.responseTimes.slice(-100);
  }
}, 60000);

const app = express();
const server = http.createServer(app);
initializeSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors(corsOptions));
app.use(express.json());






app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
   
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    
   
    global.serverStats.currentMinuteRequestCount++;
    global.serverStats.totalRequests++;
    global.serverStats.responseTimes.push(timeInMs);

   
    if (res.statusCode >= 400) {
      global.serverStats.totalErrors++;
    }
  });

  next();
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(checkMaintenanceMode);


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


app.use(errorHandler);

const PORT = process.env.PORT || 5000;


server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
 
  await loadThemeConfig(); 
  
  startCronJobs();
});