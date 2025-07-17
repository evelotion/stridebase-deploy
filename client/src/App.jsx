import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  NavLink,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";

// Komponen Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";

// Komponen Halaman Pengguna
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import InvoicePage from "./pages/InvoicePage";
import StorePage from "./pages/StorePage";
import StoreDetailPage from "./pages/StoreDetailPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaymentFinishPage from "./pages/PaymentFinishPage";

// Komponen Halaman Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminPromosPage from "./pages/AdminPromosPage";
import AdminBannersPage from "./pages/AdminBannersPage";

// Komponen Halaman Mitra
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import PartnerServicesPage from "./pages/PartnerServicesPage";
import PartnerOrdersPage from "./pages/PartnerOrdersPage";
import PartnerSettingsPage from "./pages/PartnerSettingsPage"; // <-- IMPORT BARU

const socket = io("http://localhost:5000");

// Layout Pengguna Biasa
const UserLayout = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

// ======== LAYOUT BARU UNTUK PANEL MITRA ========
const PartnerLayout = () => (
  <div className="d-flex" id="wrapper">
    <aside id="sidebar-wrapper">
      <div className="sidebar-heading">
        <NavLink className="navbar-brand" to="/partner/dashboard">
          <span className="fs-5">StrideBase Partner</span>
        </NavLink>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <NavLink
            to="/partner/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link-admin active" : "nav-link-admin"
            }
          >
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </NavLink>
        </li>
        <li className="list-group-item">
          <NavLink
            to="/partner/services"
            className={({ isActive }) =>
              isActive ? "nav-link-admin active" : "nav-link-admin"
            }
          >
            <i className="fas fa-concierge-bell me-2"></i>Layanan Saya
          </NavLink>
        </li>
        <li className="list-group-item">
          <NavLink
            to="/partner/orders"
            className={({ isActive }) =>
              isActive ? "nav-link-admin active" : "nav-link-admin"
            }
          >
            <i className="fas fa-receipt me-2"></i>Pesanan Masuk
          </NavLink>
        </li>
        <li className="list-group-item">
          <NavLink
            to="/partner/settings"
            className={({ isActive }) =>
              isActive ? "nav-link-admin active" : "nav-link-admin"
            }
          >
            <i className="fas fa-cog me-2"></i>Pengaturan Toko
          </NavLink>
        </li>
        <li className="list-group-item logout mt-auto">
          <NavLink to="/" className="nav-link-admin">
            <i className="fas fa-sign-out-alt me-2"></i>Kembali ke Situs
          </NavLink>
        </li>
      </ul>
    </aside>
    <main id="page-content-wrapper">
      <Outlet />
    </main>
  </div>
);
// ===============================================

// Komponen untuk melindungi rute
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== role) {
    // Redirect ke halaman utama jika tidak ada user atau role tidak sesuai
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log(
        `✅ Berhasil terhubung ke server Socket.IO dengan ID: ${socket.id}`
      );
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Grup Rute untuk Panel Mitra */}
        <Route
          path="/partner/*"
          element={
            <ProtectedRoute role="mitra">
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<PartnerDashboardPage />} />
          <Route path="services" element={<PartnerServicesPage />} />
          <Route path="orders" element={<PartnerOrdersPage />} />
          <Route path="settings" element={<PartnerSettingsPage />} />
        </Route>

        {/* Grup Rute untuk Panel Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="promos" element={<AdminPromosPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
        </Route>

        {/* Grup Rute untuk Pengguna Biasa */}
        <Route
          path="/*"
          element={
            <UserLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/store/:id" element={<StoreDetailPage />} />
                <Route
                  path="/booking-confirmation"
                  element={<BookingConfirmationPage />}
                />
                <Route
                  path="/booking-success"
                  element={<BookingSuccessPage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/payment-finish" element={<PaymentFinishPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </UserLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
