import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Status() {
  const [topbarContainer, setTopbarContainer] = useState(null);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    setTopbarContainer(document.getElementById('topbar-actions'));
  }, []);

  const services = [
    { name: 'Books Service', port: 5001, color: 'var(--accent)', icon: '📖' },
    { name: 'Users Service', port: 5002, color: 'var(--gold)', icon: '👥' },
    { name: 'Loans Service', port: 5003, color: 'var(--accent2)', icon: '🔄' },
    { name: 'Frontend', port: 80, color: 'var(--success)', icon: '🖥️' },
    { name: 'PostgreSQL DB', port: 5432, color: '#3b82f6', icon: '🗄️' }
  ];

  const handleRefresh = () => {
    setForceUpdate((prev) => prev + 1);
  };

  return (
    <div className="page">
      {topbarContainer &&
        createPortal(
          <button className="btn btn-ghost" onClick={handleRefresh}>
            🔄 Actualiser
          </button>,
          topbarContainer
        )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">⚡ Statut des Microservices</div>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '14px' }} id="services-grid">
            {services.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>:{s.port}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
                  <span className="badge badge-green">En ligne</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', padding: '18px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '10px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px' }}>// ARCHITECTURE MICROSERVICES</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <div>📌 <strong style={{ color: 'var(--text)' }}>Nginx</strong> → Reverse proxy → Frontend (port 80)</div>
              <div>📌 <strong style={{ color: 'var(--text)' }}>Books Service</strong> → Flask API → PostgreSQL (port 5001)</div>
              <div>📌 <strong style={{ color: 'var(--text)' }}>Users Service</strong> → Flask API → PostgreSQL (port 5002)</div>
              <div>📌 <strong style={{ color: 'var(--text)' }}>Loans Service</strong> → Flask API → PostgreSQL (port 5003)</div>
              <div>📌 <strong style={{ color: 'var(--text)' }}>Jenkins</strong> → CI/CD Pipeline (port 8080)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Status;
