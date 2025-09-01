import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const ForgotPasswordPage = ({ showMessage, theme }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setMessage(data.message);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Mengganti row g-0 vh-100 dengan flexbox CSS kustom */}
            <div className="auth-form-container text-center">
                <h3 className="fw-bold mb-2">Lupa Password?</h3>
                <p className="text-muted mb-4">Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.</p>
                
                <form onSubmit={handleSubmit}>
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Alamat Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="email">Alamat Email</label>
                    </div>

                    <div className="d-grid mb-3">
                        <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                            {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
                        </button>
                    </div>
                    <p className="text-muted">
                        <Link to="/login" style={{ textDecoration: 'none' }}>Kembali ke Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;