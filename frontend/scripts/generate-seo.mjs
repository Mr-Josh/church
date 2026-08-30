import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/$/, '');
const routes = ['/', '/events', '/testimonials', '/prayer', '/evangelism', '/help', '/donate'];

fs.mkdirSync(publicDir, { recursive: true });

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /dev',
  siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : '',
  '',
].filter(Boolean).join('\n');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

if (siteUrl) {
  const urls = routes.map((route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc></url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`SEO: generated sitemap for ${siteUrl}`);
} else {
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) fs.rmSync(sitemapPath);
  console.log('SEO: VITE_SITE_URL/SITE_URL not set; sitemap generation skipped.');
}
