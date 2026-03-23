import React from 'react';

function ModalContainer({ children, closeModal }) {
  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      closeModal();
    }
  };

  return (
    <div id="modal-container">
      <div className="modal-overlay" id="modal-overlay" onClick={handleOverlayClick}>
        {children}
      </div>
    </div>
  );
}

export default ModalContainer;
