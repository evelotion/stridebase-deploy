// File: client/src/pages/AdminReviewsPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Fade } from "react-awesome-reveal";
import {
  getAllReviewsForAdmin,
  deleteReviewByAdmin,
} from "../services/apiService";
import "../styles/ElevateDashboard.css";

// --- COMPONENT: PAGINATION ---
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(pageCount, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-between align-items-center pt-3">
      <span style={{ fontSize: "0.8rem", color: "var(--pe-text-muted)" }}>
        Halaman {currentPage} dari {pageCount}
      </span>
      <div className="d-flex gap-1">
        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="d-flex gap-1">
          {pages.map((num) => (
            <button
              key={num}
              className={`pe-btn-action py-1 px-2 ${
                currentPage === num ? "active" : ""
              }`}
              onClick={() => onPageChange(num)}
              style={
                currentPage === num
                  ? {
                      background: "var(--pe-accent)",
                      borderColor: "var(--pe-accent)",
                      color: "#fff",
                      fontSize: "0.8rem",
                    }
                  : { opacity: 0.7, fontSize: "0.8rem" }
              }
            >
              {num}
            </button>
          ))}
        </div>

        <button
          className="pe-btn-action py-1 px-2"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          style={{ fontSize: "0.8rem" }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

const AdminReviewsPage = ({ showMessage }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State untuk Mobile Sheet
  const [selectedReview, setSelectedReview] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReviewsForAdmin();
      // Sort by newest
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReviews(sorted);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Hapus ulasan ini secara permanen?")) return;
    try {
      await deleteReviewByAdmin(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (showMessage) showMessage("Ulasan berhasil dihapus.", "Success");
      setIsSheetOpen(false);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  // Helper Stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? "text-warning" : "text-secondary opacity-25"
        }`}
        style={{ fontSize: "0.75rem" }}
      ></i>
    ));
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        (r.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.storeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (filterRating === "positive") matchesFilter = r.rating >= 4;
      if (filterRating === "negative") matchesFilter = r.rating <= 3;

      return matchesSearch && matchesFilter;
    });
  }, [reviews, searchTerm, filterRating]);

  // --- LOGIC PAGINATION ---
  const pageCount = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
    }
  };

  // Mobile Sheet Handlers
  const openSheet = (review) => {
    setSelectedReview(review);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedReview(null), 300);
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: "var(--pe-bg)" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );

  /* =========================================
     RENDER: MOBILE VIEW (SOCIAL FEED STYLE)
     ========================================= */
  const renderMobileView = () => (
    <div className="d-lg-none pb-5">
      {/* 1. STICKY HEADER */}
      <div
        className="sticky-top px-3 py-3"
        style={{
          background: "var(--pe-bg)",
          zIndex: 1020,
          borderBottom: "1px solid var(--pe-card-border)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="pe-title mb-0 fs-4">Ulasan User</h2>
          <div className="pe-badge pe-badge-info">{reviews.length} Total</div>
        </div>

        <div className="position-relative">
          <i
            className="fas fa-search position-absolute"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--pe-text-muted)",
            }}
          ></i>
          <input
            type="text"
            className="form-control rounded-pill ps-5 border-0"
            style={{
              background: "var(--pe-card-bg)",
              color: "var(--pe-text-main)",
              fontSize: "0.9rem",
            }}
            placeholder="Cari ulasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="d-flex gap-2 mt-3">
          {[
            { id: "all", label: "Semua" },
            { id: "positive", label: "Positif (4-5★)" },
            { id: "negative", label: "Negatif (1-3★)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRating(f.id)}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                filterRating === f.id ? "fw-bold" : ""
              }`}
              style={{
                background:
                  filterRating === f.id
                    ? "var(--pe-accent)"
                    : "var(--pe-card-bg)",
                color: filterRating === f.id ? "#fff" : "var(--pe-text-muted)",
                fontSize: "0.75rem",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. REVIEW FEED */}
      <div className="px-3 py-2">
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div
              className="pe-card mb-3 p-3"
              key={review.id}
              onClick={() => openSheet(review)}
            >
              {/* User Header */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white small"
                    style={{
                      width: 32,
                      height: 32,
                      background: "var(--pe-accent-admin)",
                    }}
                  >
                    {review.userName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h6
                      className="mb-0 fw-bold fs-6"
                      style={{ color: "var(--pe-text-main)" }}
                    >
                      {review.userName}
                    </h6>
                    <small
                      className="d-block"
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--pe-text-muted)",
                      }}
                    >
                      {new Date(review.createdAt).toLocaleDateString("id-ID")}
                    </small>
                  </div>
                </div>
                <div className="text-end">
                  <div className="mb-1">{renderStars(review.rating)}</div>
                </div>
              </div>

              {/* Comment Body */}
              <p
                className="mb-3 mt-2"
                style={{
                  fontSize: "0.9rem",
                  color: "var(--pe-text-main)",
                  lineHeight: "1.5",
                }}
              >
                "{review.comment}"
              </p>

              {/* Store & Reply Context */}
              <div
                className="p-2 rounded-3 border border-secondary border-opacity-10"
                style={{ background: "rgba(128,128,128,0.05)" }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="fas fa-store text-muted small"></i>
                  <small className="text-muted fw-bold">
                    {review.storeName}
                  </small>
                </div>
                {review.partnerReply ? (
                  <div className="d-flex gap-2 mt-2 pt-2 border-top border-secondary border-opacity-10">
                    <i
                      className="fas fa-reply fa-rotate-180 mt-1"
                      style={{ color: "var(--pe-accent)", fontSize: "0.8rem" }}
                    ></i>
                    <small className="text-muted fst-italic">
                      "{review.partnerReply}"
                    </small>
                  </div>
                ) : (
                  <small className="text-muted opacity-50 d-block mt-1">
                    Belum ada balasan mitra.
                  </small>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 text-muted">
            Tidak ada ulasan ditemukan.
          </div>
        )}

        {/* PAGINATION MOBILE */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 3. BOTTOM SHEET */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-black ${
          isSheetOpen ? "visible opacity-50" : "invisible opacity-0"
        }`}
        style={{ zIndex: 2000, transition: "opacity 0.3s" }}
        onClick={closeSheet}
      ></div>

      <div
        className="position-fixed bottom-0 start-0 w-100 pe-card rounded-top-4 p-4"
        style={{
          zIndex: 2010,
          transform: isSheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          maxHeight: "80vh",
          overflowY: "auto",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <div className="d-flex justify-content-center mb-4">
          <div
            style={{
              width: "40px",
              height: "4px",
              background: "var(--pe-card-border)",
              borderRadius: "2px",
            }}
          ></div>
        </div>

        {selectedReview && (
          <>
            <div className="text-center mb-4">
              <h5
                className="fw-bold mb-1"
                style={{ color: "var(--pe-text-main)" }}
              >
                Kelola Ulasan
              </h5>
              <p className="text-muted small">ID: {selectedReview.id}</p>
            </div>

            <button
              className="btn btn-danger w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleDelete(selectedReview.id)}
            >
              <i className="fas fa-trash-alt"></i> Hapus Ulasan Ini
            </button>

            <button
              className="btn w-100 mt-3 py-2 rounded-3"
              style={{
                background: "var(--pe-card-bg)",
                border: "1px solid var(--pe-card-border)",
                color: "var(--pe-text-main)",
              }}
              onClick={closeSheet}
            >
              Batal
            </button>
          </>
        )}
      </div>

      <div style={{ height: "80px" }}></div>
    </div>
  );

  /* =========================================
     RENDER: DESKTOP VIEW (CLASSIC TABLE)
     ========================================= */
  const renderDesktopView = () => (
    <div className="d-none d-lg-block position-relative z-2">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <Fade direction="down" triggerOnce>
          <div>
            <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
              Feedback
            </h6>
            <h2 className="pe-title mb-0">Ulasan & Rating</h2>
          </div>
        </Fade>
      </div>

      <Fade triggerOnce>
        <div className="pe-card mb-4">
          <div className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control bg-transparent border-secondary"
                style={{ color: "var(--pe-text-main)" }}
                placeholder="Cari user, toko, atau isi ulasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select bg-transparent border-secondary"
                style={{
                  color: "var(--pe-text-main)",
                  backgroundColor: "var(--pe-card-bg)",
                }}
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option
                  value="all"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Semua Rating
                </option>
                <option
                  value="positive"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Positif (4-5)
                </option>
                <option
                  value="negative"
                  style={{
                    backgroundColor: "var(--pe-card-bg)",
                    color: "var(--pe-text-main)",
                  }}
                >
                  Negatif (1-3)
                </option>
              </select>
            </div>
          </div>
        </div>
      </Fade>

      <Fade delay={100} triggerOnce>
        <div className="pe-card">
          <div className="pe-table-wrapper">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>User</th>
                  <th>Toko</th>
                  <th>Rating</th>
                  <th style={{ width: "35%" }}>Komentar</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentReviews.length > 0 ? (
                  currentReviews.map((r) => (
                    <tr key={r.id} className="pe-table-row-hover">
                      {/* FIX: Gunakan inline style dengan var tema agar kontras */}
                      <td
                        className="small"
                        style={{ color: "var(--pe-text-muted)" }}
                      >
                        {new Date(r.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td
                        style={{
                          color: "var(--pe-text-main)",
                          fontWeight: "bold",
                        }}
                      >
                        {r.userName}
                      </td>
                      <td style={{ color: "var(--pe-text-main)" }}>
                        {r.storeName}
                      </td>
                      <td>
                        <div className="text-warning small">
                          {renderStars(r.rating)}
                        </div>
                      </td>
                      <td>
                        <div
                          className="small"
                          style={{ color: "var(--pe-text-muted)" }}
                        >
                          "{r.comment}"
                        </div>
                        {r.partnerReply && (
                          <div className="mt-1 ps-2 border-start border-primary text-info x-small">
                            Balasan: {r.partnerReply}
                          </div>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          className="pe-btn-action text-danger p-2"
                          onClick={() => handleDelete(r.id)}
                          title="Hapus Ulasan"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5"
                      style={{ color: "var(--pe-text-muted)" }}
                    >
                      Tidak ada ulasan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION DESKTOP */}
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
        />
      </Fade>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 position-relative z-1">
      <div className="pe-blob pe-blob-1 pe-blob-dev"></div>
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default AdminReviewsPage;
