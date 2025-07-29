import React from 'react';

const MessageBox = ({ title, message, onOk, show }) => {
  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title || 'Pemberitahuan'}</h5>
              <button type="button" className="btn-close" onClick={onOk}></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={onOk}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default MessageBox;