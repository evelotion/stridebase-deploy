import React, { useState, useEffect } from "react";

const StarRating = ({ rating }) => {
  const totalStars = 5;
  return (
    <div>
      {[...Array(totalStars)].map((_, index) => (
        <i
          key={index}
          className={`fas fa-star ${
            index < rating ? "text-warning" : "text-light"
          }`}
        ></i>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onReplyClick }) => (
  <div className="card mb-3 shadow-sm">
    <div className="card-body">
      <div className="d-flex justify-content-between">
        <h6 className="card-title fw-bold">{review.userName}</h6>
        <StarRating rating={review.rating} />
      </div>
      <p className="card-text">{review.comment || "Tidak ada komentar."}</p>
      <p className="card-text text-muted small">
        {new Date(review.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      {review.partnerReply ? (
        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="fw-bold small">Balasan Anda:</h6>
          <p className="mb-0 fst-italic">"{review.partnerReply}"</p>
        </div>
      ) : (
        <button
          className="btn btn-sm btn-outline-primary mt-2"
          onClick={() => onReplyClick(review)}
        >
          <i className="fas fa-reply me-1"></i> Balas Ulasan
        </button>
      )}
    </div>
  </div>
);

const PartnerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch("/api/partner/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data ulasan.");
      }
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenReplyModal = (review) => {
    setCurrentReview(review);
    setShowReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setCurrentReview(null);
    setShowReplyModal(false);
    setReplyText("");
    setIsSaving(false);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText || !currentReview) return;
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/partner/reviews/${currentReview.id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply: replyText }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal mengirim balasan.");

      showMessage("Balasan berhasil dikirim!");
      handleCloseReplyModal();
      fetchReviews();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-4">Memuat ulasan pelanggan...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <>
      <div className="container-fluid px-4">
        <h2 className="fs-2 m-4">Ulasan Pelanggan</h2>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReplyClick={handleOpenReplyModal}
            />
          ))
        ) : (
          <div className="text-center p-5 card">
            <p className="text-muted">Belum ada ulasan untuk toko Anda.</p>
          </div>
        )}
      </div>

      {showReplyModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Balas Ulasan dari {currentReview?.userName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseReplyModal}
                  ></button>
                </div>
                <form onSubmit={handleReplySubmit}>
                  <div className="modal-body">
                    <div className="mb-3 p-3 bg-light rounded border">
                      <p className="fst-italic mb-0">
                        "{currentReview?.comment || "Tidak ada komentar."}"
                      </p>
                    </div>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Tulis balasan Anda di sini..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseReplyModal}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? "Mengirim..." : "Kirim Balasan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default PartnerReviewsPage;
