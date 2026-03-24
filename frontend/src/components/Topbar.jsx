import React from 'react';
import { RefreshCw } from 'lucide-react';

function Topbar({ title, refreshing, onRefresh }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        {refreshing && (
          <div className="sync-indicator">
            <div className="sync-dot" />
            <span>Synchronisation...</span>
          </div>
        )}
      </div>
      <div className="topbar-actions" id="topbar-actions">
        <button
          className="btn btn-ghost btn-sm refresh-btn"
          onClick={() => onRefresh()}
          title="Actualiser les données"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
        </button>
      </div>
    </div>
  );
}

export default Topbar;
