import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { churchApi } from '../services/churchApi';
import './admin.css';

const configs = {
  'prayer-requests': { title: 'Demandes de prière', icon: '◉', tone: 'prayer', description: 'Les sujets envoyés par les visiteurs.' },
  'help-requests': { title: "Demandes d’aide", icon: '♡', tone: 'help', description: 'Les personnes qui demandent un accompagnement.' },
};

const statusLabels = { pending: 'En attente', in_progress: 'En cours', resolved: 'Traitée' };

export default function AdminRequestsPage({ resource }) {
  const navigate = useNavigate();
  const config = configs[resource];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [revealed, setRevealed] = useState(new Set());

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await churchApi.admin.list(resource);
      setItems(response.data || []);
    } catch (e) {
      setError(e.message || 'Impossible de charger les demandes.');
      if (/auth|session|unauthorized/i.test(e.message || '')) navigate('/admin/login', { replace: true });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [resource]);

  const updateStatus = async (id, status) => {
    try { await churchApi.admin.update(resource, id, { status }); setItems(current => current.map(item => item.id === id ? { ...item, status } : item)); }
    catch (e) { setError(e.message || 'Impossible de modifier le statut.'); }
  };

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...items]
      .filter(item => filter === 'all' || (filter === 'urgent' ? Boolean(item.is_urgent) : item.status === filter))
      .filter(item => !needle || [item.name, item.phone, item.email, item.subject, item.message].filter(Boolean).join(' ').toLowerCase().includes(needle))
      .sort((a, b) => Number(Boolean(b.is_urgent)) - Number(Boolean(a.is_urgent)) || Number(b.id) - Number(a.id));
  }, [items, filter, query]);

  const toggleReveal = id => setRevealed(current => {
    const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  return <AdminLayout active={resource} title={config.title} description={config.description}>
    <section className="admin-panel request-page-panel">
      <div className="admin-list-head"><div><h2>Demandes reçues</h2><p className="admin-muted">{filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''}. Les urgences sont prioritaires.</p></div><span>{items.length}</span></div>
      <div className="request-toolbar">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher par nom, téléphone, sujet..." aria-label="Rechercher une demande" />
        <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filtrer les demandes">
          <option value="all">Toutes</option><option value="urgent">Urgentes</option><option value="pending">En attente</option><option value="in_progress">En cours</option><option value="resolved">Traitées</option>
        </select>
      </div>
      {error && <div className="form-error dashboard-error" role="alert">{error} <button type="button" onClick={load}>Réessayer</button></div>}
      {loading ? <div className="admin-list-skeleton" aria-label="Chargement"><span/><span/><span/></div> : filteredItems.length === 0 ? <div className="empty-state"><strong>Aucune demande correspondante</strong><span>Les nouvelles demandes envoyées depuis le site apparaîtront ici.</span></div> : <div className="request-list">
        {filteredItems.map(item => {
          const isConfidential = Boolean(item.is_confidential);
          const isRevealed = revealed.has(item.id);
          return <article className={`request-card ${item.is_urgent ? 'is-urgent' : ''}`} key={item.id}>
            <div className={`request-icon ${config.tone}`}>{config.icon}</div>
            <div className="request-content">
              <div className="request-meta"><strong>{item.name || 'Anonyme'}</strong><span>{item.phone || 'Téléphone non renseigné'}</span><small>#{item.id}</small></div>
              {item.subject && <h3>{item.subject}</h3>}
              {isConfidential && !isRevealed ? <div className="confidential-box"><strong>Demande confidentielle</strong><span>Le contenu est masqué par défaut.</span><button type="button" onClick={() => toggleReveal(item.id)}>Afficher</button></div> : <><p>{item.message}</p>{isConfidential && <button className="inline-action" type="button" onClick={() => toggleReveal(item.id)}>Masquer le contenu</button>}</>}
              {item.email && <span className="request-email">{item.email}</span>}
              <div className="request-flags">{item.is_urgent && <span className="request-urgent">Urgente</span>}{isConfidential && <span>Confidentielle</span>}</div>
            </div>
            <div className="request-actions"><span className={`status ${item.status || 'pending'}`}>{statusLabels[item.status] || item.status || 'En attente'}</span><select value={item.status || 'pending'} onChange={e => updateStatus(item.id, e.target.value)} aria-label={`Statut de la demande ${item.id}`}><option value="pending">En attente</option><option value="in_progress">En cours</option><option value="resolved">Traitée</option></select></div>
          </article>;
        })}
      </div>}
    </section>
  </AdminLayout>;
}
