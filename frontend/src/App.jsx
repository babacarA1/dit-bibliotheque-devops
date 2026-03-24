import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Loans from './pages/Loans';
import Status from './pages/Status';
import ToastContainer from './components/ToastContainer';
import ModalContainer from './components/ModalContainer';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modalContent, setModalContent] = useState(null);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [bRes, uRes, lRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/users'),
        fetch('/api/loans'),
      ]);
      if (bRes.ok) setBooks(await bRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (lRes.ok) setLoans(await lRes.json());
    } catch {
      addToast('Impossible de joindre les services', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { refresh(true); }, [refresh]);

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  const getPageTitle = (page) => ({
    dashboard: 'Tableau de bord',
    books: 'Gestion des Livres',
    users: 'Gestion des Utilisateurs',
    loans: 'Gestion des Emprunts',
    status: 'Statut des Services',
  }[page] || page);

  const renderPage = () => {
    if (loading) return (
      <div className="loading-screen">
        <div className="spinner" />
        <span style={{ color: 'var(--muted)' }}>Chargement depuis la base de données...</span>
      </div>
    );
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard books={books} users={users} loans={loans} navigate={setCurrentPage} onRefresh={refresh} />;
      case 'books':
        return <Books books={books} refresh={refresh} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'users':
        return <Users users={users} refresh={refresh} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'loans':
        return <Loans loans={loans} books={books} users={users} refresh={refresh} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'status':
        return <Status />;
      default:
        return <Dashboard books={books} users={users} loans={loans} navigate={setCurrentPage} onRefresh={refresh} />;
    }
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} navigate={setCurrentPage} />
      <div className="main">
        <Topbar
          title={getPageTitle(currentPage)}
          currentPage={currentPage}
          refreshing={refreshing}
          onRefresh={refresh}
        />
        <div className="content" id="page-content">
          {renderPage()}
        </div>
      </div>
      <ToastContainer toasts={toasts} />
      {modalContent && (
        <ModalContainer closeModal={closeModal}>
          {modalContent}
        </ModalContainer>
      )}
    </div>
  );
}

export default App;
