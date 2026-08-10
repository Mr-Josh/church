import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import './admin.css';

const sections = [
  ['Ministères', 'Organisez les ministères et leurs descriptions.', '/admin/ministries', '⌂'],
  ['Programmes', 'Gérez les horaires et rendez-vous réguliers.', '/admin/programs', '◷'],
  ['Événements', 'Publiez les prochains temps forts de l’église.', '/admin/events', '▣'],
  ['Prédications', 'Gérez les enseignements, vidéos, audios et PDF.', '/admin/sermons', '▶'],
  ['Galerie', 'Gérez les médias affichés sur le site.', '/admin/gallery', '▧'],
  ['Témoignages', 'Consultez et modérez les témoignages reçus.', '/admin/testimonials', '▱'],
];

export default function AdminContentPage() {
  return <AdminLayout active="content" title="Contenu du site" description="Gérez les éléments visibles sur le site public.">
    <section className="content-hub-grid">
      {sections.map(([title, description, to, icon]) => <Link className="content-hub-card" to={to} key={title}>
        <span aria-hidden="true">{icon}</span><div><h2>{title}</h2><p>{description}</p></div><b aria-hidden="true">→</b>
      </Link>)}
    </section>
  </AdminLayout>;
}
