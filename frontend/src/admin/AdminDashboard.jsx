import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { churchApi } from '../services/churchApi';
import './admin.css';

const contentKeys = ['ministries', 'programs', 'events', 'sermons', 'gallery'];

function StatCard({ icon, tone, label, value, detail, to }) {
  return <Link className="stat-card" to={to}><span className={`stat-icon ${tone}`}>{icon}</span><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></Link>;
}

function EmptyPaymentCard() {
  return <div className="payment-placeholder"><div className="placeholder-icon">▣</div><div><span className="dashboard-label">DONS & OFFRANDES</span><h3>Module de paiement</h3><p>Le paiement sera connecté séparément. Aucun montant n’est simulé ici.</p></div><span className="coming-soon">À VENIR</span></div>;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    churchApi.admin.dashboard().then(response => mounted && setData(response.data || response)).catch(error => mounted && setError(error.message || 'Impossible de charger le tableau de bord.')).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const counts = data?.counts || {};
  const prayerCount = counts['prayer-requests'] || 0;
  const helpCount = counts['help-requests'] || 0;
  const testimonialCount = counts.testimonials || 0;
  const contentCount = contentKeys.reduce((sum, key) => sum + (counts[key] || 0), 0);
  const totalRequests = prayerCount + helpCount + testimonialCount;
  const pendingRatio = totalRequests ? Math.round((prayerCount / totalRequests) * 100) : 0;
  const activity = useMemo(() => [
    ['◉', 'prayer', 'Demandes de prière', prayerCount, '/admin/prayer-requests'],
    ['♡', 'help', "Demandes d’aide", helpCount, '/admin/help-requests'],
    ['▱', 'testimonial', 'Témoignages', testimonialCount, '/admin/testimonials'],
  ], [prayerCount, helpCount, testimonialCount]);

  return <AdminLayout counts={counts} active="dashboard" title="Bonjour Pasteur" description="Voici ce qui se passe dans votre ministère aujourd’hui.">
    {error && <div className="form-error dashboard-error" role="alert">{error}</div>}
    <section className="stats-grid">
      <StatCard icon="◉" tone="prayer" label="Demandes de prière" value={loading ? '—' : prayerCount} detail="Demandes reçues" to="/admin/prayer-requests" />
      <StatCard icon="♡" tone="help" label="Demandes d’aide" value={loading ? '—' : helpCount} detail="Personnes à accompagner" to="/admin/help-requests" />
      <StatCard icon="▱" tone="testimonial" label="Témoignages" value={loading ? '—' : testimonialCount} detail="À consulter / modérer" to="/admin/testimonials" />
      <StatCard icon="▤" tone="content" label="Contenus publiés" value={loading ? '—' : contentCount} detail="Ministères, programmes, événements..." to="/admin/content" />
    </section>

    <section className="dashboard-grid dashboard-top-grid">
      <div className="dashboard-panel priority-panel"><div className="panel-head"><div><span className="dashboard-label">ACTION IMMÉDIATE</span><h2>À traiter en priorité</h2></div><Link to="/admin/content">Gérer le contenu →</Link></div><div className="priority-list">
        <Link to="/admin/prayer-requests" className="priority-item prayer"><span className="priority-icon">◉</span><div><strong>Demandes de prière</strong><small>{prayerCount} à consulter</small></div><b>{prayerCount}</b><span>›</span></Link>
        <Link to="/admin/help-requests" className="priority-item help"><span className="priority-icon">♡</span><div><strong>Demandes d’aide</strong><small>{helpCount} à accompagner</small></div><b>{helpCount}</b><span>›</span></Link>
        <Link to="/admin/testimonials" className="priority-item testimonial"><span className="priority-icon">▱</span><div><strong>Témoignages</strong><small>{testimonialCount} à modérer</small></div><b>{testimonialCount}</b><span>›</span></Link>
      </div></div>

      <div className="dashboard-panel request-overview"><div className="panel-head"><div><span className="dashboard-label">VUE D’ENSEMBLE</span><h2>Répartition des demandes</h2></div></div><div className="donut-wrap"><div className="donut" style={{ '--prayer': `${pendingRatio}%`, '--help': `${totalRequests ? Math.round((helpCount / totalRequests) * 100) : 0}%` }}><div><strong>{totalRequests}</strong><span>demandes</span></div></div><div className="legend"><span><i className="dot prayer-dot"/>Prière <b>{prayerCount}</b></span><span><i className="dot help-dot"/>Aide <b>{helpCount}</b></span><span><i className="dot testimonial-dot"/>Témoignages <b>{testimonialCount}</b></span></div></div></div>
      <EmptyPaymentCard />
    </section>

    <section className="dashboard-panel activity-panel"><div className="panel-head"><div><span className="dashboard-label">SUIVI</span><h2>Activité récente</h2></div></div><div className="activity-list">
      {activity.map(([icon, tone, title, value, to]) => <Link to={to} className="activity-row" key={title}><span className={`activity-icon ${tone}`}>{icon}</span><div><strong>{title}</strong><small>{value} élément{value > 1 ? 's' : ''} enregistré{value > 1 ? 's' : ''}</small></div><span className="activity-action">Voir →</span></Link>)}
      <div className="activity-row static"><span className="activity-icon content">▤</span><div><strong>Contenu du site</strong><small>{contentCount} contenus disponibles</small></div><Link className="activity-action" to="/admin/content">Gérer →</Link></div>
    </div></section>

    <section className="dashboard-bottom-grid"><div className="dashboard-panel quick-panel"><div className="panel-head"><div><span className="dashboard-label">ACCÈS RAPIDE</span><h2>Gérer le ministère</h2></div></div><div className="quick-actions"><Link to="/admin/ministries"><b>+</b><span>Ajouter un ministère</span></Link><Link to="/admin/programs"><b>+</b><span>Ajouter un programme</span></Link><Link to="/admin/events"><b>+</b><span>Créer un événement</span></Link><Link to="/admin/settings"><b>⚙</b><span>Modifier les informations</span></Link></div></div><div className="dashboard-panel vision-panel"><span className="dashboard-label">VISION DU MINISTÈRE</span><h2>Briser les chaînes · Libérer les captifs · Restaurer les vies</h2><p>Le tableau de bord centralise les demandes reçues et les contenus administrables.</p><Link to="/" target="_blank" rel="noreferrer">Voir le site public →</Link></div></section>
  </AdminLayout>;
}
