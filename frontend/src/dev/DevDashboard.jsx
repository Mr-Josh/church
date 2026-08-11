import React from 'react';
import { Link } from 'react-router-dom';

export default function DevDashboard() {
  return (
    <div className="dev-page">
      <div className="dev-page-heading">
        <div><span>OVERVIEW</span><h2>Console développeur</h2><p>Administration technique du site et des accès.</p></div>
      </div>
      <div className="dev-cards">
        <article><small>ACCÈS</small><strong>Utilisateurs</strong><p>Gérez les comptes et leurs accès sans intervenir directement dans la base de données.</p><Link to="/dev/users">Gérer les utilisateurs →</Link></article>
        <article><small>SÉCURITÉ</small><strong>Rôles séparés</strong><p>L'espace développeur est distinct de l'administration pastorale et n'expose pas les informations de l'église.</p></article>
        <article><small>SYSTÈME</small><strong>Console technique</strong><p>Cette zone est destinée aux opérations techniques du site.</p></article>
      </div>
      <div className="dev-notice"><strong>Limite volontaire</strong><span>Les informations de l'église restent dans l'espace Pasteur et ne sont pas administrables depuis cette console.</span></div>
    </div>
  );
}
