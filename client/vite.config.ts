import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
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
    // define: {
    //   'process.env.API_BASE_URL': JSON.stringify(
    //     isProduction
    //       ? 'https://stridebase-server.onrender.com'
    //       : ''
    //   ),
    // },
  };
});