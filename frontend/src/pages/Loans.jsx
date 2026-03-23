import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function Loans({ loans, setLoans, books, setBooks, users, openModal, closeModal, addToast }) {
  const [filterType, setFilterType] = useState('all');
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => {
    setTopbarContainer(document.getElementById('topbar-actions'));
  }, []);

  const filteredLoans = loans.filter(l => {
    if (filterType === 'active') return l.status === 'active' && !l.is_overdue;
    if (filterType === 'overdue') return l.is_overdue || l.status === 'overdue';
    if (filterType === 'returned') return l.status === 'returned';
    return true;
  });

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric'});
  };

  const loanBadge = (loan) => {
    if (loan.is_overdue || loan.status === 'overdue') return <span className="badge badge-red">⚠ Retard</span>;
    if (loan.status === 'returned') return <span className="badge badge-green">✓ Retourné</span>;
    return <span className="badge badge-blue">● Actif</span>;
  };

  const handleReturn = (id) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    // Update loan
    setLoans(prev => prev.map(l => l.id === id ? {
      ...l,
      status: 'returned',
      returned_at: new Date().toISOString(),
      is_overdue: false
    } : l));

    // Update book copies
    setBooks(prev => prev.map(b => b.id === loan.book_id ? {
      ...b,
      available_copies: Math.min(b.total_copies, b.available_copies + 1)
    } : b));

    addToast('Livre retourné avec succès ✅');
  };

  const showModal = () => {
    const availableBooks = books.filter(b => b.available_copies > 0);
    const activeUsers = users.filter(u => u.is_active);

    const handleSave = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const bookId = parseInt(formData.get('book_id'));
      const userId = parseInt(formData.get('user_id'));

      if (!bookId || !userId) {
        addToast('Veuillez sélectionner un livre et un utilisateur', 'error');
        return;
      }

      const existing = loans.find(l => l.book_id === bookId && l.user_id === userId && l.status === 'active');
      if (existing) {
        addToast('Cet utilisateur a déjà emprunté ce livre', 'error');
        return;
      }

      const book = books.find(b => b.id === bookId);
      const user = users.find(u => u.id === userId);

      if (book.available_copies <= 0) {
        addToast('Aucun exemplaire disponible', 'error');
        return;
      }

      // Update book copies
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available_copies: b.available_copies - 1 } : b));

      const due = new Date();
      due.setDate(due.getDate() + 14);

      const newLoan = {
        id: Date.now(),
        book_id: bookId,
        user_id: userId,
        borrowed_at: new Date().toISOString(),
        due_date: due.toISOString(),
        returned_at: null,
        status: 'active',
        is_overdue: false,
        days_overdue: 0,
        book: { title: book.title, author: book.author },
        user: { name: user.name, user_type: user.user_type }
      };

      setLoans(prev => [newLoan, ...prev]);
      addToast('Emprunt enregistré ✅');
      closeModal();
    };

    openModal(
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Nouvel Emprunt</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Livre *</label>
              <select name="book_id" className="form-control" required>
                <option value="">— Sélectionner un livre —</option>
                {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title} ({b.available_copies} dispo.)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Utilisateur *</label>
              <select name="user_id" className="form-control" required>
                <option value="">— Sélectionner un utilisateur —</option>
                {activeUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.user_type})</option>)}
              </select>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--muted)' }}>
              📅 Durée d'emprunt : <strong style={{ color: 'var(--accent)' }}>14 jours</strong>
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
        <button className="btn btn-primary" onClick={showModal}>+ Nouvel emprunt</button>,
        topbarContainer
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">🔄 Historique des Emprunts — {filteredLoans.length}</div>
          <div className="filter-bar">
            {[
              {v:'all',l:'Tous'},
              {v:'active',l:'Actifs'},
              {v:'overdue',l:'En retard'},
              {v:'returned',l:'Retournés'}
            ].map(f => (
              <button 
                key={f.v} 
                className={`btn btn-sm ${filterType === f.v ? 'btn-primary' : 'btn-ghost'}`} 
                onClick={() => setFilterType(f.v)}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body table-wrap">
          {filteredLoans.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-text">Aucun emprunt trouvé</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Livre</th><th>Emprunteur</th><th>Emprunté le</th><th>Date limite</th><th>Retour</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{l.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: '160px' }}>{l.book?.title || 'Livre #'+l.book_id}</td>
                    <td>
                      <div>{l.user?.name || 'User #'+l.user_id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{l.user?.user_type||''}</div>
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
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(l.id)}>↩ Retourner</button>
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
