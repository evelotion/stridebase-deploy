// client/src/components/GlobalAnnouncement.jsx

import React, { useState } from 'react';

const GlobalAnnouncement = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

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
          onClick={() => setIsVisible(false)}
        ></button>
      </div>
    </div>
  );
};

export default GlobalAnnouncement;