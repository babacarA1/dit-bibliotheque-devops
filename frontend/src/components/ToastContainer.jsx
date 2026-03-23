import React from 'react';

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" id="toasts">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span> {toast.msg}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
