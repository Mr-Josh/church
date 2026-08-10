import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const required = [
  "import AdminLogin from './admin/AdminLogin'",
  "import AdminDashboard from './admin/AdminDashboard'",
  "import AdminResourcePage from './admin/AdminResourcePage'",
  "import AdminSettings from './admin/AdminSettings'",
  "import AdminRequestsPage from './admin/AdminRequestsPage'",
  "import AdminContentPage from './admin/AdminContentPage'",
  'AdminLogin',
  'AdminDashboard',
  'AdminRequestsPage',
  'AdminResourcePage',
  'AdminContentPage',
  'AdminSettings',
  '/admin/prayer-requests',
  '/admin/help-requests',
  '/admin/testimonials',
  '/admin/content',
  '/admin/settings',
];

const missing = required.filter(token => !source.includes(token));
if (missing.length) {
  console.error('Production entry is missing admin wiring:', missing);
  process.exit(1);
}

console.log('Admin production entry wiring verified.');
