import React from "react";
import { Link } from "react-router-dom";

const sections = [
  [
    "Ministères",
    "Organisez les ministères et leurs descriptions.",
    "/admin/ministries",
    "⌂",
  ],
  [
    "Programmes",
    "Gérez les horaires et rendez-vous réguliers.",
    "/admin/programs",
    "◷",
  ],
  [
    "Événements",
    "Publiez les prochains temps forts de l’église.",
    "/admin/events",
    "▣",
  ],
  [
    "Témoignages",
    "Consultez et modérez les témoignages reçus.",
    "/admin/testimonials",
    "▱",
  ],
];

export default function AdminContentPage() {
  return (
    <section className="content-hub-grid">
      {sections.map(([title, description, to, icon]) => (
        <Link className="content-hub-card" to={to} key={title}>
          <span>{icon}</span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <b>→</b>
        </Link>
      ))}
    </section>
  );
}
