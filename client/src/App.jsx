

import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";

import "./pages/HomePageElevate.css";

import { io } from "socket.io-client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation } from "react-router-dom";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalAnnouncement from "./components/GlobalAnnouncement";
import MobileBottomNav from "./components/MobileBottomNav";
import DemoPage from './pages/DemoPage';

import API_BASE_URL from "./apiConfig";



const Notification = ({ notification, onClose }) => {
 
  useEffect(() => {
    if (notification) {
     
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

     
     
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

 
  if (!notification) return null;

 
  const isError = 
    notification.title?.toLowerCase().includes("gagal") || 
    notification.title?.toLowerCase().includes("error") || 
    notification.message?.toLowerCase().includes("salah") ||
    notification.message?.toLowerCase().includes("failed");

  return (
    <div
      className="pe-notification-toast"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
       
        background: "var(--sb-card-bg, rgba(20, 20, 20, 0.95))", 
        color: "var(--sb-text-main, #ffffff)",
        borderLeft: isError ? "4px solid #ef4444" : "4px solid #3b82f6",
        border: "1px solid var(--sb-card-border, rgba(255,255,255,0.1))",
        
       
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        
       
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-start",
        gap: "15px",
        maxWidth: "380px",
        minWidth: "300px",
        animation: "slideInRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
      }}
    >
      {}
      <div 
        style={{ 
          fontSize: "1.2rem", 
          color: isError ? "#ef4444" : "#3b82f6",
          marginTop: "2px"
        }}
      >
        {isError ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-check-circle"></i>}
      </div>

      {}
      <div style={{ flex: 1 }}>
        <h6 
          style={{ 
            margin: "0 0 4px 0", 
            fontWeight: "700", 
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.95rem",
            color: "inherit" 
          }}
        >
          {notification.title}
        </h6>
        <p 
          style={{ 
            margin: 0, 
            fontSize: "0.85rem", 
            lineHeight: "1.4",
            opacity: 0.8
          }}
        >
          {notification.message}
        </p>
      </div>

      {}
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "inherit",
          opacity: 0.5,
          fontSize: "1.2rem",
          cursor: "pointer",
          padding: "0",
          marginLeft: "5px",
          transition: "opacity 0.2s"
        }}
        onMouseOver={(e) => e.target.style.opacity = 1}
        onMouseOut={(e) => e.target.style.opacity = 0.5}
      >
        &times;
      </button>

      {}
      <style>
        {`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

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
const PaymentConfirmMobilePage = React.lazy(() =>
  import("./pages/PaymentConfirmMobilePage")
);
const TrackOrderPage = React.lazy(() => import("./pages/TrackOrderPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const MaintenanceNoticePage = React.lazy(() =>
  import("./pages/MaintenanceNoticePage")
);
const AdminLayout = React.lazy(() => import("./components/AdminLayout"));
const AdminDashboardPage = React.lazy(() =>
  import("./pages/AdminDashboardPage")
);
const AdminStoresPage = React.lazy(() => import("./pages/AdminStoresPage"));
const AdminNewStorePage = React.lazy(() => import("./pages/AdminNewStorePage"));
const AdminUsersPage = React.lazy(() => import("./pages/AdminUsersPage"));
const AdminReportsPage = React.lazy(() => import("./pages/AdminReportsPage"));
const AdminPromosPage = React.lazy(() => import("./pages/AdminPromosPage"));
const AdminBannersPage = React.lazy(() => import("./pages/AdminBannersPage"));
const AdminBookingsPage = React.lazy(() => import("./pages/AdminBookingsPage"));
const AdminReviewsPage = React.lazy(() => import("./pages/AdminReviewsPage"));
const AdminSettingsPage = React.lazy(() => import("./pages/AdminSettingsPage"));
const AdminStoreInvoicesPage = React.lazy(() =>
  import("./pages/AdminStoreInvoicesPage")
);
const AdminStoreSettingsPage = React.lazy(() =>
  import("./pages/AdminStoreSettingsPage")
);
const AdminPayoutsPage = React.lazy(() => import("./pages/AdminPayoutsPage"));
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
const PartnerWalletPage = React.lazy(() => import("./pages/PartnerWalletPage"));
const PartnerReportsPage = React.lazy(() =>
  import("./pages/PartnerReportsPage")
);
const DeveloperLayout = React.lazy(() =>
  import("./components/DeveloperLayout")
);
const DeveloperDashboardPage = React.lazy(() =>
  import("./pages/DeveloperDashboardPage")
);
const EmailVerifiedPage = React.lazy(() => import("./pages/EmailVerifiedPage"));
const ForgotPasswordPage = React.lazy(() =>
  import("./pages/ForgotPasswordPage")
);
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const PaymentSimulationPage = React.lazy(() =>
  import("./pages/PaymentSimulationPage")
);
const PaymentSuccessPage = React.lazy(() =>
  import("./pages/PaymentSuccessPage")
);
const LoginSuccessPage = React.lazy(() => import("./pages/LoginSuccessPage"));

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

    if (theme.colors.button) {
      root.style.setProperty(
        "--button-background-color",
        theme.colors.button.background
      );
      root.style.setProperty("--button-text-color", theme.colors.button.text);
      root.style.setProperty(
        "--button-background-hover-color",
        theme.colors.button.backgroundHover
      );
      root.style.setProperty(
        "--button-text-hover-color",
        theme.colors.button.textHover
      );
    }
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
  isLightMode,
  toggleTheme,
}) => {
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false);
  
 
  const location = useLocation();
 
  const hideNavPaths = ["/store/", "/booking-confirmation", "/payment"];
  
 
  const shouldHideNav = hideNavPaths.some((path) => 
    location.pathname.includes(path) && location.pathname !== "/store"
  );

  useEffect(() => {
    document.body.classList.add("is-user-layout");
    return () => {
      document.body.classList.remove("is-user-layout");
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar
        theme={theme}
        notifications={notifications}
        unreadCount={unreadCount}
        setNotifications={setNotifications}
        setUnreadCount={setUnreadCount}
        homePageTheme="elevate"
      />
      
      {theme?.featureFlags?.enableGlobalAnnouncement &&
        theme?.globalAnnouncement && (
          <div className="d-none d-lg-block">
            <GlobalAnnouncement
              message={theme.globalAnnouncement}
              isVisible={isAnnouncementVisible}
              onClose={() => setAnnouncementVisible(false)}
            />
          </div>
        )}

      <main style={{ flex: 1 }}>{children}</main>
      
      <div className="d-none d-lg-block">
        <Footer />
      </div>

      {}
      {!shouldHideNav && <MobileBottomNav />}

      <div className={`he-theme-control-group ${isThemeDrawerOpen ? 'open' : ''}`}>
        <button 
          className="he-theme-arrow-trigger"
          onClick={() => setIsThemeDrawerOpen(!isThemeDrawerOpen)}
        >
          <i className={`fas fa-chevron-${isThemeDrawerOpen ? 'right' : 'left'}`}></i>
        </button>
        <button
          className="he-theme-fab"
          onClick={toggleTheme}
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>
      </div>
    </div>
  );
};


const AuthLayout = () => {
  useEffect(() => {
    document.body.classList.add("auth-layout");
    return () => {
      document.body.classList.remove("auth-layout");
    };
  }, []);

  return (
    <main>
      <Outlet />
    </main>
  );
};


const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

 
  let isAllowed = false;

 
  if (user.role === "developer") {
    isAllowed = true;
  }
 
  else if (user.role === "admin") {
    if (requiredRole === "admin") isAllowed = true;
  }
 
  else if (user.role === "mitra") {
    if (requiredRole === "mitra") isAllowed = true;
  }
 
  else {
    if (requiredRole === "customer") isAllowed = true;
  }

 
 
  if (requiredRole === "developer" && user.role !== "developer") {
    isAllowed = false;
  }

  if (!isAllowed) {
   
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

function AppContent() {
  const [theme, setTheme] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true);
  const navigate = useNavigate();

 
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("elevateTheme");
    return saved === "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isLightMode ? "light" : "dark"
    );
    localStorage.setItem("elevateTheme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

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
        } else {
          console.error("Gagal memuat tema, menggunakan fallback.");
          applyTheme({});
        }
      } catch (error) {
        console.error("Gagal mengambil konfigurasi tema:", error);
        applyTheme({});
      }
    };
    fetchThemeConfig();
  }, []);

  useEffect(() => {
   
   
    const socketUrl = import.meta.env.PROD
      ? "https://stridebase-server-wqdw.onrender.com"
      : "http://localhost:5000";

    if (user && user.id) {
      socket = io(socketUrl, { query: { userId: user.id } });
      socket.on("connect", () => {
        console.log(`✅ Terhubung ke Socket.IO: ${socket.id}`);
      });
      socket.on("new_notification", (notification) => {
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
        {}

        {}
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute requiredRole="developer">
              <DeveloperLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={renderWithProps(DeveloperDashboardPage)}
          />
        </Route>

        <Route path="/demo" element={<DemoPage />} />

        {}
        <Route
          path="/partner/*"
          element={
            <ProtectedRoute requiredRole="mitra">
              <PartnerLayout theme={theme} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<PartnerDashboardPage />} />
          <Route
            path="services"
            element={renderWithProps(PartnerServicesPage)}
          />
          <Route path="orders" element={renderWithProps(PartnerOrdersPage)} />
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
          <Route path="wallet" element={renderWithProps(PartnerWalletPage)} />
          <Route path="reports" element={renderWithProps(PartnerReportsPage)} />
        </Route>

        {}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={renderWithProps(AdminDashboardPage)}
          />
          <Route path="bookings" element={renderWithProps(AdminBookingsPage)} />
          <Route path="reviews" element={renderWithProps(AdminReviewsPage)} />
          <Route path="reports" element={renderWithProps(AdminReportsPage)} />
          <Route path="stores" element={renderWithProps(AdminStoresPage)} />
          <Route
            path="stores/new"
            element={renderWithProps(AdminNewStorePage)}
          />
          <Route
            path="stores/:storeId/settings"
            element={renderWithProps(AdminStoreSettingsPage)}
          />
          <Route
            path="stores/:storeId/invoices"
            element={renderWithProps(AdminStoreInvoicesPage)}
          />
          <Route path="payouts" element={renderWithProps(AdminPayoutsPage)} />
          <Route path="users" element={renderWithProps(AdminUsersPage)} />
          <Route path="promos" element={renderWithProps(AdminPromosPage)} />
          <Route path="banners" element={renderWithProps(AdminBannersPage)} />
          <Route path="settings" element={renderWithProps(AdminSettingsPage)} />
          <Route
            path="invoice/print/:invoiceId"
            element={<InvoicePrintPage />}
          />
          <Route path="invoice/print/preview" element={<InvoicePrintPage />} />
        </Route>

        {}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={<LoginPage showMessage={showMessage} theme={theme} />}
          />
          <Route
            path="/register"
            element={<RegisterPage theme={theme} showMessage={showMessage} />}
          />
          <Route path="/login-success" element={<LoginSuccessPage />} />
          <Route
            path="/forgot-password"
            element={renderWithProps(ForgotPasswordPage, { theme })}
          />
          <Route
            path="/reset-password"
            element={renderWithProps(ResetPasswordPage)}
          />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
        </Route>

        {}
        <Route
          path="/*"
          element={
            <UserLayout
              theme={theme}
              notifications={notifications}
              unreadCount={unreadCount}
              setNotifications={setNotifications}
              setUnreadCount={setUnreadCount}
              isAnnouncementVisible={isAnnouncementVisible}
              setAnnouncementVisible={setAnnouncementVisible}
              isLightMode={isLightMode}
              toggleTheme={toggleTheme}
            >
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
               homePageTheme={theme?.homePageTheme || "elevate"}
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
                <StorePage showMessage={showMessage} />
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
            path="dashboard"
            element={<DashboardPage showMessage={showMessage} />}
          />
          <Route path="track/:bookingId" element={<TrackOrderPage />} />
          <Route
            path="payment-simulation/:bookingId"
            element={renderWithProps(PaymentSimulationPage)}
          />
          <Route
            path="payment-confirm-mobile/:bookingId"
            element={renderWithProps(PaymentConfirmMobilePage)}
          />
          <Route
            path="payment-success/:bookingId"
            element={renderWithProps(PaymentSuccessPage)}
          />
          <Route path="payment-finish" element={<PaymentFinishPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

const App = () => {
  return (
    <Router>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </Router>
  );
};

export default App;
