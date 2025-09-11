// File: client/src/main.jsx (Perbaikan Final)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

// HANYA impor stylesheet yang bersifat global di sini
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css"; // style.css adalah file gaya utama kita

// Baris 'import "./admin.css";' telah dihapus dari sini

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);