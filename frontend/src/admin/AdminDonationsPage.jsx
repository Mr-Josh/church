import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

const statusLabels = {
  pending: 'En attente',
  success: 'Réussi',
  failed: 'Échoué',
};

const typeColors = {
  'Dîme': '#0284c7',
  'Offrande': '#10b981',
  'Action de grâce': '#f59e0b',
  'Mission': '#8b5cf6',
  'Construction': '#ec4899',
  'Autre': '#6b7280',
};

export default function AdminDonationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await churchApi.admin.list('donations');
      setItems(response.data || []);
    } catch (e) {
      setError(e.message || 'Impossible de charger les dons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      const updates = { status };
      if (status === 'success') {
        updates.transaction_id = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      }
      await churchApi.admin.update('donations', id, updates);
      await load();
    } catch (e) {
      setError(e.message || 'Impossible de mettre à jour le statut.');
    }
  };

  const removeDonation = async (id) => {
    if (!window.confirm('Supprimer définitivement cet enregistrement de don ?')) return;
    setError('');
    try {
      await churchApi.admin.remove('donations', id);
      await load();
    } catch (e) {
      setError(e.message || 'Impossible de supprimer le don.');
    }
  };

  // Calculations
  const successfulDonations = items.filter(item => item.status === 'success');
  const totalSum = successfulDonations.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const pendingCount = items.filter(item => item.status === 'pending').length;

  const filteredItems = items.filter(item => {
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchStatus && matchType;
  });

  const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section className="admin-panel donations-page-panel">
      {error && <div className="form-error dashboard-error">{error}</div>}

      {/* Stats Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <span className="stat-icon content" style={{ background: '#ecfdf5', color: '#10b981' }}>⛁</span>
          <div className="stat-copy">
            <span>Total des dons reçus</span>
            <strong>{formatFCFA(totalSum)}</strong>
            <small>{successfulDonations.length} transaction(s) réussie(s)</small>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <span className="stat-icon prayer" style={{ background: '#fffbeb', color: '#d97706' }}>⏳</span>
          <div className="stat-copy">
            <span>Paiements en attente</span>
            <strong>{pendingCount}</strong>
            <small>En attente de confirmation</small>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <span className="stat-icon help" style={{ background: '#f3f4f6', color: '#4b5563' }}>🗲</span>
          <div className="stat-copy">
            <span>Total des transactions</span>
            <strong>{items.length}</strong>
            <small>Toutes tentatives confondues</small>
          </div>
        </div>
      </div>

      {/* Filters Head */}
      <div className="admin-list-head" style={{ flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--admin-line)' }}>
        <div>
          <h2>Historique des Dons & Dîmes</h2>
          <p className="admin-muted">{filteredItems.length} don(s) filtré(s)</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Statut:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cfd8e4', fontSize: '11px' }}>
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="success">Réussi</option>
              <option value="failed">Échoué</option>
            </select>
          </label>
          
          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Type:
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cfd8e4', fontSize: '11px' }}>
              <option value="all">Tous les types</option>
              {['Dîme', 'Offrande', 'Action de grâce', 'Mission', 'Construction', 'Autre'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Donation List */}
      {loading ? (
        <p className="admin-muted" style={{ padding: '24px 0' }}>Chargement...</p>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>
          <strong>Aucun don trouvé</strong>
          <span>Les transactions correspondant aux critères de recherche s'afficheront ici.</span>
        </div>
      ) : (
        <div className="request-list" style={{ marginTop: '20px' }}>
          {filteredItems.map((item) => (
            <article className="request-card" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', padding: '16px 0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                <div 
                  className="request-icon" 
                  style={{ 
                    background: item.status === 'success' ? '#ecfdf5' : item.status === 'failed' ? '#fef2f2' : '#fffbeb', 
                    color: item.status === 'success' ? '#10b981' : item.status === 'failed' ? '#ef4444' : '#d97706',
                    width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '16px', flexShrink: 0
                  }}
                >
                  ⛁
                </div>
                
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="request-meta" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px', color: '#8490a0', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px', color: 'var(--admin-navy)' }}>{item.name || 'Anonyme'}</strong>
                    <span>•</span>
                    <span>{item.phone}</span>
                    <span>•</span>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>{item.payment_method}</span>
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                    <span>•</span>
                    <small>Ref: {item.reference}</small>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '6px 0' }}>
                    <span 
                      style={{ 
                        backgroundColor: typeColors[item.type] || '#6b7280', 
                        color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px' 
                      }}
                    >
                      {item.type}
                    </span>
                    <strong style={{ fontSize: '16px', color: 'var(--admin-navy)' }}>{formatFCFA(parseFloat(item.amount))}</strong>
                  </div>

                  {item.transaction_id && (
                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>
                      ID Trans.: {item.transaction_id}
                    </div>
                  )}
                </div>
              </div>

              <div className="request-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className={`status ${item.status}`} style={{ display: 'inline-block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '4px' }}>
                  {statusLabels[item.status] || item.status}
                </span>
                
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <select 
                    value={item.status} 
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cfd8e4', fontSize: '10px' }}
                  >
                    <option value="pending">En attente</option>
                    <option value="success">Réussi</option>
                    <option value="failed">Échoué</option>
                  </select>
                  
                  <button 
                    onClick={() => removeDonation(item.id)}
                    style={{ 
                      padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444', 
                      background: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' 
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
