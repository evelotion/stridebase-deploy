import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://server:5000", // Alamat backend kita
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
