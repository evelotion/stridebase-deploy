// File: client/src/pages/NotificationsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import "./HomePageElevate.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications || []);
          // Otomatis tandai terbaca (opsional, bisa dipindah ke on click)
          markAllAsRead(token);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const markAllAsRead = async (token) => {
    try {
      await fetch(`${API_BASE_URL}/api/users/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- Helper: Group By Date ---
  const groupedNotifications = notifications.reduce((groups, notif) => {
    const date = new Date(notif.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    });

    if (date.toDateString() === today.toDateString()) key = "Hari Ini";
    else if (date.toDateString() === yesterday.toDateString()) key = "Kemarin";

    if (!groups[key]) groups[key] = [];
    groups[key].push(notif);
    return groups;
  }, {});

  // --- Helper: Icon & Color Type ---
  const getIconInfo = (message) => {
    const msg = message.toLowerCase();
    if (
      msg.includes("berhasil") ||
      msg.includes("sukses") ||
      msg.includes("confirmed")
    )
      return {
        icon: "fa-check-circle",
        color: "text-success",
        bg: "bg-success",
      };
    if (
      msg.includes("gagal") ||
      msg.includes("batal") ||
      msg.includes("cancelled")
    )
      return { icon: "fa-times-circle", color: "text-danger", bg: "bg-danger" };
    if (msg.includes("promo") || msg.includes("diskon"))
      return { icon: "fa-ticket-alt", color: "text-warning", bg: "bg-warning" };
    if (msg.includes("jalan") || msg.includes("proses"))
      return {
        icon: "fa-shipping-fast",
        color: "text-primary",
        bg: "bg-primary",
      };

    return { icon: "fa-bell", color: "text-info", bg: "bg-info" };
  };

  if (loading)
    return (
      <div
        className="home-elevate-wrapper d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* --- DESKTOP VIEW --- */
  const renderDesktop = () => (
    <div
      className="home-elevate-wrapper d-none d-lg-block"
      style={{ minHeight: "100vh", paddingTop: "120px" }}
    >
      <div className="container">
        <Fade direction="up" triggerOnce>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="he-section-title mb-0">Notifikasi</h2>
                <button className="btn btn-sm btn-outline-light rounded-pill">
                  Tandai Semua Dibaca
                </button>
              </div>

              <div
                className="p-4 rounded-4"
                style={{
                  background: "var(--sb-card-bg)",
                  border: "1px solid var(--sb-card-border)",
                }}
              >
                {Object.keys(groupedNotifications).length > 0 ? (
                  Object.entries(groupedNotifications).map(([date, items]) => (
                    <div key={date} className="mb-4">
                      <h6 className="text-muted text-uppercase tracking-widest mb-3 small fw-bold">
                        {date}
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        {items.map((notif) => {
                          const { icon, color, bg } = getIconInfo(
                            notif.message
                          );
                          return (
                            <div
                              key={notif.id}
                              className="d-flex align-items-start gap-3 p-3 rounded-3"
                              style={{ background: "var(--sb-bg-secondary)" }}
                            >
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center ${bg} bg-opacity-10 ${color}`}
                                style={{ width: 45, height: 45, flexShrink: 0 }}
                              >
                                <i className={`fas ${icon}`}></i>
                              </div>
                              <div className="flex-grow-1">
                                <p
                                  className="mb-1 fw-medium"
                                  style={{ color: "var(--sb-text-main)" }}
                                >
                                  {notif.message}
                                </p>
                                <small className="text-muted">
                                  {new Date(notif.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </small>
                              </div>
                              {!notif.isRead && (
                                <div
                                  className="rounded-circle bg-primary"
                                  style={{ width: 8, height: 8, marginTop: 8 }}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted">
                    Belum ada notifikasi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );

  /* --- MOBILE VIEW (ACTIVITY FEED) --- */
  const renderMobile = () => (
    <div className="he-mobile-notif-wrapper d-lg-none">
      <div className="he-mobile-header-sticky">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-decoration-none p-0"
            style={{ color: "var(--sb-text-main)" }}
          >
            <i className="fas fa-arrow-left fs-5"></i>
          </button>
          <h5
            className="mb-0 fw-bold flex-grow-1"
            style={{ color: "var(--sb-text-main)" }}
          >
            Aktivitas
          </h5>
          <div style={{ width: "24px" }}></div>
        </div>
      </div>

      <div className="container pt-3 pb-5">
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="mb-4">
              <h6 className="he-notif-group-title">{date}</h6>
              <div className="d-flex flex-column gap-3">
                {items.map((notif) => {
                  const { icon, color, bg } = getIconInfo(notif.message);
                  return (
                    <div key={notif.id} className="he-notif-item">
                      <div
                        className={`he-notif-icon ${bg} bg-opacity-10 ${color}`}
                      >
                        <i className={`fas ${icon}`}></i>
                      </div>
                      <div className="he-notif-content">
                        <p
                          className="mb-1"
                          style={{
                            color: "var(--sb-text-main)",
                            fontSize: "0.9rem",
                            lineHeight: "1.4",
                          }}
                        >
                          {notif.message}
                        </p>
                        <small className="he-notif-time">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                      {!notif.isRead && (
                        <div className="he-notif-unread-dot"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 mt-5">
            <div className="he-notif-empty-icon mb-3">
              <i className="far fa-bell-slash"></i>
            </div>
            <h5 className="fw-bold" style={{ color: "var(--sb-text-main)" }}>
              Belum ada notifikasi
            </h5>
            <p className="text-muted small px-4">
              Kami akan memberi tahu Anda jika ada pembaruan status pesanan atau
              promo menarik.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
};

export default NotificationsPage;
