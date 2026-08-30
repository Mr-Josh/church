import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Gospel Break Chain Ministry | Ministère chrétien au Cameroun';
const DEFAULT_DESCRIPTION = "Gospel Break Chain Ministry est un ministère chrétien engagé dans l'évangélisation, les missions de terrain, la prière, l'accompagnement et le soutien des communautés vulnérables au Cameroun.";
const SITE_NAME = 'Gospel Break Chain Ministry';

const pages = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, type: 'website' },
  '/events': { title: 'Événements et actions de terrain | Gospel Break Chain Ministry', description: 'Découvrez les événements à venir, les actions en cours et les missions réalisées par Gospel Break Chain Ministry sur le terrain.', type: 'website' },
  '/testimonials': { title: 'Témoignages | Gospel Break Chain Ministry', description: 'Découvrez les témoignages de personnes accompagnées et partagez votre propre témoignage avec Gospel Break Chain Ministry.', type: 'website' },
  '/prayer': { title: 'Demande de prière | Gospel Break Chain Ministry', description: 'Confiez votre sujet de prière à Gospel Break Chain Ministry. Votre demande peut être transmise à notre équipe dans la confidentialité.', type: 'website' },
  '/evangelism': { title: "Évangélisation et foi chrétienne | Gospel Break Chain Ministry", description: "Découvrez l'Évangile de Jésus-Christ et les ressources d'accompagnement proposées par Gospel Break Chain Ministry.", type: 'website' },
  '/help': { title: 'Assistance et accompagnement | Gospel Break Chain Ministry', description: "Besoin d'information, de prière ou d'accompagnement ? Contactez Gospel Break Chain Ministry au Cameroun.", type: 'website' },
  '/donate': { title: 'Soutenir la mission | Faire un don | Gospel Break Chain Ministry', description: "Soutenez les missions, l'évangélisation, l'accompagnement et les actions auprès des communautés vulnérables.", type: 'website' },
};

function upsertMeta(attribute, value, content) {
  let node = document.head.querySelector(`meta[${attribute}="${value}"]`);
  if (!node) { node = document.createElement('meta'); node.setAttribute(attribute, value); document.head.appendChild(node); }
  node.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) { node = document.createElement('link'); node.setAttribute('rel', rel); document.head.appendChild(node); }
  node.setAttribute('href', href);
}

function setStructuredData(url) {
  const id = 'gospel-break-structured-data';
  let node = document.getElementById(id);
  if (!node) { node = document.createElement('script'); node.id = id; node.type = 'application/ld+json'; document.head.appendChild(node); }
  node.textContent = JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url, logo: `${url}/logo.svg`, email: 'narcisse.arenthes@yahoo.fr', telephone: '+237694880056', address: { '@type': 'PostalAddress', addressLocality: 'Mora', addressRegion: 'Extrême-Nord', addressCountry: 'CM' }, areaServed: 'CM' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url, inLanguage: 'fr-FR' },
  ]);
}

export default function SEO() {
  const { pathname: rawPathname } = useLocation();
  const pathname = rawPathname.replace(/\/$/, '') || '/';
  const page = pages[pathname] || { title: 'Page introuvable | Gospel Break Chain Ministry', description: DEFAULT_DESCRIPTION, type: 'website' };

  useEffect(() => {
    const origin = window.location.origin;
    const canonical = `${origin}${pathname === '/' ? '/' : pathname}`;
    document.documentElement.lang = 'fr';
    document.title = page.title;
    upsertMeta('name', 'description', page.description);
    upsertMeta('name', 'robots', pages[pathname] ? 'index,follow' : 'noindex,follow');
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'referrer', 'strict-origin-when-cross-origin');
    upsertMeta('property', 'og:title', page.title);
    upsertMeta('property', 'og:description', page.description);
    upsertMeta('property', 'og:type', page.type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'fr_FR');
    upsertMeta('property', 'og:image', `${origin}/hero-logo.webp`);
    upsertMeta('property', 'og:image:alt', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', page.title);
    upsertMeta('name', 'twitter:description', page.description);
    upsertMeta('name', 'twitter:image', `${origin}/hero-logo.webp`);
    upsertLink('canonical', canonical);
    setStructuredData(origin);
  }, [pathname, page.description, page.title, page.type]);

  return null;
}
