import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import './admin.css';

const configs = {
  'prayer-requests': { title: 'Demandes de prière', icon: '◉', tone: 'prayer', description: 'Les sujets envoyés par les visiteurs.', fields: ['subject', 'message'] },
  'help-requests': { title: "Demandes d’aide", icon: '♡', tone: 'help', description: 'Les personnes qui demandent un accompagnement.', fields: ['message'] },
};

export default function AdminRequestsPage({ resource }) {
  const navigate = useNavigate();
  const config = configs[resource];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await churchApi.admin.list(resource);
      setItems(response.data || []);
    } catch (e) {
      setError(e.message);
      if (e.message.toLowerCase().includes('auth')) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [resource]);

  const updateStatus = async (id, status) => {
    try {
      await churchApi.admin.update(resource, id, { status });
      await load();
    } catch (e) { setError(e.message); }
  };

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand"><span className="brand-mark">G+</span><span><strong>GOSPEL BREAK</strong><small>CHAIN MINISTRY</small></span></Link>
      <span className="sidebar-caption">ADMINISTRATION</span>
      <nav>
        <Link className="sidebar-link" to="/admin"><i>⌂</i><span>Dashboard</span></Link>
        <Link className={`sidebar-link ${resource === 'prayer-requests' ? 'active' : ''}`} to="/admin/prayer-requests"><i>◉</i><span>Demandes de prière</span></Link>
        <Link className={`sidebar-link ${resource === 'help-requests' ? 'active' : ''}`} to="/admin/help-requests"><i>♡</i><span>Demandes d’aide</span></Link>
        <Link className="sidebar-link" to="/admin/testimonials"><i>▱</i><span>Témoignages</span></Link>
        <Link className="sidebar-link" to="/admin/ministries"><i>▤</i><span>Contenu du site</span></Link>
        <Link className="sidebar-link" to="/admin/settings"><i>⌂</i><span>Église</span></Link>
      </nav>
      <button className="admin-logout" onClick={async () => { await churchApi.logout(); navigate('/admin/login'); }}><i>↪</i><span>Déconnexion</span></button>
    </aside>
    <main className="admin-main">
      <header className="admin-header"><div><p className="dashboard-eyebrow">ADMINISTRATION</p><h1>{config.title}</h1><p>{config.description}</p></div><Link to="/admin" className="btn outline">← Dashboard</Link></header>
      {error && <div className="form-error dashboard-error">{error}</div>}
      <section className="admin-panel request-page-panel">
        <div className="admin-list-head"><div><h2>Demandes reçues</h2><p className="admin-muted">{items.length} élément{items.length > 1 ? 's' : ''}</p></div><span>{items.length}</span></div>
        {loading ? <p className="admin-muted">Chargement...</p> : items.length === 0 ? <div className="empty-state"><strong>Aucune demande pour le moment</strong><span>Les nouvelles demandes envoyées depuis le site apparaîtront ici.</span></div> :
          <div className="request-list">{items.map(item => <article className="request-card" key={item.id}>
            <div className={`request-icon ${config.tone}`}>{config.icon}</div>
            <div className="request-content">
              <div className="request-meta"><strong>{item.name || 'Anonyme'}</strong><span>{item.phone || 'Téléphone non renseigné'}</span><small>#{item.id}</small></div>
              {item.subject && <h3>{item.subject}</h3>}
              <p>{item.message}</p>
              {item.email && <span className="request-email">{item.email}</span>}
              <div className="request-flags">{item.is_urgent && <span className="request-urgent">Urgente</span>}{item.is_confidential && <span>Confidentielle</span>}</div>
            </div>
            <div className="request-actions"><span className={`status ${item.status || 'pending'}`}>{item.status || 'pending'}</span><select value={item.status || 'pending'} onChange={e => updateStatus(item.id, e.target.value)}><option value="pending">En attente</option><option value="in_progress">En cours</option><option value="resolved">Traitée</option></select></div>
          </article>)}</div>}
      </section>
    </main>
  </div>;
}
