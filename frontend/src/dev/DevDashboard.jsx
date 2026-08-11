import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

export default function DevDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    churchApi.dev.summary()
      .then((payload) => { if (mounted) setSummary(payload?.data || null); })
      .catch((err) => { if (mounted) setError(err?.message || 'Impossible de charger le résumé technique.'); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="dev-page">
      <div className="dev-page-heading">
        <div><span>OVERVIEW</span><h2>Console développeur</h2><p>Administration technique du site et des accès.</p></div>
      </div>

      <section className="dev-summary-grid" aria-label="Résumé opérationnel">
        <article><small>UTILISATEURS ACTIFS</small><strong>{summary?.active_users ?? '—'}</strong><p>Comptes actifs dans la base partagée.</p></article>
        <article><small>ADMINISTRATEURS</small><strong>{summary?.active_admins ?? '—'}</strong><p>Comptes qui administrent l’interface de l’église.</p></article>
        <article><small>DÉVELOPPEURS</small><strong>{summary?.active_developers ?? '—'}</strong><p>Comptes autorisés à utiliser la console technique.</p></article>
        <article><small>COMPTE PRINCIPAL</small><strong>{summary ? (summary.primary_account_configured ? 'Configuré' : 'Non configuré') : '—'}</strong><p>Aucun détail du profil de l’église n’est exposé ici.</p></article>
      </section>

      {error && <div className="dev-error">{error}</div>}

      <div className="dev-cards">
        <article><small>ACCÈS</small><strong>Utilisateurs</strong><p>Gérez les comptes développeur sans intervenir directement dans la base de données.</p><Link to="/dev/users">Gérer les développeurs →</Link></article>
        <article><small>SÉPARATION</small><strong>Données de l’église</strong><p>La console peut connaître quelques indicateurs opérationnels, mais elle ne peut pas consulter ni modifier le profil détaillé de l’église.</p></article>
        <article><small>SYSTÈME</small><strong>Console technique</strong><p>Les opérations techniques restent séparées de l'administration pastorale.</p></article>
      </div>
    </div>
  );
}
