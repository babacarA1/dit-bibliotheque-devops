import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Dashboard({ books, users, loans, navigate }) {
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => {
    setTopbarContainer(document.getElementById('topbar-actions'));
  }, []);

  const totalBooks = books.length;
  const availableBooks = books.reduce((sum, b) => sum + b.available_copies, 0);
  const totalUsers = users.length;
  const activeLoans = loans.filter((l) => l.status === 'active' && !l.is_overdue).length;
  const overdueLoans = loans.filter((l) => l.is_overdue || l.status === 'overdue').length;

  const dActiveLoans = loans.filter((l) => l.status === 'active').length;
  const recentLoans = loans.slice(0, 3);
  const popularBooks = books.slice(0, 5);

  const loanBadge = (loan) => {
    if (loan.is_overdue || loan.status === 'overdue') return <span className="badge badge-red">⚠ Retard</span>;
    if (loan.status === 'returned') return <span className="badge badge-green">✓ Retourné</span>;
    return <span className="badge badge-blue">● Actif</span>;
  };

  const availBar = (book) => {
    const pct = book.total_copies > 0 ? (book.available_copies / book.total_copies) * 100 : 0;
    const cls = pct < 34 ? 'low' : pct < 67 ? 'mid' : '';
    return (
      <div className="avail-bar">
        <div className="avail-track">
          <div className={`avail-fill ${cls}`} style={{ width: `${pct}%` }}></div>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {book.available_copies}/{book.total_copies}
        </span>
      </div>
    );
  };

  return (
    <div className="page">
      {topbarContainer && createPortal(null, topbarContainer)}
      
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Bienvenue à la Bibliothèque DIT 📚</h2>
          <p>Gérez vos livres, utilisateurs et emprunts depuis ce tableau de bord centralisé.</p>
        </div>
        <div className="welcome-emoji">🎓</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-label">Total Livres</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalBooks}</div>
          <div className="stat-sub">{availableBooks} disponibles</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Utilisateurs</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{totalUsers}</div>
          <div className="stat-sub">Actifs dans le système</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🔄</div>
          <div className="stat-label">Emprunts Actifs</div>
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{dActiveLoans}</div>
          <div className="stat-sub">{loans.length} total historique</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">En Retard</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{overdueLoans}</div>
          <div className="stat-sub">Retours en attente</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Emprunts Récents</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('loans')}>Voir tout →</button>
          </div>
          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th>Livre</th>
                  <th>Utilisateur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.book?.title || 'N/A'}</td>
                    <td><span style={{ color: 'var(--muted)' }}>{l.user?.name || 'N/A'}</span></td>
                    <td>{loanBadge(l)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Livres Populaires</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('books')}>Voir tout →</button>
          </div>
          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Dispo</th>
                </tr>
              </thead>
              <tbody>
                {popularBooks.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.title}</td>
                    <td><span className="badge badge-blue">{b.category}</span></td>
                    <td>{availBar(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="card-title">Répartition des Utilisateurs</div>
        </div>
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { t: 'Etudiant', e: '🎓', c: 'badge-blue' },
              { t: 'Professeur', e: '👨‍🏫', c: 'badge-purple' },
              { t: 'Personnel administratif', e: '💼', c: 'badge-yellow' }
            ].map((ut) => {
              const count = users.filter((u) => u.user_type === ut.t).length;
              return (
                <div key={ut.t} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', flex: 1, minWidth: '180px' }}>
                  <span style={{ fontSize: '24px' }}>{ut.e}</span>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{count}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{ut.t}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
