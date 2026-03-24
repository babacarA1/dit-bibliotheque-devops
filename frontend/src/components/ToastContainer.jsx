import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" id="toasts">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="var(--success)" /> : <XCircle size={18} color="var(--danger)" />}
          <span>{toast.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
