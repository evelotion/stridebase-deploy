import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async"; // <-- 1. IMPORT BARU

// Pastikan baris-baris ini ada dan urutannya benar
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* v-- 2. BUNGKUS APP DENGAN PROVIDER --v */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
    {/* ^-- 3. TUTUP PROVIDER --^ */}
  </React.StrictMode>
);
