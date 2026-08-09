import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="page">
      <header className="header">
        <strong>Gospel Break Chain Ministry</strong>
        <a href="https://wa.me/237600000000">WhatsApp</a>
      </header>
      <section className="hero">
        <p className="eyebrow">Gospel Break Chain Ministry</p>
        <h1>Brisons les chaînes par le pouvoir de Christ.</h1>
        <p>Gagner les âmes, faire des disciples et impacter notre génération par la Parole de Dieu et l’amour du Christ.</p>
        <div className="actions">
          <a className="primary" href="#programmes">Voir les programmes</a>
          <a className="secondary" href="https://wa.me/237600000000">Nous contacter sur WhatsApp</a>
        </div>
      </section>
      <section id="programmes" className="section">
        <h2>Nos programmes</h2>
        <div className="cards">
          {['Culte dominical', 'Culte de prière', 'Veillée de prières', 'École du dimanche'].map((item) => (
            <article className="card" key={item}><h3>{item}</h3><p>Informations du programme disponibles prochainement.</p></article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
