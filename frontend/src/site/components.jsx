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

function useChurchSettings() {
  const [settings, setSettings] = useState(church);
  useEffect(() => {
    let active = true;
    churchApi.church().then((payload) => {
      const value = payload?.data;
      const data = Array.isArray(value) ? value[0] : value;
      if (active && data) setSettings({ ...church, ...data });
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return settings;
}

function scrollToPageTop() { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }

function handleNavigationClick(to, setOpen) {
  setOpen(false);
  if (!to.startsWith('#')) { scrollToPageTop(); return; }
  if (window.location.pathname !== '/') { window.location.href = `/${to}`; return; }
  document.querySelector(to)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(''); return; }
    const ids = ['a-propos', 'pasteur', 'ministeres', 'contact'];
    const handleScroll = () => {
      if (window.scrollY < 180) { setActiveSection(''); return; }
      let current = '';
      ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= 140) current = id; });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true }); handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, location.hash]);
  return activeSection;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useChurchSettings();
  const activeSection = useActiveSection();
  const isLinkActive = (to) => to.startsWith('#') ? location.pathname === '/' && activeSection === to.slice(1) : to === '/' ? location.pathname === '/' && !activeSection : location.pathname === to;

  return <div className="site-header"><header className="header">
    <Link className="brand" to="/" onClick={scrollToPageTop} aria-label={`Accueil ${settings.church_name || settings.name}`}><img src="/logo.svg" alt={settings.church_name || settings.name} /></Link>
    <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>☰</button>
    <nav className={open ? 'nav open' : 'nav'} aria-label="Navigation principale">{navigation.map(([to, label]) => <Link key={to} className={isLinkActive(to) ? 'active' : ''} onClick={(event) => { if (to.startsWith('#')) event.preventDefault(); handleNavigationClick(to, setOpen); }} to={to.startsWith('#') ? `/${to}` : to}>{label}</Link>)}</nav>
    <div className="nav-actions"><Link className={location.pathname === '/help' ? 'help-nav-btn active' : 'help-nav-btn'} onClick={() => { setOpen(false); scrollToPageTop(); }} to="/help">Besoin d'aide ?</Link><Link className="donate-btn" onClick={() => { setOpen(false); scrollToPageTop(); }} to="/donate">Soutenir la mission</Link></div>
  </header></div>;
}

export function Footer() {
  const settings = useChurchSettings();
  const whatsapp = settings.phone ? `https://wa.me/${String(settings.phone).replace(/\D/g, '')}` : WHATSAPP_URL;
  const name = settings.church_name || settings.name || church.name;
  const goHomeSection = (id) => { if (window.location.pathname !== '/') { window.location.href = `/#${id}`; return; } document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <footer className="footer"><div className="footer-main"><div className="footer-brand-group"><img src="/logo.svg" className="footer-logo" alt={name} /><p>Un ministère envoyé sur le terrain pour annoncer l’Évangile, restaurer les vies et servir les communautés.</p></div><div className="footer-group"><h4>Liens rapides</h4><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('a-propos')}>À propos</button><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('ministeres')}>Domaines de service</button><button type="button" className="footer-anchor-link" onClick={() => goHomeSection('contact')}>Contact</button></div><div className="footer-group"><h4>Actions</h4><Link to="/prayer" onClick={scrollToPageTop}>Demande de prière</Link><Link to="/donate" onClick={scrollToPageTop}>Soutenir la mission</Link><Link to="/testimonials" onClick={scrollToPageTop}>Témoignages</Link><Link to="/help" onClick={scrollToPageTop}>Besoin d'accompagnement</Link></div><div className="footer-group footer-contact-group"><h4>Nous contacter</h4><span>{settings.address || 'Mora, Extrême-Nord'}</span><span>{settings.email || ''}</span><div className="footer-social-links" aria-label="Réseaux sociaux"><a className="footer-social-link footer-whatsapp-link" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Contacter sur WhatsApp" title="WhatsApp"><svg className="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.52 3.48A11.78 11.78 0 0 0 12.04.02C5.54.02.25 5.3.25 11.8c0 2.08.54 4.1 1.57 5.9L.15 23.85l6.3-1.64a11.76 11.76 0 0 0 5.58 1.42h.01c6.49 0 11.77-5.28 11.77-11.78 0-3.15-1.23-6.1-3.29-8.37ZM12.04 21.6a9.76 9.76 0 0 1-4.98-1.36l-.36-.21-3.74.98 1-3.65-.23-.37a9.78 9.78 0 1 1 8.31 4.61Zm5.36-7.33c-.29-.14-1.72-.85-1.99-.95-.27-.1-.46-.14-.65.14-.19.29-.75.95-.92 1.14-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5h-.55c-.19 0-.5.07-.77.36-.27.29-1.01.99-1.01 2.42 0 1.43 1.03 2.8 1.17 2.99.14.19 2.03 3.1 4.91 4.34.69.3 1.23.49 1.65.62.69.22 1.32.19 1.82.12.55-.08 1.72-.7 1.96-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.33Z" /></svg></a></div><Link className="footer-pastor-link" onClick={scrollToPageTop} to="/admin">Espace Pasteur →</Link></div></div><div className="footer-bottom"><span>© 2026 {name}. Gospel Break Chain Ministry. Tous droits réservés.</span></div></footer>;
}

export function PageHero({ eyebrow = 'GOSPEL BREAK CHAIN MINISTRY', title, text }) {
  const verse = useBibleVerse(6000);
  return <section className="page-hero"><div className="page-hero-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p className="page-hero-text">{text}</p>}<div className="hero-verse" key={verse.id}><p className="verse">« {verse.text} »</p><b>{verse.reference}</b></div></div><div className="hero-ornament" aria-hidden="true">✦</div></section>;
}

export function SectionTitle({ eyebrow, title, text, action }) { return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>; }

export function CTA({ children, to = '/contact', dark = false }) { return <Link className={dark ? 'btn outline' : 'btn'} onClick={scrollToPageTop} to={to}>{children} <span>→</span></Link>; }
