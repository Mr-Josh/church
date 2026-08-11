import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

const configs = {
  'prayer-requests': { title: 'Demandes de prière', icon: '◉', tone: 'prayer', description: 'Les sujets envoyés par les visiteurs.' },
  'help-requests': { title: "Demandes d’aide", icon: '♡', tone: 'help', description: 'Les personnes qui demandent un accompagnement.' },
};

export default function AdminRequestsPage({ resource }) {
  const config = configs[resource];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const response = await churchApi.admin.list(resource); setItems(response.data || []); }
    catch (e) { setError(e.message || 'Impossible de charger les demandes.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [resource]);

  const updateStatus = async (id, status) => {
    try { await churchApi.admin.update(resource, id, { status }); await load(); }
    catch (e) { setError(e.message || 'Impossible de mettre à jour le statut.'); }
  };

  return <section className="admin-panel request-page-panel">
    {error && <div className="form-error dashboard-error">{error}</div>}
    <div className="admin-list-head"><div><h2>{config.title}</h2><p className="admin-muted">{config.description}</p></div><span>{items.length}</span></div>
    {loading ? <p className="admin-muted">Chargement...</p> : items.length === 0 ? <div className="empty-state"><strong>Aucune demande pour le moment</strong><span>Les nouvelles demandes envoyées depuis le site apparaîtront ici.</span></div> :
      <div className="request-list">{items.map(item => <article className="request-card" key={item.id}>
        <div className={`request-icon ${config.tone}`}>{config.icon}</div>
        <div className="request-content"><div className="request-meta"><strong>{item.name || 'Anonyme'}</strong><span>{item.phone || 'Téléphone non renseigné'}</span><small>#{item.id}</small></div>{item.subject && <h3>{item.subject}</h3>}<p>{item.message}</p>{item.email && <span className="request-email">{item.email}</span>}<div className="request-flags">{item.is_urgent && <span className="request-urgent">Urgente</span>}{item.is_confidential && <span>Confidentielle</span>}</div></div>
        <div className="request-actions"><span className={`status ${item.status || 'pending'}`}>{item.status || 'pending'}</span><select value={item.status || 'pending'} onChange={e => updateStatus(item.id, e.target.value)}><option value="pending">En attente</option><option value="in_progress">En cours</option><option value="resolved">Traitée</option></select></div>
      </article>)}</div>}
  </section>;
}
