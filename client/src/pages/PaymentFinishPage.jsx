import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentFinishPage = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    const statusDetails = {
        success: {
            icon: 'fa-check-circle text-success',
            title: 'Pembayaran Berhasil!',
            message: 'Terima kasih! Pembayaran Anda telah kami konfirmasi. Pesanan Anda sedang diproses.'
        },
        pending: {
            icon: 'fa-clock text-warning',
            title: 'Menunggu Pembayaran',
            message: 'Pesanan Anda telah dibuat. Silakan selesaikan pembayaran Anda.'
        },
        error: {
            icon: 'fa-times-circle text-danger',
            title: 'Pembayaran Gagal',
            message: 'Maaf, terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.'
        }
    };

    const currentStatus = statusDetails[status] || statusDetails['error'];

    return (
        <main className="container success-container d-flex align-items-center justify-content-center">
            <div className="success-box text-center">
                <div className="success-icon-wrapper">
                    <i className={`fas ${currentStatus.icon}`}></i>
                </div>
                <h2 className="success-title">{currentStatus.title}</h2>
                <p className="success-details mb-4">
                    {currentStatus.message}
                </p>

                {orderId && (
                     <p className="text-muted small">ID Pesanan Anda: {orderId}</p>
                )}

                <div className="d-flex justify-content-center gap-2 mt-4">
                    <Link to="/dashboard" className="btn btn-dark btn-rounded">
                        Lihat Dashboard
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary btn-rounded">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default PaymentFinishPage;