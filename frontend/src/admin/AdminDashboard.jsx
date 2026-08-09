import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import './admin.css';

const navigation = [
  ['⌂', 'Dashboard', '/admin'],
  ['◉', 'Demandes de prière', '/admin/prayer-requests', 'prayer-requests'],
  ['♡', "Demandes d’aide", '/admin/help-requests', 'help-requests'],
  ['▱', 'Témoignages', '/admin/testimonials', 'testimonials'],
  ['▣', 'Dons & Offrandes', '#', 'payments'],
  ['▤', 'Contenu du site', '/admin/content', 'content'],
  ['⌂', 'Église', '/admin/settings'],
  ['⚙', 'Paramètres', '/admin/settings'],
];

const contentKeys = ['ministries', 'programs', 'events', 'sermons', 'gallery'];

function StatCard({ icon, tone, label, value, detail, to }) {
  const body = <>
    <span className={`stat-icon ${tone}`}>{icon}</span>
    <div className="stat-copy">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  </>;
  return to ? <Link className="stat-card" to={to}>{body}</Link> : <div className="stat-card">{body}</div>;
}

function EmptyPaymentCard() {
  return <div className="payment-placeholder">
    <div className="placeholder-icon">▣</div>
    <div>
      <span className="dashboard-label">DONS & OFFRANDES</span>
      <h3>Module de paiement</h3>
      <p>Le module de paiement sera connecté séparément. Aucun montant n’est simulé ici.</p>
    </div>
    <span className="coming-soon">À VENIR</span>
  </div>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    churchApi.admin.dashboard()
      .then((response) => {
        if (mounted) setData(response.data || response);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || 'Impossible de charger le tableau de bord.');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const logout = async () => {
    await churchApi.logout();
    navigate('/admin/login');
  };

  const counts = data?.counts || {};
  const prayerCount = counts['prayer-requests'] || 0;
  const helpCount = counts['help-requests'] || 0;
  const testimonialCount = counts.testimonials || 0;
  const contentCount = contentKeys.reduce((sum, key) => sum + (counts[key] || 0), 0);
  const totalRequests = prayerCount + helpCount + testimonialCount;
  const pendingRatio = totalRequests ? Math.round((prayerCount / totalRequests) * 100) : 0;

  const activity = useMemo(() => [
    { icon: '◉', tone: 'prayer', title: 'Demandes de prière', value: prayerCount, time: 'À consulter', to: '/admin/prayer-requests' },
    { icon: '♡', tone: 'help', title: "Demandes d’aide", value: helpCount, time: 'À consulter', to: '/admin/help-requests' },
    { icon: '▱', tone: 'testimonial', title: 'Témoignages', value: testimonialCount, time: 'À modérer', to: '/admin/testimonials' },
  ], [prayerCount, helpCount, testimonialCount]);

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand">
        <span className="brand-mark">G+</span>
        <span><strong>GOSPEL BREAK</strong><small>CHAIN MINISTRY</small></span>
      </Link>
      <span className="sidebar-caption">ADMINISTRATION</span>
      <nav>
        {navigation.map(([icon, label, to, key]) => {
          const active = to === '/admin' ? true : false;
          const badge = key && key !== 'payments' && key !== 'content' ? counts[key] : null;
          return to === '#' ? <div className="sidebar-link disabled" key={label} title="Module de paiement géré séparément"><i>{icon}</i><span>{label}</span><em>À venir</em></div> :
            <Link className={active ? 'sidebar-link active' : 'sidebar-link'} key={label} to={to}><i>{icon}</i><span>{label}</span>{badge > 0 && <b>{badge}</b>}</Link>;
        })}
      </nav>
      <button className="admin-logout" onClick={logout}><i>↪</i><span>Déconnexion</span></button>
      <div className="sidebar-verse">
        <span>“</span>
        <p>Si donc le Fils vous affranchit, vous serez réellement libres.</p>
        <strong>Jean 8:36</strong>
      </div>
      <small className="sidebar-footer">© 2026 Gospel Break Chain Ministry</small>
    </aside>

    <main className="admin-main dashboard-main">
      <header className="dashboard-header">
        <div className="header-title">
          <button className="mobile-menu" aria-label="Menu">☰</button>
          <div>
            <p className="dashboard-eyebrow">TABLEAU DE BORD</p>
            <h1>Bonjour Pasteur <span>👋</span></h1>
            <p>Voici ce qui se passe dans votre ministère aujourd’hui.</p>
          </div>
        </div>
        <div className="header-tools">
          <label className="dashboard-search"><input placeholder="Rechercher..." aria-label="Rechercher"/><span>⌕</span></label>
          <button className="notification" aria-label="Notifications">♧<b>{totalRequests}</b></button>
          <div className="pastor-profile"><span className="pastor-avatar">JE</span><div><strong>Pasteur</strong><span>Jean Emmanuel</span></div><b>⌄</b></div>
        </div>
      </header>

      {error && <div className="form-error dashboard-error">{error}</div>}

      <section className="stats-grid">
        <StatCard icon="◉" tone="prayer" label="Demandes de prière" value={loading ? '—' : prayerCount} detail="Demandes reçues" to="/admin/prayer-requests" />
        <StatCard icon="♡" tone="help" label="Demandes d’aide" value={loading ? '—' : helpCount} detail="Personnes à accompagner" to="/admin/help-requests" />
        <StatCard icon="▱" tone="testimonial" label="Témoignages" value={loading ? '—' : testimonialCount} detail="À consulter / modérer" to="/admin/testimonials" />
        <StatCard icon="▤" tone="content" label="Contenus publiés" value={loading ? '—' : contentCount} detail="Ministères, programmes, événements..." to="/admin" />
      </section>

      <section className="dashboard-grid dashboard-top-grid">
        <div className="dashboard-panel priority-panel">
          <div className="panel-head"><div><span className="dashboard-label">ACTION IMMÉDIATE</span><h2>À traiter en priorité</h2></div><Link to="/admin">Voir tout →</Link></div>
          <div className="priority-list">
            <Link to="/admin/prayer-requests" className="priority-item prayer"><span className="priority-icon">◉</span><div><strong>Demandes de prière</strong><small>{prayerCount} en attente de consultation</small></div><b>{prayerCount}</b><span>›</span></Link>
            <Link to="/admin/help-requests" className="priority-item help"><span className="priority-icon">♡</span><div><strong>Demandes d’aide</strong><small>{helpCount} en attente d’assistance</small></div><b>{helpCount}</b><span>›</span></Link>
            <Link to="/admin/testimonials" className="priority-item testimonial"><span className="priority-icon">▱</span><div><strong>Témoignages à consulter</strong><small>{testimonialCount} témoignages reçus</small></div><b>{testimonialCount}</b><span>›</span></Link>
          </div>
        </div>

        <div className="dashboard-panel request-overview">
          <div className="panel-head"><div><span className="dashboard-label">VUE D’ENSEMBLE</span><h2>Répartition des demandes</h2></div></div>
          <div className="donut-wrap">
            <div className="donut" style={{ '--prayer': `${pendingRatio}%`, '--help': `${totalRequests ? Math.round((helpCount / totalRequests) * 100) : 0}%` }}><div><strong>{totalRequests}</strong><span>demandes</span></div></div>
            <div className="legend"><span><i className="dot prayer-dot"/>Prière <b>{prayerCount}</b></span><span><i className="dot help-dot"/>Aide <b>{helpCount}</b></span><span><i className="dot testimonial-dot"/>Témoignages <b>{testimonialCount}</b></span></div>
          </div>
          <Link className="panel-action" to="/admin">Voir le rapport complet →</Link>
        </div>

        <EmptyPaymentCard />
      </section>

      <section className="dashboard-panel activity-panel">
        <div className="panel-head"><div><span className="dashboard-label">SUIVI</span><h2>Activité récente</h2></div><Link to="/admin">Voir toute l’activité →</Link></div>
        <div className="activity-list">
          {activity.map(item => <Link to={item.to} className="activity-row" key={item.title}><span className={`activity-icon ${item.tone}`}>{item.icon}</span><div><strong>{item.title}</strong><small>{item.value} élément{item.value > 1 ? 's' : ''} actuellement enregistré{item.value > 1 ? 's' : ''}</small></div><span className="activity-time">{item.time}</span><span className="activity-action">Voir →</span></Link>)}
          <div className="activity-row static"><span className="activity-icon content">▤</span><div><strong>Contenu du site</strong><small>{contentCount} contenus disponibles dans l’administration</small></div><span className="activity-time">—</span><Link className="activity-action" to="/admin">Gérer →</Link></div>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel quick-panel">
          <div className="panel-head"><div><span className="dashboard-label">ACCÈS RAPIDE</span><h2>Gérer le ministère</h2></div></div>
          <div className="quick-actions"><Link to="/admin/ministries"><b>+</b><span>Ajouter un ministère</span></Link><Link to="/admin/programs"><b>+</b><span>Ajouter un programme</span></Link><Link to="/admin/events"><b>+</b><span>Créer un événement</span></Link><Link to="/admin/settings"><b>⚙</b><span>Modifier les informations</span></Link></div>
        </div>
        <div className="dashboard-panel vision-panel"><span className="dashboard-label">VISION DU MINISTÈRE</span><h2>Briser les chaînes · Libérer les captifs · Restaurer les vies</h2><p>Le tableau de bord centralise les demandes reçues et les contenus que le pasteur doit administrer.</p><Link to="/" target="_blank">Voir le site public →</Link></div>
      </section>
    </main>
  </div>;
}
