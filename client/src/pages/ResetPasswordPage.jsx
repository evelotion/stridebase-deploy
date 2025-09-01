import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const ResetPasswordPage = ({ showMessage }) => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }
        if (!token) {
            setError('Token reset tidak ditemukan. Silakan coba lagi dari awal.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showMessage('Password berhasil direset! Silakan login dengan password baru Anda.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Gagal mereset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Mengganti row g-0 vh-100 dengan flexbox CSS kustom */}
            <div className="auth-form-container text-center">
                <h3 className="fw-bold mb-4">Atur Password Baru</h3>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Password Baru"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password Baru</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            placeholder="Konfirmasi Password Baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                    </div>

                    <div className="d-grid my-4">
                        <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;