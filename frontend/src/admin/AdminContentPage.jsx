import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import './admin.css';

const sections = [
  ['Ministères', 'Organisez les ministères et leurs descriptions.', '/admin/ministries', '⌂'],
  ['Programmes', 'Gérez les horaires et rendez-vous réguliers.', '/admin/programs', '◷'],
  ['Événements', 'Publiez les prochains temps forts de l’église.', '/admin/events', '▣'],
  ['Témoignages', 'Consultez et modérez les témoignages reçus.', '/admin/testimonials', '▱'],
];

export default function AdminContentPage() {
  const navigate = useNavigate();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand"><span className="brand-mark">G+</span><span><strong>GOSPEL BREAK</strong><small>CHAIN MINISTRY</small></span></Link>
      <span className="sidebar-caption">ADMINISTRATION</span>
      <nav>
        <Link className="sidebar-link" to="/admin"><i>⌂</i><span>Dashboard</span></Link>
        <Link className="sidebar-link" to="/admin/prayer-requests"><i>◉</i><span>Demandes de prière</span></Link>
        <Link className="sidebar-link" to="/admin/help-requests"><i>♡</i><span>Demandes d’aide</span></Link>
        <Link className="sidebar-link" to="/admin/testimonials"><i>▱</i><span>Témoignages</span></Link>
        <Link className="sidebar-link active" to="/admin/content"><i>▤</i><span>Contenu du site</span></Link>
        <Link className="sidebar-link" to="/admin/settings"><i>⌂</i><span>Église</span></Link>
      </nav>
      <button className="admin-logout" onClick={async () => { await churchApi.logout(); navigate('/admin/login'); }}><i>↪</i><span>Déconnexion</span></button>
    </aside>
    <main className="admin-main">
      <header className="admin-header"><div><p className="dashboard-eyebrow">ADMINISTRATION</p><h1>Contenu du site</h1><p>Gérez les éléments visibles sur le site public.</p></div><Link to="/admin" className="btn outline">← Dashboard</Link></header>
      <section className="content-hub-grid">{sections.map(([title, description, to, icon]) => <Link className="content-hub-card" to={to} key={title}><span>{icon}</span><div><h2>{title}</h2><p>{description}</p></div><b>→</b></Link>)}</section>
    </main>
  </div>;
}
