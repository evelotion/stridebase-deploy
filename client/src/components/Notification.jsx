// File: stridebase-app-current/client/src/components/Notification.jsx

import React, { useEffect } from 'react';
import './Notification.css'; // Kita akan buat file CSS ini nanti

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    // Sembunyikan notifikasi setelah 3 detik
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!notification) {
    return null;
  }

  return (
    <div className={`notification-toast ${notification ? 'show' : ''}`}>
      <div className="notification-icon">
        <div className="svg-container">
          <svg className="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="circle" fill="#5bb543" cx="24" cy="24" r="22"/>
            <path className="tick" fill="none" stroke="#FFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M14 27l5.917 4.917L34 17"/>
          </svg>
        </div>
      </div>
      <div className="notification-content">
        <p className="notification-title">{notification.title}</p>
        <p className="notification-message">{notification.message}</p>
      </div>
    </div>
  );
};

export default Notification;