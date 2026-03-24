import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, CornerUpLeft, Inbox, AlertTriangle, X } from 'lucide-react';

function Loans({ loans, books, users, refresh, openModal, closeModal, addToast }) {
  const [filterType, setFilterType] = useState('all');
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => { setTopbarContainer(document.getElementById('topbar-actions')); }, []);

  const filteredLoans = loans.filter(l => {
    if (filterType === 'active') return l.status === 'active' && !l.is_overdue;
    if (filterType === 'overdue') return l.is_overdue || l.status === 'overdue';
    if (filterType === 'returned') return l.status === 'returned';
    return true;
  });

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const loanBadge = (loan) => {
    if (loan.is_overdue || loan.status === 'overdue') return <span className="badge badge-red"><AlertTriangle size={12} /> Retard</span>;
    if (loan.status === 'returned') return <span className="badge badge-green">✓ Retourné</span>;
    return <span className="badge badge-blue">● Actif</span>;
  };

  const handleReturn = async (id) => {
    try {
      const res = await fetch(`/api/loans/${id}/return`, { method: 'PUT' });
      const json = await res.json();
      if (!res.ok) { addToast(json.error || 'Erreur serveur', 'error'); return; }
      addToast('Livre retourné avec succès');
      refresh();
    } catch {
      addToast('Impossible de joindre le service emprunts', 'error');
    }
  };

  const showModal = () => {
    const availableBooks = books.filter(b => b.available_copies > 0);
    const activeUsers = users.filter(u => u.is_active);

    const handleSave = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const book_id = parseInt(formData.get('book_id'));
      const user_id = parseInt(formData.get('user_id'));

      if (!book_id || !user_id) {
        addToast('Veuillez sélectionner un livre et un utilisateur', 'error');
        return;
      }

      try {
        const res = await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_id, user_id }),
        });
        const json = await res.json();
        if (!res.ok) { addToast(json.error || 'Erreur serveur', 'error'); return; }
        addToast('Emprunt enregistré');
        closeModal();
        refresh();
      } catch {
        addToast('Impossible de joindre le service emprunts', 'error');
      }
    };

    openModal(
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Nouvel Emprunt</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}><X size={16} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Livre *</label>
              <select name="book_id" className="form-control" required>
                <option value="">— Sélectionner un livre —</option>
                {availableBooks.map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available_copies} dispo.)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Utilisateur *</label>
              <select name="user_id" className="form-control" required>
                <option value="">— Sélectionner un utilisateur —</option>
                {activeUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.user_type})</option>
                ))}
              </select>
            </div>
            <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--muted)' }}>
              Durée d'emprunt : <strong style={{ color: 'var(--accent)' }}>14 jours</strong>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
            <button type="submit" className="btn btn-primary">Confirmer l'emprunt</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="page">
      {topbarContainer && createPortal(
        <button className="btn btn-primary" onClick={showModal}><Plus size={16} /> Nouvel emprunt</button>,
        topbarContainer
      )}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Historique des Emprunts — {filteredLoans.length}</div>
          <div className="filter-bar">
            {[{ v: 'all', l: 'Tous' }, { v: 'active', l: 'Actifs' }, { v: 'overdue', l: 'En retard' }, { v: 'returned', l: 'Retournés' }].map(f => (
              <button key={f.v} className={`btn btn-sm ${filterType === f.v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterType(f.v)}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body table-wrap">
          {filteredLoans.length === 0 ? (
            <div className="empty"><div className="empty-icon"><Inbox size={32} /></div><div className="empty-text">Aucun emprunt trouvé</div></div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Livre</th><th>Emprunteur</th><th>Emprunté le</th><th>Date limite</th><th>Retour</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredLoans.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{l.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: '160px' }}>{l.book?.title || 'Livre #' + l.book_id}</td>
                    <td>
                      <div>{l.user?.name || 'User #' + l.user_id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{l.user?.user_type || ''}</div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{fmtDate(l.borrowed_at)}</td>
                    <td style={{ fontSize: '12px', color: l.is_overdue ? 'var(--danger)' : 'var(--muted)' }}>{fmtDate(l.due_date)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{l.returned_at ? fmtDate(l.returned_at) : '—'}</td>
                    <td>
                      {loanBadge(l)}
                      {l.days_overdue > 0 && <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '2px' }}>+{l.days_overdue} jours</div>}
                    </td>
                    <td>
                      {l.status !== 'returned' ? (
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(l.id)}><CornerUpLeft size={14} /> Retourner</button>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Loans;
