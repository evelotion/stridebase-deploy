// File: client/src/pages/PartnerReviewsPage.jsx

import React, { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import API_BASE_URL from "../apiConfig";
import "./PartnerElevate.css"; // CSS Elevate

// --- COMPONENTS ---
const StarDisplay = ({ rating }) => (
  <div className="d-flex gap-1 text-warning x-small">
    {[...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? "" : "opacity-25 text-secondary"
        }`}
      ></i>
    ))}
  </div>
);

const ReplyGlassModal = ({
  show,
  handleClose,
  handleSubmit,
  review,
  replyText,
  setReplyText,
  isSaving,
}) => {
  if (!show || !review) return null;
  return (
    <div
      className="pe-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fade direction="up" duration={300} triggerOnce>
        <div
          className="pe-card p-0"
          style={{ width: "500px", maxWidth: "95%" }}
        >
          <div className="p-4 border-bottom border-secondary">
            <h5 className="pe-title mb-0">Reply to {review.userName}</h5>
          </div>
          <div className="p-4">
            <div
              className="mb-4 p-3 rounded-3 fst-italic text-white-50 small"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderLeft: "3px solid var(--pe-accent)",
              }}
            >
              "{review.comment}"
            </div>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows="4"
              placeholder="Write your response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
          </div>
          <div className="p-4 border-top border-secondary d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-light border-0"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="pe-btn-action bg-primary border-0"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>
      </Fade>
    </div>
  );
};

const PartnerReviewsPage = ({ showMessage }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch reviews.");
      setReviews(data);
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenReply = (review) => {
    setCurrentReview(review);
    setShowReplyModal(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/partner/reviews/${currentReview.id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply: replyText }),
        }
      );
      if (!response.ok) throw new Error("Failed to send reply.");

      if (showMessage) showMessage("Reply sent successfully!", "Success");
      setShowReplyModal(false);
      setReplyText("");
      fetchReviews();
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="pe-dashboard-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  // Hitung statistik sederhana
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-2"></div>

      <div className="container-fluid px-4 py-4 position-relative z-1">
        {/* Header & Stats */}
        <div className="row align-items-end mb-5 g-4">
          <div className="col-md-8">
            <Fade direction="down" triggerOnce>
              <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
                Customer Feedback
              </h6>
              <h2 className="pe-title display-6 mb-0">Reviews & Ratings</h2>
            </Fade>
          </div>
          <div className="col-md-4">
            <Fade direction="left" triggerOnce>
              <div className="pe-card py-3 px-4 d-flex align-items-center justify-content-between bg-opacity-50">
                <div>
                  <div className="pe-subtitle small">Average Rating</div>
                  <div className="d-flex align-items-baseline gap-2">
                    <h2 className="pe-title mb-0 text-warning">{avgRating}</h2>
                    <span className="text-muted small">/ 5.0</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="pe-subtitle small">Total Reviews</div>
                  <h3 className="pe-title mb-0">{reviews.length}</h3>
                </div>
              </div>
            </Fade>
          </div>
        </div>

        {/* Review Grid */}
        <div className="row g-4">
          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div className="col-lg-6" key={review.id}>
                <Fade delay={i * 50} triggerOnce>
                  <div className="pe-card h-100 d-flex flex-column">
                    {/* User Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-gradient d-flex align-items-center justify-content-center fw-bold text-white"
                          style={{
                            width: "40px",
                            height: "40px",
                            background:
                              "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                          }}
                        >
                          {review.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h6 className="pe-title mb-0 fs-6">
                            {review.userName}
                          </h6>
                          <div className="text-muted x-small">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>

                    {/* Comment */}
                    <div className="pe-subtitle flex-grow-1 mb-3 fst-italic">
                      "{review.comment || "No written comment."}"
                    </div>

                    {/* Reply Section */}
                    {review.partnerReply ? (
                      <div
                        className="p-3 rounded-3 mt-auto border border-secondary"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-1 text-primary small fw-bold">
                          <i
                            className="fas fa-share"
                            style={{ transform: "scaleY(-1)" }}
                          ></i>{" "}
                          Your Reply
                        </div>
                        <p className="mb-0 text-white-50 small">
                          "{review.partnerReply}"
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReply(review)}
                        className="pe-btn-action mt-auto align-self-start text-primary border-primary bg-transparent hover-bg-primary hover-text-white"
                      >
                        <i className="fas fa-reply me-2"></i> Reply
                      </button>
                    )}
                  </div>
                </Fade>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <i className="far fa-comment-dots fa-3x mb-3 opacity-50"></i>
              <p>No reviews yet.</p>
            </div>
          )}
        </div>
      </div>

      <ReplyGlassModal
        show={showReplyModal}
        handleClose={() => setShowReplyModal(false)}
        handleSubmit={handleReplySubmit}
        review={currentReview}
        replyText={replyText}
        setReplyText={setReplyText}
        isSaving={isSaving}
      />
    </div>
  );
};

export default PartnerReviewsPage;
