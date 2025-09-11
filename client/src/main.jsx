// File: client/src/main.jsx (Versi Perbaikan Final)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

// Pastikan urutan impor CSS sudah benar:
// 1. Library (Bootstrap)
// 2. Custom Styles (style.css, admin.css, dll.) agar bisa menimpa Bootstrap jika perlu
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import "./admin.css"; // Impor admin.css juga di sini untuk konsistensi

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);