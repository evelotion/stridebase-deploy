// File: stridebase-app/client/src/pages/NotificationsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNotifications = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('process.env.API_BASE_URL + "/api/user/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Gagal memuat notifikasi.");
                const data = await response.json();
                setNotifications(data.notifications);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllNotifications();
    }, []);

    if (loading) {
        return <div className="container py-5 text-center">Memuat notifikasi...</div>;
    }

    return (
        <div className="container py-5 mt-4">
            <h2 className="mb-4">Semua Notifikasi</h2>
            <div className="list-group">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <Link to={notif.linkUrl || '#'} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start" key={notif.id}>
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">{notif.message}</div>
                                <small className="text-muted">{new Date(notif.createdAt).toLocaleString('id-ID')}</small>
                            </div>
                            {!notif.readStatus && <span className="badge bg-primary rounded-pill">Baru</span>}
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-muted">Tidak ada notifikasi.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;