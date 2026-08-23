import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

const contentKeys = ['ministries', 'programs', 'events', 'sermons', 'gallery'];

function StatCard({ icon, tone, label, value, detail, to }) {
  return <Link className="stat-card" to={to}>
    <span className={`stat-icon ${tone}`}>{icon}</span>
    <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
  </Link>;
}

function ActivePaymentCard({ loading, sum, count }) {
  const formattedSum = loading ? '—' : new Intl.NumberFormat('fr-FR').format(sum || 0) + ' FCFA';
  return (
    <Link className="payment-placeholder active-payment" to="/admin/donations" style={{ textDecoration: 'none' }}>
      <div className="placeholder-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>⛁</div>
      <div>
        <span className="dashboard-label">DONS & OFFRANDES</span>
        <h3 style={{ fontSize: '24px', margin: '4px 0', color: 'var(--admin-navy)' }}>{formattedSum}</h3>
        <p style={{ margin: 0, color: '#637184' }}>{loading ? 'Chargement...' : `${count || 0} don(s) enregistré(s)`}</p>
      </div>
      <span className="coming-soon" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>ACTIF</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    churchApi.admin.dashboard()
      .then((response) => mounted && setData(response.data || response))
      .catch((e) => mounted && setError(e.message || 'Impossible de charger le tableau de bord.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const counts = data?.counts || {};
  const prayerCount = counts['prayer-requests'] || 0;
  const helpCount = counts['help-requests'] || 0;
  const testimonialCount = counts.testimonials || 0;
  const donationsCount = counts.donations || 0;
  const donationsSum = data?.donations_sum || 0;
  const contentCount = contentKeys.reduce((sum, key) => sum + (counts[key] || 0), 0);
  const totalRequests = prayerCount + helpCount + testimonialCount;
  const prayerRatio = totalRequests ? Math.round((prayerCount / totalRequests) * 100) : 0;
  const helpRatio = totalRequests ? Math.round((helpCount / totalRequests) * 100) : 0;

  const activity = useMemo(() => [
    // { icon: '◉', tone: 'prayer', title: 'Demandes de prière', value: prayerCount, to: '/admin/prayer-requests' },
    // { icon: '♡', tone: 'help', title: "Demandes d’aide", value: helpCount, to: '/admin/help-requests' },
    { icon: '▱', tone: 'testimonial', title: 'Témoignages', value: testimonialCount, to: '/admin/testimonials' },
  ], [testimonialCount]);

  return <>
    {error && <div className="form-error dashboard-error">{error}</div>}
    <section className="stats-grid">
      {/* <StatCard icon="◉" tone="prayer" label="Demandes de prière" value={loading ? '—' : prayerCount} detail="Demandes reçues" to="/admin/prayer-requests" /> */}
      {/* <StatCard icon="♡" tone="help" label="Demandes d’aide" value={loading ? '—' : helpCount} detail="Personnes à accompagner" to="/admin/help-requests" /> */}
      <StatCard icon="▱" tone="testimonial" label="Témoignages" value={loading ? '—' : testimonialCount} detail="À consulter / modérer" to="/admin/testimonials" />
      {/* <StatCard icon="▤" tone="content" label="Contenus publiés" value={loading ? '—' : contentCount} detail="Ministères, programmes, événements..." to="/admin/content" /> */}
    </section>

    <section className="dashboard-grid dashboard-top-grid">
      <div className="dashboard-panel priority-panel">
        <div className="panel-head"><div><span className="dashboard-label">ACTION IMMÉDIATE</span><h2>À traiter en priorité</h2></div><Link to="/admin/testimonials">Voir tout →</Link></div>
        <div className="priority-list">
          {/* <Link to="/admin/prayer-requests" className="priority-item prayer"><span className="priority-icon">◉</span><div><strong>Demandes de prière</strong><small>{prayerCount} en attente de consultation</small></div><b>{prayerCount}</b><span>›</span></Link> */}
          {/* <Link to="/admin/help-requests" className="priority-item help"><span className="priority-icon">♡</span><div><strong>Demandes d’aide</strong><small>{helpCount} en attente d’assistance</small></div><b>{helpCount}</b><span>›</span></Link> */}
          <Link to="/admin/testimonials" className="priority-item testimonial"><span className="priority-icon">▱</span><div><strong>Témoignages à consulter</strong><small>{testimonialCount} témoignages reçus</small></div><b>{testimonialCount}</b><span>›</span></Link>
        </div>
      </div>

      <div className="dashboard-panel request-overview">
        <div className="panel-head"><div><span className="dashboard-label">VUE D’ENSEMBLE</span><h2>Répartition des demandes</h2></div></div>
        <div className="donut-wrap"><div className="donut" style={{ '--prayer': `${prayerRatio}%`, '--help': `${helpRatio}%` }}><div><strong>{totalRequests}</strong><span>demandes</span></div></div><div className="legend">{/* <span><i className="dot prayer-dot"/>Prière <b>{prayerCount}</b></span><span><i className="dot help-dot"/>Aide <b>{helpCount}</b></span> */}<span><i className="dot testimonial-dot"/>Témoignages <b>{testimonialCount}</b></span></div></div>
        <Link className="panel-action" to="/admin/testimonials">Consulter les témoignages →</Link>
      </div>
      <ActivePaymentCard loading={loading} sum={donationsSum} count={donationsCount} />
    </section>

    <section className="dashboard-panel activity-panel">
      <div className="panel-head"><div><span className="dashboard-label">SUIVI</span><h2>Activité récente</h2></div></div>
      <div className="activity-list">
        {activity.map(item => <Link to={item.to} className="activity-row" key={item.title}><span className={`activity-icon ${item.tone}`}>{item.icon}</span><div><strong>{item.title}</strong><small>{item.value} élément{item.value > 1 ? 's' : ''} actuellement enregistré{item.value > 1 ? 's' : ''}</small></div><span className="activity-time">À consulter</span><span className="activity-action">Voir →</span></Link>)}
        {/* <Link to="/admin/content" className="activity-row"><span className="activity-icon content">▤</span><div><strong>Contenu du site</strong><small>{contentCount} contenus disponibles dans l’administration</small></div><span className="activity-time">—</span><span className="activity-action">Gérer →</span></Link> */}
      </div>
    </section>

    <section className="dashboard-bottom-grid">
      <div className="dashboard-panel quick-panel"><div className="panel-head"><div><span className="dashboard-label">ACCÈS RAPIDE</span><h2>Gérer le ministère</h2></div></div><div className="quick-actions">{/* <Link to="/admin/ministries"><b>+</b><span>Ajouter un ministère</span></Link><Link to="/admin/programs"><b>+</b><span>Ajouter un programme</span></Link><Link to="/admin/events"><b>+</b><span>Créer un événement</span></Link> */}<Link to="/admin/settings"><b>⚙</b><span>Modifier les informations</span></Link></div></div>
      <div className="dashboard-panel vision-panel"><span className="dashboard-label">VISION DU MINISTÈRE</span><h2>Briser les chaînes · Libérer les captifs · Restaurer les vies</h2><p>Le tableau de bord centralise les demandes reçues et les contenus que le pasteur doit administrer.</p><Link to="/">Voir le site public →</Link></div>
    </section>
  </>;
}
