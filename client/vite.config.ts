// File: client/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    
    define: {
      'process.env': {}, 
    },

    server: {
      host: true, 
      port: 5173,
      
      proxy: {
        // 1. Proxy untuk API REST (HTTP)
        "/api": {
          target: "http://localhost:5000", 
          changeOrigin: true,
          secure: false,
        },
        // 2. Proxy untuk Uploads (Gambar)
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        // 3. [BARU] Proxy KHUSUS untuk Socket.IO (WebSocket)
        "/socket.io": {
          target: "http://localhost:5000", // Arahkan ke Backend
          changeOrigin: true,
          ws: true, // <--- WAJIB: Mengaktifkan dukungan WebSocket
          secure: false,
        },
      },
      
      watch: {
        usePolling: true,
      },
    },
  };
});