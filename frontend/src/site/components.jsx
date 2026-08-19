import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { church, WHATSAPP_URL } from './config';
import { navigation } from './data';
import { churchApi } from '../services/churchApi';
import { useBibleVerse } from '../useBibleVerse';
import './footer.css';
import './hero.css';
import './fixed-navbar.css';
import './anchor-sections.css';

function normalizeChurchSettings(payload) {
  const value = payload?.data;
  return Array.isArray(value) ? (value[0] || {}) : (value || {});
}

function useChurchSettings() {
  const [settings, setSettings] = useState(church);
  useEffect(() => {
    let active = true;
    churchApi.church().then((payload) => {
      const data = normalizeChurchSettings(payload);
      if (active && data && typeof data === 'object') setSettings({ ...church, ...data });
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return settings;
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function handleNavigationClick(to, setOpen) {
  setOpen(false);
  if (to.startsWith('#')) {
    if (window.location.pathname !== '/') {
      window.location.href = `/${to}`;
      return;
    }
    document.querySelector(to)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  scrollToPageTop();
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useChurchSettings();

  return (
    <div className="site-header">
      <header className="header">
        <Link className="brand" to="/" onClick={scrollToPageTop} aria-label={`Accueil ${settings.church_name || settings.name}`}>
          <img src="/logo.svg" alt={settings.church_name || settings.name} />
        </Link>
        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>☰</button>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Navigation principale">
          {navigation.map(([to, label]) => (
            <Link key={to} className={to.startsWith('#') && location.pathname === '/' ? 'anchor-nav-link' : location.pathname === to ? 'active' : ''} onClick={(event) => { if (to.startsWith('#')) event.preventDefault(); handleNavigationClick(to, setOpen); }} to={to.startsWith('#') ? `/${to}` : to}>
              {label}
            </Link>
          ))}
          <Link className={location.pathname === '/help' ? 'help-nav-btn active' : 'help-nav-btn'} onClick={() => { setOpen(false); scrollToPageTop(); }} to="/help">Besoin d’aide ?</Link>
          <Link className="donate-btn" onClick={() => { setOpen(false); scrollToPageTop(); }} to="/donate">Faire un don</Link>
        </nav>
      </header>
    </div>
  );
}

export function Footer() {
  const settings = useChurchSettings();
  const whatsapp = settings.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}` : WHATSAPP_URL;
  const name = settings.church_name || settings.name || church.name;

  const goHomeSection = (id) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-group"><img src="/logo.svg" className="footer-logo" alt={name} /><p>Nous existons pour glorifier Dieu, édifier les saints et impacter notre génération par l’Évangile.</p></div>
        <div className="footer-group"><h4>Liens rapides</h4><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('a-propos')}>À propos</button><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('ministeres')}>Ministères</button><Link to="/events" onClick={scrollToPageTop}>Événements</Link><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('contact')}>Contact</button></div>
        <div className="footer-group"><h4>Nos services</h4><Link to="/prayer" onClick={scrollToPageTop}>Demande de prière</Link><Link to="/donate" onClick={scrollToPageTop}>Faire un don</Link><Link to="/testimonials" onClick={scrollToPageTop}>Témoignages</Link><Link to="/help" onClick={scrollToPageTop}>Assistance</Link></div>
        <div className="footer-group footer-contact-group"><h4>Contactez-nous</h4><span>{settings.address}</span><span>{settings.phone}</span><span>{settings.email}</span><a href={whatsapp}>WhatsApp</a><Link className="footer-pastor-link" onClick={scrollToPageTop} to="/admin">Espace Pasteur →</Link></div>
      </div>
      <div className="footer-bottom"><span>© 2026 {name}. Tous droits réservés.</span><span>Mentions légales · Politique de confidentialité</span></div>
    </footer>
  );
}

export function PageHero({ eyebrow = 'GOSPEL BREAK CHAIN MINISTRY', title, text }) {
  const verse = useBibleVerse(6000);
  return <section className="page-hero"><div className="page-hero-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p className="page-hero-text">{text}</p>}<div className="hero-verse" key={verse.id}><p className="verse">« {verse.text} »</p><b>{verse.reference}</b></div></div><div className="hero-ornament" aria-hidden="true">✦</div></section>;
}

export function SectionTitle({ eyebrow, title, text, action }) {
  return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>;
}

export function CTA({ children, to = '/contact', dark = false }) {
  return <Link className={dark ? 'btn outline' : 'btn'} onClick={scrollToPageTop} to={to}>{children} <span>→</span></Link>;
}
