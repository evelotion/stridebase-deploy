// File: stridebase-app-render/client/src/App.jsx

import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router, // Ganti nama BrowserRouter menjadi Router
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
import GlobalAnnouncement from "./components/GlobalAnnouncement";
import Notification from "./components/Notification";
import API_BASE_URL from "./apiConfig";

// Lazy load all page components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const FAQPage = React.lazy(() => import("./pages/FAQPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsConditionsPage = React.lazy(() =>
  import("./pages/TermsConditionsPage")
);
const LegalPage = React.lazy(() => import("./pages/LegalPage"));
const SitemapPage = React.lazy(() => import("./pages/SitemapPage"));
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
const AdminLayout = React.lazy(() => import("./components/AdminLayout"));
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
const PartnerLayout = React.lazy(() => import("./components/PartnerLayout"));
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
const DeveloperLayout = React.lazy(() =>
  import("./components/DeveloperLayout")
);
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
  isAnnouncementVisible,
  setAnnouncementVisible,
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
      {theme?.featureFlags?.enableGlobalAnnouncement &&
        theme?.globalAnnouncement && (
          <div className="d-none d-lg-block">
            {" "}
            {/* Dibungkus agar hanya tampil di desktop */}
            <GlobalAnnouncement
              message={theme.globalAnnouncement}
              isVisible={isAnnouncementVisible}
              onClose={() => setAnnouncementVisible(false)}
            />
          </div>
        )}
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
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

// Komponen App dipisah agar bisa menggunakan hook useNavigate
function AppContent() {
  const [theme, setTheme] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true);
  const navigate = useNavigate();

  const showMessage = (message, title = "Pemberitahuan") => {
    const finalTitle = message === "Login berhasil!" ? "Login Berhasil" : title;
    setNotification({ title: finalTitle, message });
  };

  const hideMessage = () => {
    setNotification(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const shouldShowAnnouncement =
      theme?.featureFlags?.enableGlobalAnnouncement &&
      theme?.globalAnnouncement &&
      isAnnouncementVisible;

    if (shouldShowAnnouncement) {
      document.body.classList.add("has-global-announcement");
    } else {
      document.body.classList.remove("has-global-announcement");
    }

    // Cleanup function untuk menghapus class saat komponen di-unmount
    return () => {
      document.body.classList.remove("has-global-announcement");
    };
  }, [theme, isAnnouncementVisible]);

  useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/theme-config`);
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

    const socketUrl = import.meta.env.PROD
      ? import.meta.env.VITE_API_PRODUCTION_URL
      : "/";

    if (user && user.id) {
      socket = io(socketUrl, {
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
        showMessage(`Notifikasi Baru: ${notification.message}`);
      });

      const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/notifications`, {
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

    const themeSocket = io(socketUrl);
    themeSocket.on("themeUpdated", (newThemeConfig) => {
      console.log("Menerima pembaruan tema secara real-time:", newThemeConfig);
      setTheme(newThemeConfig);
      applyTheme(newThemeConfig);
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
  }, [user]);

  const renderWithProps = (Component, extraProps = {}) => (
    <Component showMessage={showMessage} {...extraProps} />
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Notification notification={notification} onClose={hideMessage} />
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
          <Route path="reviews" element={renderWithProps(PartnerReviewsPage)} />
          <Route path="upgrade" element={renderWithProps(PartnerUpgradePage)} />
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
          <Route path="settings" element={renderWithProps(AdminSettingsPage)} />
          <Route
            path="invoice/print/:invoiceId"
            element={<InvoicePrintPage user={user} />}
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
              isAnnouncementVisible={isAnnouncementVisible} // <-- Tambahkan ini
              setAnnouncementVisible={setAnnouncementVisible} // <-- Tambahkan ini
            >
              {/* Outlet akan merender nested Routes di bawah ini */}
              <Outlet />
            </UserLayout>
          }
        >
          <Route
            index
            element={
              <HomePage
                theme={theme}
                user={user}
                notifications={notifications}
                unreadCount={unreadCount}
                handleLogout={handleLogout}
                // Props visibilitas sekarang dikelola di dalam HomePage
              />
            }
          />
          <Route
            path="about"
            element={
              <PageStatusWrapper path="/about" theme={theme}>
                <AboutPage />
              </PageStatusWrapper>
            }
          />
          <Route
            path="contact"
            element={
              <PageStatusWrapper path="/contact" theme={theme}>
                <ContactPage />
              </PageStatusWrapper>
            }
          />
          <Route
            path="faq"
            element={
              <PageStatusWrapper path="/faq" theme={theme}>
                <FAQPage />
              </PageStatusWrapper>
            }
          />

          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-conditions" element={<TermsConditionsPage />} />
          <Route path="legal" element={<LegalPage />} />
          <Route path="sitemap" element={<SitemapPage />} />

          <Route
            path="store"
            element={
              <PageStatusWrapper path="/store" theme={theme}>
                <StorePage />
              </PageStatusWrapper>
            }
          />
          <Route path="invoice/:id" element={<InvoicePage />} />
          <Route path="store/:id" element={renderWithProps(StoreDetailPage)} />
          <Route
            path="booking-confirmation"
            element={renderWithProps(BookingConfirmationPage)}
          />
          <Route path="booking-success" element={<BookingSuccessPage />} />
          <Route
            path="login"
            element={<LoginPage showMessage={showMessage} theme={theme} />}
          />
          <Route path="register" element={<RegisterPage theme={theme} />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="track/:bookingId" element={<TrackOrderPage />} />
          <Route path="payment-finish" element={<PaymentFinishPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

// Komponen App utama sekarang hanya membungkus Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
