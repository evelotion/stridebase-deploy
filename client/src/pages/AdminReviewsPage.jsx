// File: client/src/pages/AdminReviewsPage.jsx

import React, { useState, useEffect } from 'react';

const StarRating = ({ rating }) => (
  <div>
    {[...Array(5)].map((_, index) => (
      <i key={index} className={`fas fa-star ${index < rating ? 'text-warning' : 'text-secondary'}`}></i>
    ))}
  </div>
);

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
<<<<<<< HEAD
      const response = await fetch('/api/admin/reviews', {
=======
      const response = await fetch('import.meta.env.VITE_API_BASE_URL + "/api/admin/reviews', {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data ulasan.');
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      alert(error.message);
=======
      showMessage(error.message);
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ulasan ini secara permanen?")) return;

    const token = localStorage.getItem('token');
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
=======
      const response = await fetch(`import.meta.env.VITE_API_BASE_URL + "/api/admin/reviews/${reviewId}`, {
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Gagal menghapus ulasan.');
      }
<<<<<<< HEAD
      alert('Ulasan berhasil dihapus.');
=======
      showMessage('Ulasan berhasil dihapus.');
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
      // Refresh data ulasan setelah menghapus
      fetchReviews();
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      alert(error.message);
=======
      showMessage(error.message);
>>>>>>> 405187dd8cd3db9bd57ddb0aeaf8c32d9ee8bdc3
    }
  };

  if (loading) return <div className="p-4">Memuat semua data ulasan...</div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="fs-2 m-4">Manajemen Ulasan</h2>
      
      <div className="table-card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Pelanggan</th>
                <th>Toko</th>
                <th>Rating</th>
                <th>Komentar</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.user.name}</td>
                  <td>{review.store.name}</td>
                  <td><StarRating rating={review.rating} /></td>
                  <td style={{ minWidth: '250px' }}>{review.comment || '-'}</td>
                  <td>{new Date(review.date).toLocaleDateString('id-ID')}</td>
                  <td>
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
          {reviews.length === 0 && !loading && (
            <div className="text-center p-4 text-muted">Belum ada ulasan yang masuk.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;