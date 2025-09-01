// ======================================================================
// ===== DETEKTIF GLOBAL: Jika pesan ini tidak muncul di console,  =====
// ===== berarti file JavaScript yang baru tidak berjalan.        =====
// ======================================================================
console.log("🚀 STRIDEBASE APP STARTED! Main.jsx is running. Version: 1.0.1");

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";


// Pastikan baris-baris ini ada dan urutannya benar
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import './assets/css/custom-auth.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
