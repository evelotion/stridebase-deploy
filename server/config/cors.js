// File: server/config/cors.js

const allowedOrigins = [
  "http://localhost:5173",
  "https://stridebase-client-ctct.onrender.com",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // 1. Izinkan request tanpa origin (seperti dari Postman atau server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Cek apakah origin ada di daftar whitelist statis
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. [BARU] Izinkan akses dari IP Network Lokal (WiFi)
    // Ini mendeteksi IP yang diawali 192.168.x.x, 10.x.x.x, atau 172.x.x.x dengan port 5173
    const isLocalNetwork =
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
      /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin);

    if (isLocalNetwork) {
      return callback(null, true);
    }

    // Log IP yang diblokir ke terminal agar mudah didiagnosa
    console.log("🚫 Blocked by CORS Origin:", origin);

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Opsional: diperlukan jika nanti pakai cookies
};
