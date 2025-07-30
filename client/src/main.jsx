import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

// === TAMBAHKAN BLOK KODE INI ===
// Menentukan URL API berdasarkan lingkungan (development atau production)
const apiUrl = import.meta.env.PROD 
  ? "https://stridebase-server.onrender.com" // URL saat di-deploy
  : ""; // URL saat pengembangan lokal

// Mengganti fungsi fetch bawaan untuk otomatis menambahkan URL API
const originalFetch = window.fetch;
window.fetch = (url, options) => {
  // Hanya tambahkan prefix jika URL adalah path relatif (dimulai dengan '/')
  const fullUrl = url.startsWith('/') ? `${apiUrl}${url}` : url;
  return originalFetch(fullUrl, options);
};
// === AKHIR BLOK KODE TAMBAHAN ===


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);