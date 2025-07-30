import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
<<<<<<< HEAD
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
=======
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://server:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://server:5000",
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true,
      },
      host: true,
    },
    // Blok baru untuk mengganti URL di produksi
    define: {
      'process.env.API_BASE_URL': JSON.stringify(
        isProduction 
          ? 'https://stridebase-server.onrender.com' 
          : ''
      ),
    },
  };
});
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
