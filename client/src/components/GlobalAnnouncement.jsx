

import React from 'react';

const GlobalAnnouncement = ({ message, isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }

 
 
  const displayText = typeof message === 'object' && message !== null 
    ? message.message 
    : message;

 
  if (!displayText) return null;

  return (
    <div className="global-announcement-bar">
      <div className="container d-flex justify-content-center align-items-center">
        <p className="mb-0 me-3">{displayText}</p>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};

export default GlobalAnnouncement;