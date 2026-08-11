import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

export default function DevDashboard() {
  const [summary, setSummary] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let mounted = true; churchApi.dev.summary().then((r) => { if (mounted) setSummary(r.data || null); }).catch((e) => { if (mounted) setError(e.message || 'Impossible de charger la console.'); }); return () => { mounted = false; }; }, []);
  const content = summary?.content || {};
  const health = summary?.database?.connected;
  return <div className="dev-page">
    <div className="dev-page-heading"><div><span>OVERVIEW</span><h2>Vue générale</h2><p>État opérationnel de l'application et de ses accès techniques.</p></div></div>
    {error && <div className="dev-error">{error}</div>}
    <section className="dev-summary-grid">
      <article><small>API</small><strong><span className="dev-health-dot" /> Operational</strong><p>API accessible depuis la console.</p></article>
      <article><small>BASE DE DONNÉES</small><strong><span className="dev-health-dot" /> {health ? 'Operational' : 'Unavailable'}</strong><p>Connexion MySQL vérifiée côté serveur.</p></article>
      <article><small>UTILISATEURS ACTIFS</small><strong>{summary?.accounts?.active_users ?? '—'}</strong><p>Comptes actifs dans la base partagée.</p></article>
      <article><small>COMPTE PRINCIPAL</small><strong>{summary ? (summary.accounts?.primary_account_configured ? 'Configuré' : 'Non configuré') : '—'}</strong><p>Présence du compte principal uniquement.</p></article>
    </section>
    <div className="dev-section-label">COMPTES & SÉCURITÉ</div>
    <section className="dev-cards">
      <article><small>ADMINISTRATEURS</small><strong>{summary?.accounts?.active_admins ?? '—'}</strong><p>Comptes qui administrent l'interface de l'église.</p><Link to="/dev/security">Voir la sécurité →</Link></article>
      <article><small>DÉVELOPPEURS</small><strong>{summary?.accounts?.active_developers ?? '—'}</strong><p>Comptes autorisés à utiliser la console technique.</p><Link to="/dev/users">Gérer les développeurs →</Link></article>
      <article><small>AUDIT</small><strong>Journal</strong><p>Suivez les opérations réalisées sur les comptes techniques.</p><Link to="/dev/audit">Ouvrir le journal →</Link></article>
    </section>
    <div className="dev-section-label">CONTENU — INDICATEURS UNIQUEMENT</div>
    <section className="dev-summary-grid">
      {Object.entries({ Ministries: content.ministries, Programs: content.programs, Events: content.events, Sermons: content.sermons, Gallery: content.gallery, Testimonials: content.testimonials, 'Prayer requests': content.prayer_requests, 'Help requests': content.help_requests }).map(([label,value]) => <article key={label}><small>{label}</small><strong>{value ?? '—'}</strong><p>Compteur technique, sans accès au contenu détaillé.</p></article>)}
    </section>
    <div className="dev-section-label">APPLICATION</div>
    <section className="dev-cards">
      <article><small>BASE DE DONNÉES</small><strong>Structure</strong><p>Inspectez les tables, moteurs et collations sans exposer les données pastorales.</p><Link to="/dev/database">Inspecter →</Link></article>
      <article><small>SYSTÈME</small><strong>{summary?.system?.php || '—'}</strong><p>Version PHP, serveur et version MySQL de l'environnement.</p><Link to="/dev/system">Voir le système →</Link></article>
      <article><small>MAINTENANCE</small><strong>Diagnostic</strong><p>Les opérations destructives restent volontairement hors de cette console.</p></article>
    </section>
  </div>;
}
