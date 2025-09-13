// File: client/src/pages/AdminReviewsPage.jsx (Versi Lengkap & Fungsional)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllReviewsForAdmin,
  deleteReviewByAdmin,
} from "../services/apiService";

const StarRating = ({ rating }) => (
  <div className="d-flex">
    {[...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < rating ? "text-warning" : "text-light"
        }`}
      ></i>
    ))}
  </div>
);

const AdminReviewsPage = ({ showMessage }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReviewsForAdmin();
      setReviews(data);
    } catch (err) {
      setError(err.message);
      if (showMessage) showMessage(err.message, "Error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus ulasan ini secara permanen? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;
    try {
      const result = await deleteReviewByAdmin(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (showMessage)
        showMessage(result.message || "Ulasan berhasil dihapus.");
    } catch (err) {
      if (showMessage) showMessage(err.message, "Error");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (review.user?.name || "").toLowerCase().includes(searchLower) ||
        (review.store?.name || "").toLowerCase().includes(searchLower) ||
        (review.comment || "").toLowerCase().includes(searchLower);

      const matchesRating =
        filterRating === "all" || review.rating === parseInt(filterRating);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, filterRating]);

  if (loading) return <div className="p-4">Memuat semua data ulasan...</div>;
  if (error && reviews.length === 0)
    return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="fs-2 mb-4">Manajemen Ulasan</h2>

      <div className="card card-account p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Cari ulasan berdasarkan pelanggan, toko, atau komentar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">Semua Rating</option>
              <option value="5">Bintang 5</option>
              <option value="4">Bintang 4</option>
              <option value="3">Bintang 3</option>
              <option value="2">Bintang 2</option>
              <option value="1">Bintang 1</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card p-3 shadow-sm">
        {/* Tampilan Desktop */}
        <div className="table-responsive d-none d-lg-block">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Pelanggan</th>
                <th>Toko</th>
                <th>Rating</th>
                <th style={{ minWidth: "300px" }}>Komentar</th>
                <th>Tanggal</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.user?.name || "N/A"}</td>
                  <td>{review.store?.name || "N/A"}</td>
                  <td>
                    <StarRating rating={review.rating} />
                  </td>
                  <td>{review.comment || "-"}</td>
                  <td>
                    {new Date(review.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Hapus Ulasan"
                      onClick={() => handleDelete(review.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tampilan Mobile */}
        <div className="mobile-card-list d-lg-none">
          {filteredReviews.map((review) => (
            <div className="mobile-card" key={review.id}>
              <div className="mobile-card-header">
                <span className="fw-bold">{review.user?.name || "N/A"}</span>
                <StarRating rating={review.rating} />
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <small>Toko</small>
                  <span>{review.store?.name || "N/A"}</span>
                </div>
                <p className="mt-2 mb-0 fst-italic">
                  "{review.comment || "-"}"
                </p>
              </div>
              <div className="mobile-card-footer d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString("id-ID")}
                </small>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(review.id)}
                >
                  <i className="fas fa-trash-alt me-1"></i> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && !loading && (
          <div className="text-center p-4 text-muted">
            Tidak ada ulasan yang cocok dengan kriteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
