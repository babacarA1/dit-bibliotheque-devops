import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Book, Users as UsersIcon, ArrowRightLeft, AlertTriangle, Inbox, ChevronRight, GraduationCap, Briefcase, User as UserIcon } from 'lucide-react';

function AnimatedCount({ value }) {
  const ref = useRef(null);
  const prev = useRef(value);

  useEffect(() => {
    if (!ref.current || prev.current === value) { prev.current = value; return; }
    ref.current.classList.remove('count-pop');
    void ref.current.offsetWidth;
    ref.current.classList.add('count-pop');
    prev.current = value;
  }, [value]);

  return <div className="stat-value" ref={ref}>{value}</div>;
}

function Dashboard({ books, users, loans, navigate, onRefresh }) {
  const totalBooks = books.length;
  const availableBooks = books.reduce((s, b) => s + b.available_copies, 0);
  const totalUsers = users.length;
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const overdueLoans = loans.filter(l => l.is_overdue || l.status === 'overdue').length;
  const recentLoans = [...loans].slice(0, 5);
  const popularBooks = [...books].slice(0, 5);

  const loanBadge = (loan) => {
    if (loan.is_overdue || loan.status === 'overdue') return <span className="badge badge-red"><AlertTriangle size={12} /> Retard</span>;
    if (loan.status === 'returned') return <span className="badge badge-green">✓ Retourné</span>;
    return <span className="badge badge-blue">● Actif</span>;
  };

  const availBar = (book) => {
    const pct = book.total_copies > 0 ? (book.available_copies / book.total_copies) * 100 : 0;
    const cls = pct < 34 ? 'low' : pct < 67 ? 'mid' : '';
    return (
      <div className="avail-bar">
        <div className="avail-track">
          <div className={`avail-fill ${cls}`} style={{ width: `${pct}%` }} />
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
          {book.available_copies}/{book.total_copies}
        </span>
      </div>
    );
  };

  // Real data for Line Chart (Loans over last 7 days)
  const lineData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    // Count loans that were borrowed on this specific day
    const loansOnDay = loans.filter(l => {
      if (!l.borrowed_at) return false;
      return l.borrowed_at.startsWith(dateStr);
    }).length;

    return {
      name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      emprunts: loansOnDay
    };
  });

  // Data for Pie Chart (Books by category)
  const categoryCounts = books.reduce((acc, b) => {
    const cat = b.category || 'Autre';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#ccff00', '#00d4ff', '#7c3aed', '#f59e0b', '#f87171', '#22c55e', '#a1a1aa'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{payload[0].value} emprunts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Bienvenue à la Bibliothèque DIT</h2>
          <p>Gérez vos livres, utilisateurs et emprunts depuis ce tableau de bord centralisé.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="welcome-emoji"><GraduationCap size={48} color="var(--accent)" opacity={0.8} /></div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Book size={24} /></div>
          <div className="stat-label">Total Livres</div>
          <AnimatedCount value={totalBooks} />
          <div className="stat-sub" style={{ color: 'var(--accent)' }}>{availableBooks} disponibles</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon"><UsersIcon size={24} /></div>
          <div className="stat-label">Utilisateurs</div>
          <AnimatedCount value={totalUsers} />
          <div className="stat-sub">Actifs dans le système</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><ArrowRightLeft size={24} /></div>
          <div className="stat-label">Emprunts Actifs</div>
          <AnimatedCount value={activeLoans} />
          <div className="stat-sub">{loans.length} total historique</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div className="stat-label">En Retard</div>
          <AnimatedCount value={overdueLoans} />
          <div className="stat-sub">Retours en attente</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activité des emprunts (7 derniers jours)</div>
          </div>
          <div className="card-body" style={{ padding: '20px', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="emprunts" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Répartition par Catégorie</div>
          </div>
          <div className="card-body" style={{ padding: '20px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length === 0 ? (
               <div className="empty" style={{ padding: 0 }}><Inbox size={32} /><div className="empty-text">Aucune donnée</div></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: 'var(--text)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Emprunts Récents</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('loans')}>Voir tout <ChevronRight size={14} /></button>
          </div>
          <div className="card-body">
            {recentLoans.length === 0 ? (
              <div className="empty"><div className="empty-icon"><Inbox size={32} /></div><div className="empty-text">Aucun emprunt</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Livre</th><th>Utilisateur</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {recentLoans.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.book?.title || 'Livre #' + l.book_id}</td>
                      <td><span style={{ color: 'var(--muted)' }}>{l.user?.name || 'User #' + l.user_id}</span></td>
                      <td>{loanBadge(l)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Catalogue Livres</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('books')}>Voir tout <ChevronRight size={14} /></button>
          </div>
          <div className="card-body">
            {popularBooks.length === 0 ? (
              <div className="empty"><div className="empty-icon"><Inbox size={32} /></div><div className="empty-text">Aucun livre</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Titre</th><th>Catégorie</th><th>Dispo</th></tr>
                </thead>
                <tbody>
                  {popularBooks.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 500 }}>{b.title}</td>
                      <td><span className="badge badge-gray">{b.category || '—'}</span></td>
                      <td>{availBar(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
              { t: 'Etudiant', icon: <GraduationCap size={24} />, c: 'badge-blue' },
              { t: 'Professeur', icon: <Briefcase size={24} />, c: 'badge-purple' },
              { t: 'Personnel administratif', icon: <UserIcon size={24} />, c: 'badge-yellow' },
            ].map(ut => {
              const count = users.filter(u => u.user_type === ut.t).length;
              return (
                <div key={ut.t} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', flex: 1, minWidth: '180px' }}>
                  <div style={{ color: 'var(--muted)' }}>{ut.icon}</div>
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
