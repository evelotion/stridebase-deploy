import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://stridebase-server.onrender.com", 
        changeOrigin: true,
      },
    },
    // --- TAMBAHKAN BLOK INI ---
    watch: {
      usePolling: true,
    },
    host: true, // Penting agar bisa diakses dari luar container
    // --- AKHIR BLOK TAMBAHAN ---
  },
});
