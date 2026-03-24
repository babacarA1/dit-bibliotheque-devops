import React from 'react';
import { BookOpen, LayoutDashboard, Users, ArrowRightLeft, Activity } from 'lucide-react';

function Sidebar({ currentPage, navigate }) {
  const getNavClass = (page) => `nav-item ${currentPage === page ? 'active' : ''}`;

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon"><BookOpen size={28} strokeWidth={2.5} /></div>
          <div>
            <div className="logo-title">DIT Library</div>
          </div>
        </div>
        <div className="logo-sub">Bibliothèque Numérique</div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          <div className={getNavClass('dashboard')} onClick={() => navigate('dashboard')}>
            <span className="nav-icon"><LayoutDashboard size={18} /></span> Tableau de bord
          </div>
          <div className={getNavClass('books')} onClick={() => navigate('books')}>
            <span className="nav-icon"><BookOpen size={18} /></span> Livres
          </div>
          <div className={getNavClass('users')} onClick={() => navigate('users')}>
            <span className="nav-icon"><Users size={18} /></span> Utilisateurs
          </div>
          <div className={getNavClass('loans')} onClick={() => navigate('loans')}>
            <span className="nav-icon"><ArrowRightLeft size={18} /></span> Emprunts
          </div>
        </div>
        <div className="nav-section">
          <div className="nav-label">Services</div>
          <div className={getNavClass('status')} onClick={() => navigate('status')}>
            <span className="nav-icon"><Activity size={18} /></span> Statut Services
          </div>
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="version-tag">DIT v1.0.0 · DevOps 2026</div>
      </div>
    </nav>
  );
}

export default Sidebar;
