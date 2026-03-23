import React from 'react';

function Topbar({ title, currentPage }) {
  // Topbar actions are currently rendered from within the routes themselves in the old design,
  // but in React it's easier to keep topbar static or pass a portal/children if needed.
  // Actually, the HTML app directly overwrote `document.getElementById('topbar-actions').innerHTML`.
  // Here we'll just put a specific id so the child pages can portal into it,
  // or pass a global state for Topbar actions.
  // Using an id for now to allow React portals for simplicity.

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions" id="topbar-actions">
        {/* Child pages will render portals to this div if they need to add actions */}
      </div>
    </div>
  );
}

export default Topbar;
