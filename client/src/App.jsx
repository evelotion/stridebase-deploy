import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { io } from "socket.io-client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";
import DeveloperLayout from "./components/DeveloperLayout";
import MessageBox from "./components/MessageBox"; // <-- 1. IMPORT KOMPONEN BARU

// Lazy load semua komponen halaman
const HomePage = React.lazy(() => import("./pages/HomePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const FAQPage = React.lazy(() => import("./pages/FAQPage"));
const InvoicePage = React.lazy(() => import("./pages/InvoicePage"));
const StorePage = React.lazy(() => import("./pages/StorePage"));
const StoreDetailPage = React.lazy(() => import("./pages/StoreDetailPage"));
const BookingConfirmationPage = React.lazy(() =>
  import("./pages/BookingConfirmationPage")
);
const BookingSuccessPage = React.lazy(() =>
  import("./pages/BookingSuccessPage")
);
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const PaymentFinishPage = React.lazy(() => import("./pages/PaymentFinishPage"));
const TrackOrderPage = React.lazy(() => import("./pages/TrackOrderPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const MaintenanceNoticePage = React.lazy(() =>
  import("./pages/MaintenanceNoticePage.jsx")
);

// Lazy load untuk panel Admin
const AdminDashboardPage = React.lazy(() =>
  import("./pages/AdminDashboardPage")
);
const AdminStoresPage = React.lazy(() => import("./pages/AdminStoresPage"));
const AdminUsersPage = React.lazy(() => import("./pages/AdminUsersPage"));
const AdminReportsPage = React.lazy(() => import("./pages/AdminReportsPage"));
const AdminPromosPage = React.lazy(() => import("./pages/AdminPromosPage"));
const AdminBannersPage = React.lazy(() => import("./pages/AdminBannersPage"));
const AdminBookingsPage = React.lazy(() => import("./pages/AdminBookingsPage"));
const AdminReviewsPage = React.lazy(() => import("./pages/AdminReviewsPage"));
const AdminSettingsPage = React.lazy(() => import("./pages/AdminSettingsPage"));
const AdminStoreInvoicePage = React.lazy(() =>
  import("./pages/AdminStoreInvoicePage")
);
const InvoicePrintPage = React.lazy(() => import("./pages/InvoicePrintPage"));

// Lazy load untuk panel Mitra
const PartnerDashboardPage = React.lazy(() =>
  import("./pages/PartnerDashboardPage")
);
const PartnerServicesPage = React.lazy(() =>
  import("./pages/PartnerServicesPage")
);
const PartnerOrdersPage = React.lazy(() => import("./pages/PartnerOrdersPage"));
const PartnerSettingsPage = React.lazy(() =>
  import("./pages/PartnerSettingsPage")
);
const PartnerReviewsPage = React.lazy(() =>
  import("./pages/PartnerReviewsPage")
);
const PartnerUpgradePage = React.lazy(() =>
  import("./pages/PartnerUpgradePage")
);
const PartnerInvoicePage = React.lazy(() =>
  import("./pages/PartnerInvoicePage")
);
const PartnerPromosPage = React.lazy(() => import("./pages/PartnerPromosPage"));

// Lazy load untuk panel Developer
const DeveloperDashboardPage = React.lazy(() =>
  import("./pages/DeveloperDashboardPage")
);

let socket;

const applyTheme = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  const favicon = document.querySelector("link[rel='icon']");

  if (favicon && theme.branding?.faviconUrl) {
    favicon.href = `${theme.branding.faviconUrl}`;
  }

  if (theme.colors) {
    root.style.setProperty(
      "--primary-color",
      theme.colors.primary || "#0dcaf0"
    );
    root.style.setProperty(
      "--secondary-color",
      theme.colors.secondary || "#28a745"
    );
    root.style.setProperty("--accent-color", theme.colors.accent || "#FFC107");
  }

  if (theme.typography) {
    if (theme.typography.fontFamily) {
      const fontFamilyValue = theme.typography.fontFamily;
      const fontName = fontFamilyValue
        .split(",")[0]
        .replace(/'/g, "")
        .replace(/\s/g, "+");
      const fontLinkId = "google-font-dynamic-link";
      let fontLink = document.getElementById(fontLinkId);

      if (!fontLink) {
        fontLink = document.createElement("link");
        fontLink.id = fontLinkId;
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
      }

      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      root.style.setProperty("--font-family", fontFamilyValue);
    }

    root.style.setProperty(
      "--font-size-base",
      theme.typography.baseFontSize || "16px"
    );
    root.style.setProperty(
      "--font-size-h1",
      theme.typography.h1FontSize || "3rem"
    );
    root.style.setProperty(
      "--font-size-button",
      theme.typography.buttonFontSize || "0.85rem"
    );
    root.style.setProperty(
      "--font-size-display",
      theme.typography.displayFontSize || "3.5rem"
    );
    root.style.setProperty(
      "--font-size-lead",
      theme.typography.leadFontSize || "1.25rem"
    );
    root.style.setProperty(
      "--font-size-button-lg",
      theme.typography.buttonLgFontSize || "1rem"
    );
  }

  if (theme.background) {
    if (theme.background.type === "image" && theme.background.imageUrl) {
      document.body.style.backgroundImage = `url(${theme.background.imageUrl})`;
      document.body.style.backgroundColor = "";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = theme.background.value || "#f8f9fa";
    }
  }
};

const PageStatusWrapper = ({ children, path, theme }) => {
  const isEnabled = theme?.featureFlags?.pageStatus?.[path] ?? true;

  if (isEnabled) {
    return children;
  }
  return <MaintenanceNoticePage />;
};

const UserLayout = ({
  theme,
  children,
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
}) => {
  useEffect(() => {
    document.body.classList.add("is-user-layout");
    return () => {
      document.body.classList.remove("is-user-layout");
    };
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar
        theme={theme}
        notifications={notifications}
        unreadCount={unreadCount}
        setNotifications={setNotifications}
        setUnreadCount={setUnreadCount}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

const PartnerLayout = ({ theme }) => {
  const navigate = useNavigate();

  const showUpgradeMenu =
    theme?.featureFlags?.enableTierSystem &&
    theme?.featureFlags?.enableProTierUpgrade;

  const handleLogout = (e) => {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      <aside id="sidebar-wrapper">
        <div className="sidebar-heading">
          <NavLink className="navbar-brand" to="/partner/dashboard">
            <span className="fs-5">StrideBase Partner</span>
          </NavLink>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <NavLink to="/" className="nav-link-admin">
              <i className="fas fa-home me-2"></i>Kembali ke Situs
            </NavLink>
          </li>
          <hr className="m-0" />
          <li className="list-group-item">
            <NavLink to="/partner/dashboard" className="nav-link-admin">
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </NavLink>
          </li>
          {showUpgradeMenu && (
            <li className="list-group-item">
              <NavLink
                to="/partner/upgrade"
                className="nav-link-admin text-info"
              >
                <i className="fas fa-crown me-2"></i>Upgrade ke PRO
              </NavLink>
            </li>
          )}
          <li className="list-group-item">
            <NavLink to="/partner/orders" className="nav-link-admin">
              <i className="fas fa-receipt me-2"></i>Pesanan Masuk
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/reviews" className="nav-link-admin">
              <i className="fas fa-star me-2"></i>Ulasan Pelanggan
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/promos" className="nav-link-admin">
              <i className="fas fa-tags me-2"></i>Manajemen Promo
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/services" className="nav-link-admin">
              <i className="fas fa-concierge-bell me-2"></i>Layanan Saya
            </NavLink>
          </li>
          <li className="list-group-item">
            <NavLink to="/partner/settings" className="nav-link-admin">
              <i className="fas fa-cog me-2"></i>Pengaturan Toko
            </NavLink>
          </li>
          <li className="list-group-item logout mt-auto">
            <a
              href="#"
              onClick={handleLogout}
              className="nav-link-admin text-danger"
            >
              <i className="fas fa-sign-out-alt me-2"></i>Logout
            </a>
          </li>
        </ul>
      </aside>
      <main id="page-content-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LoadingFallback = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  const [theme, setTheme] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // <-- 2. TAMBAHKAN STATE UNTUK MESSAGE BOX -->
  const [messageBox, setMessageBox] = useState({
    show: false,
    title: "",
    message: "",
  });

  // <-- 3. BUAT FUNGSI UNTUK MENAMPILKAN DAN MENYEMBUNYIKAN MESSAGE BOX -->
  const showMessage = (message, title = "Pemberitahuan") => {
    setMessageBox({ show: true, title, message });
  };

  const hideMessage = () => {
    setMessageBox({ show: false, title: "", message: "" });
  };

  useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        const response = await fetch("/api/public/theme-config");
        if (response.ok) {
          const data = await response.json();
          setTheme(data);
          applyTheme(data);
        }
      } catch (error) {
        console.error("Gagal mengambil konfigurasi tema:", error);
      }
    };
    fetchThemeConfig();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      // Gunakan URL Render untuk koneksi socket
      socket = io("https://stridebase-server.onrender.com", { // <-- PERBAIKAN
        query: { userId: user.id },
      });

      socket.on("connect", () => {
        console.log(
          `✅ Terhubung ke server Socket.IO dengan ID: ${socket.id} untuk user ${user.id}`
        );
      });

      socket.on("new_notification", (notification) => {
        console.log("Menerima notifikasi baru:", notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // Ganti alert dengan message box baru
        showMessage(`Notifikasi Baru: ${notification.message}`);
      });

      const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch("/api/user/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        } catch (error) {
          console.error("Gagal mengambil notifikasi:", error);
        }
      };
      fetchNotifications();
    }

    const themeSocket = io("");
    themeSocket.on("themeUpdated", (newThemeConfig) => {
      console.log("Menerima pembaruan tema secara real-time:", newThemeConfig);
      setTheme(newThemeConfig);
      applyTheme(newThemeConfig);
      // Ganti alert dengan message box baru
      showMessage("Tampilan tema telah diperbarui oleh administrator.");
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("new_notification");
        socket.disconnect();
      }
      themeSocket.off("themeUpdated");
      themeSocket.disconnect();
    };
  }, []);

  // <-- 4. TERUSKAN FUNGSI `showMessage` KE SEMUA RUTE (INI BAGIAN PENTING) -->
  const renderWithProps = (Component) => (
    <Component showMessage={showMessage} />
  );

  return (
    <Router>
      {/* <-- 5. TAMPILKAN MESSAGE BOX DI SINI --> */}
      <MessageBox
        show={messageBox.show}
        title={messageBox.title}
        message={messageBox.message}
        onOk={hideMessage}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/developer/*"
            element={
              <ProtectedRoute role="developer">
                <DeveloperLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={renderWithProps(DeveloperDashboardPage)}
            />
          </Route>

          <Route
            path="/partner/*"
            element={
              <ProtectedRoute role="mitra">
                <PartnerLayout theme={theme} />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PartnerDashboardPage />} />
            <Route
              path="services"
              element={renderWithProps(PartnerServicesPage)}
            />
            <Route path="orders" element={<PartnerOrdersPage />} />
            <Route
              path="settings"
              element={renderWithProps(PartnerSettingsPage)}
            />
            <Route
              path="reviews"
              element={renderWithProps(PartnerReviewsPage)}
            />
            <Route
              path="upgrade"
              element={renderWithProps(PartnerUpgradePage)}
            />
            <Route
              path="invoices/:id"
              element={renderWithProps(PartnerInvoicePage)}
            />
            <Route path="promos" element={renderWithProps(PartnerPromosPage)} />
          </Route>

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="stores" element={renderWithProps(AdminStoresPage)} />
            <Route
              path="stores/:storeId/invoices"
              element={renderWithProps(AdminStoreInvoicePage)}
            />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="promos" element={renderWithProps(AdminPromosPage)} />
            <Route path="banners" element={renderWithProps(AdminBannersPage)} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route
              path="stores/:storeId/invoices"
              element={renderWithProps(AdminStoreInvoicePage)}
            />
            <Route
              path="invoice/print/:invoiceId"
              element={<InvoicePrintPage />}
            />
          </Route>

          <Route
            path="/*"
            element={
              <UserLayout
                theme={theme}
                notifications={notifications}
                unreadCount={unreadCount}
                setNotifications={setNotifications}
                setUnreadCount={setUnreadCount}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/about"
                    element={
                      <PageStatusWrapper path="/about" theme={theme}>
                        <AboutPage />
                      </PageStatusWrapper>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <PageStatusWrapper path="/contact" theme={theme}>
                        <ContactPage />
                      </PageStatusWrapper>
                    }
                  />
                  <Route
                    path="/faq"
                    element={
                      <PageStatusWrapper path="/faq" theme={theme}>
                        <FAQPage />
                      </PageStatusWrapper>
                    }
                  />
                  <Route
                    path="/store"
                    element={
                      <PageStatusWrapper path="/store" theme={theme}>
                        <StorePage />
                      </PageStatusWrapper>
                    }
                  />

                  <Route path="/invoice/:id" element={<InvoicePage />} />
                  <Route
                    path="/store/:id"
                    element={renderWithProps(StoreDetailPage)}
                  />
                  <Route
                    path="/booking-confirmation"
                    element={renderWithProps(BookingConfirmationPage)}
                  />
                  <Route
                    path="/booking-success"
                    element={<BookingSuccessPage />}
                  />
                  <Route path="/login" element={renderWithProps(LoginPage)} />
                  <Route
                    path="/register"
                    element={renderWithProps(RegisterPage)}
                  />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/track/:bookingId"
                    element={<TrackOrderPage />}
                  />
                  <Route
                    path="/payment-finish"
                    element={<PaymentFinishPage />}
                  />
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </UserLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
