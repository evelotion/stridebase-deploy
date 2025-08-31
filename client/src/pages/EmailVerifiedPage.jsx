// File: stridebase-app-render/client/src/pages/EmailVerifiedPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const EmailVerifiedPage = () => {
    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className="fas fa-check-circle text-success"></i>
                </div>
                <h2 className="success-title">Email Berhasil Diverifikasi!</h2>
                <p className="success-details mb-4">
                    Terima kasih telah memverifikasi alamat email Anda. Sekarang Anda dapat login ke akun Anda.
                </p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                    <Link to="/login" className="btn btn-dark btn-rounded">
                        Lanjut ke Halaman Login
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default EmailVerifiedPage;