import { readFile } from 'node:fs/promises';

const index = await readFile('index.html', 'utf8');
const entry = await readFile('src/AppEntry.jsx', 'utf8');
const publicApp = await readFile('src/site/PublicApp.jsx', 'utf8');
const adminApp = await readFile('src/admin/AdminApp.jsx', 'utf8');
const main = await readFile('src/main.jsx', 'utf8');

const checks = [
  ['index.html uses AppEntry', index.includes('/src/AppEntry.jsx')],
  ['index.html does not load live.jsx', !index.includes('/src/live.jsx')],
  ['AppEntry imports PublicApp', entry.includes("from './site/PublicApp'" )],
  ['AppEntry imports AdminApp', entry.includes("from './admin/AdminApp'" )],
  ['AppEntry imports styles before responsive styles', entry.indexOf("'./styles.css'") < entry.indexOf("'./responsive.css'")],
  ['PublicApp owns public routes', publicApp.includes('<Route path="/donate" element={<Donate />} />')],
  ['AdminApp owns admin routes', adminApp.includes('<Route path="/admin/settings" element={<AdminSettings />} />')],
  ['Legacy main is not the HTML entrypoint', !index.includes('/src/main.jsx')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);

if (main.includes("const WA='https://wa.me/237690558623'")) {
  console.log('INFO legacy main.jsx still contains the old duplicated WhatsApp constant; it must be removed after the new entrypoint is validated.');
}

if (failed.length) process.exit(1);
