import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { church, WHATSAPP_URL } from './config';
import { navigation } from './data';
import { churchApi } from '../services/churchApi';
import './footer.css';
import './hero.css';

function useChurchSettings() {
  const [settings, setSettings] = useState(church);

  useEffect(() => {
    let active = true;
    churchApi.church()
      .then((payload) => {
        const data = payload?.data;
        if (active && data) setSettings({ ...church, ...data });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return settings;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useChurchSettings();
  const whatsapp = settings.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}` : WHATSAPP_URL;

  return (
    <>
      <div className="topbar">
        <div>
          ☎ {settings.phone} <span>•</span> <a href={whatsapp}>WhatsApp</a> <span>•</span> {settings.email}
        </div>
        <div>Suivez-nous : ◉ ◉ ◉</div>
      </div>
      <header className="header">
        <Link className="brand" to="/" aria-label={`Accueil ${settings.church_name || settings.name}`}>
          <img src="/logo.svg" alt={settings.church_name || settings.name} />
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          ☰
        </button>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Navigation principale">
          {navigation.map(([to, label]) => (
            <Link key={to} className={location.pathname === to ? 'active' : ''} onClick={() => setOpen(false)} to={to}>
              {label}
            </Link>
          ))}
          <Link className="donate-btn" onClick={() => setOpen(false)} to="/donate">Faire un don</Link>
        </nav>
      </header>
    </>
  );
}

export function Footer() {
  const settings = useChurchSettings();
  const whatsapp = settings.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}` : WHATSAPP_URL;
  const name = settings.church_name || settings.name || church.name;

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-group">
          <img src="/logo.svg" className="footer-logo" alt={name} />
          <p>Nous existons pour glorifier Dieu, édifier les saints et impacter notre génération par l’Évangile.</p>
        </div>
        <div className="footer-group">
          <h4>Liens rapides</h4>
          <Link to="/about">À propos</Link><Link to="/ministries">Ministères</Link><Link to="/events">Événements</Link><Link to="/contact">Contact</Link>
        </div>
        <div className="footer-group">
          <h4>Nos services</h4>
          <Link to="/prayer">Demande de prière</Link><Link to="/donate">Faire un don</Link><Link to="/sermons">Prédications</Link><Link to="/testimonials">Témoignages</Link><Link to="/help">Assistance</Link>
        </div>
        <div className="footer-group footer-contact-group">
          <h4>Contactez-nous</h4>
          <span>{settings.address}</span><span>{settings.phone}</span><span>{settings.email}</span><a href={whatsapp}>WhatsApp</a><Link className="footer-pastor-link" to="/admin">Espace Pasteur →</Link>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 {name}. Tous droits réservés.</span><span>Mentions légales · Politique de confidentialité</span></div>
    </footer>
  );
}

export function PageHero({ eyebrow = 'GOSPEL BREAK CHAIN MINISTRY', title, text }) {
  return <section className="page-hero"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p>{text}</p>}</div><div className="hero-ornament" aria-hidden="true">✦</div></section>;
}

export function SectionTitle({ eyebrow, title, text, action }) {
  return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>;
}

export function CTA({ children, to = '/contact', dark = false }) {
  return <Link className={dark ? 'btn outline' : 'btn'} to={to}>{children} <span>→</span></Link>;
}
