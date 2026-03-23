import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function Books({ books, setBooks, openModal, closeModal, addToast }) {
  const [search, setSearch] = useState('');
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => {
    setTopbarContainer(document.getElementById('topbar-actions'));
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleSave = (id, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title').trim(),
      author: formData.get('author').trim(),
      isbn: formData.get('isbn').trim(),
      category: formData.get('category'),
      published_year: parseInt(formData.get('year')) || null,
      total_copies: parseInt(formData.get('copies')) || 1,
      description: formData.get('desc').trim()
    };

    if (!data.title || !data.author || !data.isbn) {
      addToast('Titre, auteur et ISBN sont requis', 'error');
      return;
    }

    if (id) {
      setBooks(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      addToast('Livre modifié avec succès');
    } else {
      const newBook = { ...data, id: Date.now(), available_copies: data.total_copies };
      setBooks(prev => [...prev, newBook]);
      addToast('Livre ajouté avec succès');
    }
    closeModal();
  };

  const showModal = (book = null) => {
    const title = book ? 'Modifier le livre' : 'Ajouter un livre';
    const categories = ['Informatique','Intelligence Artificielle','Mathématiques','Sciences','Littérature','Droit','Économie','Autre'];

    openModal(
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
        </div>
        <form onSubmit={(e) => handleSave(book?.id, e)}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input name="title" className="form-control" defaultValue={book?.title||''} placeholder="Titre du livre" />
              </div>
              <div className="form-group">
                <label className="form-label">Auteur *</label>
                <input name="author" className="form-control" defaultValue={book?.author||''} placeholder="Nom de l'auteur" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ISBN *</label>
                <input name="isbn" className="form-control" defaultValue={book?.isbn||''} placeholder="978-..." />
              </div>
              <div className="form-group">
                <label className="form-label">Année</label>
                <input name="year" className="form-control" type="number" defaultValue={book?.published_year||''} placeholder="2024" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select name="category" className="form-control" defaultValue={book?.category||'Informatique'}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nb. Exemplaires</label>
                <input name="copies" className="form-control" type="number" defaultValue={book?.total_copies||1} min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input name="desc" className="form-control" defaultValue={book?.description||''} placeholder="Description optionnelle" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
            <button type="submit" className="btn btn-primary">{book ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    setBooks(prev => prev.filter(b => b.id !== id));
    addToast('Livre supprimé');
  };

  return (
    <div className="page">
      {topbarContainer && createPortal(
        <>
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Titre, auteur ou ISBN..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={() => showModal()}>+ Ajouter un livre</button>
        </>,
        topbarContainer
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">📖 Catalogue — {filteredBooks.length} livre(s)</div>
        </div>
        <div className="card-body table-wrap">
          {filteredBooks.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-text">Aucun livre trouvé</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Titre</th><th>Auteur</th><th>ISBN</th><th>Catégorie</th><th>Disponibilité</th><th>Année</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{b.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: '180px' }}>{b.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{b.author}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>{b.isbn}</td>
                    <td><span className="badge badge-blue">{b.category || '—'}</span></td>
                    <td>{availBar(b)}</td>
                    <td style={{ color: 'var(--muted)' }}>{b.published_year || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => showModal(b)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>🗑️</button>
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

export default Books;
