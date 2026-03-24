import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Activity, BookOpen, Users, ArrowRightLeft, Database, Server } from 'lucide-react';

const SERVICES = [
  { name: 'Books Service',   icon: <BookOpen size={20} />, color: 'var(--accent)',  statsUrl: '/api/books/stats'  },
  { name: 'Users Service',   icon: <Users size={20} />, color: 'var(--gold)',    statsUrl: '/api/users/stats'  },
  { name: 'Loans Service',   icon: <ArrowRightLeft size={20} />, color: 'var(--accent2)', statsUrl: '/api/loans/stats'  },
  { name: 'Frontend (Nginx)',icon: <Server size={20} />, color: 'var(--success)', statsUrl: null                },
  { name: 'PostgreSQL DB',   icon: <Database size={20} />, color: '#3b82f6',        statsUrl: '/api/books/stats'  },
];

function ServiceRow({ service }) {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  const check = useCallback(async () => {
    setStatus('checking');
    if (!service.statsUrl) {
      setStatus('online');
      setLatency(0);
      return;
    }
    const start = Date.now();
    try {
      const res = await fetch(service.statsUrl, { cache: 'no-store' });
      const ms = Date.now() - start;
      setLatency(ms);
      setStatus(res.ok ? 'online' : 'error');
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  }, [service.statsUrl]);

  useEffect(() => { check(); }, [check]);

  const dot = { online: 'var(--success)', offline: 'var(--danger)', error: 'var(--warning)', checking: 'var(--muted)' }[status];
  const label = { online: 'En ligne', offline: 'Hors ligne', error: 'Erreur', checking: 'Vérification...' }[status];
  const badgeCls = { online: 'badge-green', offline: 'badge-red', error: 'badge-yellow', checking: 'badge-gray' }[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ color: service.color }}>{service.icon}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{service.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            {latency !== null ? `${latency} ms` : '—'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, boxShadow: status === 'online' ? `0 0 8px ${dot}` : 'none', animation: status === 'checking' ? 'pulse 1s infinite' : 'none' }} />
        <span className={`badge ${badgeCls}`}>{label}</span>
        <button className="btn btn-ghost btn-sm" onClick={check} title="Re-tester" style={{ padding: '4px 8px' }}>
          <RefreshCw size={12} className={status === 'checking' ? 'spin-icon' : ''} />
        </button>
      </div>
    </div>
  );
}

function Status() {
  const [topbarContainer, setTopbarContainer] = useState(null);

  useEffect(() => { setTopbarContainer(document.getElementById('topbar-actions')); }, []);

  const [key, setKey] = useState(0);
  const handleRefresh = () => setKey(k => k + 1);

  return (
    <div className="page">
      {topbarContainer && createPortal(
        <button className="btn btn-ghost" onClick={handleRefresh}><RefreshCw size={16} /> Actualiser tout</button>,
        topbarContainer
      )}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Activity size={18} /> Statut des Microservices</div>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '14px' }}>
            {SERVICES.map(s => <ServiceRow key={`${s.name}-${key}`} service={s} />)}
          </div>
          <div style={{ marginTop: '24px', padding: '18px', background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: '10px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px' }}>// ARCHITECTURE MICROSERVICES</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <div><strong style={{ color: 'var(--text)' }}>Nginx</strong> → Reverse proxy → Frontend (port 80)</div>
              <div><strong style={{ color: 'var(--text)' }}>Books Service</strong> → Flask API → PostgreSQL (port 5001)</div>
              <div><strong style={{ color: 'var(--text)' }}>Users Service</strong> → Flask API → PostgreSQL (port 5002)</div>
              <div><strong style={{ color: 'var(--text)' }}>Loans Service</strong> → Flask API → PostgreSQL (port 5003)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Status;
