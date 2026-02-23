

const allowedOrigins = [
  "http://localhost:5173",
  "https://stridebase-client-ctct.onrender.com",
];

export const corsOptions = {
  origin: (origin, callback) => {
   
    if (!origin) {
      return callback(null, true);
    }

   
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

   
   
    const isLocalNetwork =
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
      /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin);

    if (isLocalNetwork) {
      return callback(null, true);
    }

   
    console.log("🚫 Blocked by CORS Origin:", origin);

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
