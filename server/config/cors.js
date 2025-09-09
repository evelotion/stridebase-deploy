// File: server/config/cors.js

const allowedOrigins = [
  "http://localhost:5173",
  "https://stridebase-client-ctct.onrender.com",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti dari Postman atau aplikasi mobile)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};