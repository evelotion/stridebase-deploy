// client/src/components/GlobalAnnouncement.jsx

import React from 'react';

// Terima props baru: isVisible dan onClose
const GlobalAnnouncement = ({ message, isVisible, onClose }) => {
  // Hapus state internal 'isVisible'

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div className="global-announcement-bar">
      <div className="container d-flex justify-content-center align-items-center">
        <p className="mb-0 me-3">{message}</p>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={onClose} // Gunakan fungsi onClose dari props
        ></button>
      </div>
    </div>
  );
};

export default GlobalAnnouncement;