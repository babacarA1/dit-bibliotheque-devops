import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function Users({ users, setUsers, openModal, closeModal, addToast }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => {
    setTopbarContainer(document.getElementById('topbar-actions'));
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'Tous' || u.user_type === filterType;
    return matchesSearch && matchesType;
  });

  const typeBadge = { 'Etudiant': 'badge-blue', 'Professeur': 'badge-purple', 'Personnel administratif': 'badge-yellow' };

  const handleSave = (id, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      user_type: formData.get('user_type'),
      student_id: formData.get('student_id')?.trim() || null,
      phone: formData.get('phone')?.trim() || null,
      is_active: true
    };

    if (!data.name || !data.email) {
      addToast('Nom et email requis', 'error');
      return;
    }

    if (id) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      addToast('Utilisateur modifié');
    } else {
      setUsers(prev => [...prev, { ...data, id: Date.now() }]);
      addToast('Utilisateur créé');
    }
    closeModal();
  };

  const showModal = (user = null) => {
    const title = user ? "Modifier l'utilisateur" : "Nouvel utilisateur";
    const types = ['Etudiant','Professeur','Personnel administratif'];
    
    // Simple controlled state wrapper for the form dynamic display
    const FormContent = () => {
      const [type, setType] = useState(user?.user_type || 'Etudiant');
      return (
        <form onSubmit={(e) => handleSave(user?.id, e)}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom complet *</label>
                <input name="name" className="form-control" defaultValue={user?.name||''} placeholder="Prénom Nom" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className="form-control" defaultValue={user?.email||''} placeholder="exemple@dit.sn" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type d'utilisateur *</label>
                <select name="user_type" className="form-control" value={type} onChange={e => setType(e.target.value)}>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {type === 'Etudiant' && (
                <div className="form-group">
                  <label className="form-label">ID Étudiant</label>
                  <input name="student_id" className="form-control" defaultValue={user?.student_id||''} placeholder="DIT2024XXX" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input name="phone" className="form-control" defaultValue={user?.phone||''} placeholder="+221 7X XXX XXXX" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
            <button type="submit" className="btn btn-primary">{user ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      );
    };

    openModal(
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
        </div>
        <FormContent />
      </div>
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    addToast('Utilisateur supprimé');
  };

  return (
    <div className="page">
      {topbarContainer && createPortal(
        <>
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Nom ou email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={() => showModal()}>+ Ajouter</button>
        </>,
        topbarContainer
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Utilisateurs — {filteredUsers.length}</div>
          <div className="filter-bar">
            {['Tous','Etudiant','Professeur','Personnel administratif'].map(t => (
              <button 
                key={t}
                className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-ghost'}`} 
                onClick={() => setFilterType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body table-wrap">
          {filteredUsers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-text">Aucun utilisateur trouvé</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Nom</th><th>Email</th><th>Type</th><th>ID Étudiant</th><th>Téléphone</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{u.email}</td>
                    <td><span className={`badge ${typeBadge[u.user_type]||'badge-gray'}`}>{u.user_type}</span></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>{u.student_id||'—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{u.phone||'—'}</td>
                    <td><span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>{u.is_active?'Actif':'Inactif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => showModal(u)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>
                      </div>
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

export default Users;
