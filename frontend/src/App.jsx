import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Loans from './pages/Loans';
import Status from './pages/Status';
import ToastContainer from './components/ToastContainer';
import ModalContainer from './components/ModalContainer';
import { initialData } from './data';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [books, setBooks] = useState(initialData.books);
  const [users, setUsers] = useState(initialData.users);
  const [loans, setLoans] = useState(initialData.loans);

  const [toasts, setToasts] = useState([]);
  const [modalContent, setModalContent] = useState(null);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard books={books} users={users} loans={loans} navigate={setCurrentPage} />;
      case 'books':
        return <Books books={books} setBooks={setBooks} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'users':
        return <Users users={users} setUsers={setUsers} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'loans':
        return <Loans loans={loans} setLoans={setLoans} books={books} setBooks={setBooks} users={users} openModal={openModal} closeModal={closeModal} addToast={addToast} />;
      case 'status':
        return <Status />;
      default:
        return <Dashboard books={books} users={users} loans={loans} navigate={setCurrentPage} />;
    }
  };

  const getPageTitle = (page) => {
    const titles = {
      dashboard: 'Tableau de bord',
      books: 'Gestion des Livres',
      users: 'Gestion des Utilisateurs',
      loans: 'Gestion des Emprunts',
      status: 'Statut des Services'
    };
    return titles[page] || page;
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} navigate={setCurrentPage} />
      <div className="main">
        <Topbar title={getPageTitle(currentPage)} currentPage={currentPage} />
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
