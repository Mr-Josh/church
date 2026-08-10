import { access, readFile } from 'node:fs/promises';

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const index = await readFile('index.html', 'utf8');
const entry = await readFile('src/AppEntry.jsx', 'utf8');
const publicApp = await readFile('src/site/PublicApp.jsx', 'utf8');
const adminApp = await readFile('src/admin/AdminApp.jsx', 'utf8');
const contentPages = await readFile('src/site/pages/ContentPages.jsx', 'utf8');
const interactionPages = await readFile('src/site/pages/InteractionPages.jsx', 'utf8');

const [legacyMainExists, legacyLiveExists, duplicateApiExists] = await Promise.all([
  exists('src/main.jsx'),
  exists('src/live.jsx'),
  exists('src/site/api.js'),
]);

const checks = [
  ['index.html uses AppEntry', index.includes('/src/AppEntry.jsx')],
  ['index.html does not load legacy main.jsx', !index.includes('/src/main.jsx')],
  ['index.html does not load legacy live.jsx', !index.includes('/src/live.jsx')],
  ['AppEntry imports PublicApp', entry.includes("from './site/PublicApp'")],
  ['AppEntry imports AdminApp', entry.includes("from './admin/AdminApp'")],
  ['AppEntry imports styles before responsive styles', entry.indexOf("'./styles.css'") < entry.indexOf("'./responsive.css'")],
  ['PublicApp owns public routes', publicApp.includes('<Route path="/donate" element={<Donate />} />')],
  ['AdminApp owns admin routes', adminApp.includes('<Route path="/admin/settings" element={<AdminSettings />} />')],
  ['Public content uses the existing church API service', contentPages.includes("import { churchApi } from '../../services/churchApi';")],
  ['Interaction pages use the existing church API service', interactionPages.includes("import { churchApi } from '../../services/churchApi';")],
  ['Legacy main.jsx is removed', !legacyMainExists],
  ['Legacy live.jsx is removed', !legacyLiveExists],
  ['Duplicate site API adapter is removed', !duplicateApiExists],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);

if (failed.length) process.exit(1);
