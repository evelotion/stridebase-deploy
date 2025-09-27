// File: client/src/pages/PaymentConfirmMobilePage.jsx (FILE BARU)

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const PaymentConfirmMobilePage = ({ showMessage }) => {
    const { bookingId } = useParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSimulatePayment = async () => {
        setIsProcessing(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/payments/confirm-simulation/${bookingId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengonfirmasi pembayaran.');
            }
            
            setIsSuccess(true);

        } catch (err) {
            setError(err.message);
            if (showMessage) {
                showMessage(err.message, "Error");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="container success-container d-flex align-items-center justify-content-center">
                <div className="success-box text-center">
                    <div className="success-icon-wrapper">
                        <i className="fas fa-check-circle text-success"></i>
                    </div>
                    <h2 className="success-title">Simulasi Pembayaran Berhasil!</h2>
                    <p className="success-details mb-4">
                        Anda bisa menutup halaman ini. Status pembayaran di perangkat utama Anda akan ter-update secara otomatis.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className="fas fa-mobile-alt text-primary"></i>
                </div>
                <h2 className="success-title">Konfirmasi Simulasi</h2>
                <p className="success-details mb-4">
                    Tekan tombol di bawah untuk menyelesaikan simulasi pembayaran pesanan: <br/><strong>#{bookingId.substring(0, 8)}</strong>
                </p>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex justify-content-center gap-2 mt-4">
                    <button onClick={handleSimulatePayment} className="btn btn-success btn-lg" disabled={isProcessing}>
                        {isProcessing ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-credit-card me-2"></i>Bayar Sekarang (Simulasi)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default PaymentConfirmMobilePage;