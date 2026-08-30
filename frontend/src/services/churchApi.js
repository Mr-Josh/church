import { requestFailed, requestFinished, requestStarted, requestSucceeded, setupStateAccessibility } from '../uiStates';
import '../uiStates.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const mediaUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};
setupStateAccessibility();

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const retry = () => request(path, options);
  requestStarted(method, path, retry);
  try {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Une erreur est survenue.');
    requestSucceeded(method, path); requestFinished(method, path); return payload;
  } catch (error) { requestFailed(method, path, error, retry); throw error; }
}

async function upload(file, folder = 'events') {
  const form = new FormData(); form.append('file', file); form.append('folder', folder);
  const response = await fetch(`${API_BASE}/admin/uploads`, { method: 'POST', credentials: 'include', body: form });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Échec du téléversement.');
  return payload;
}

let churchSettingsCache = null;
let churchSettingsCacheAt = 0;
const CHURCH_SETTINGS_TTL = 60_000;

async function requestChurchSettings({ force = false } = {}) {
  const now = Date.now();
  if (!force && churchSettingsCache && now - churchSettingsCacheAt < CHURCH_SETTINGS_TTL) return churchSettingsCache;
  const payload = await request('/church');
  const value = payload?.data;
  const normalized = { ...payload, data: Array.isArray(value) ? (value[0] || {}) : (value || {}) };
  churchSettingsCache = normalized;
  churchSettingsCacheAt = now;
  return normalized;
}

export const churchApi = {
  health: () => request('/health'),
  church: requestChurchSettings,
  refreshChurch: () => requestChurchSettings({ force: true }),
  ministries: () => request('/ministries'), events: () => request('/events'), testimonials: () => request('/testimonials'),
  submitPrayerRequest: (data) => request('/prayer-requests', { method: 'POST', body: JSON.stringify(data) }), submitHelpRequest: (data) => request('/help-requests', { method: 'POST', body: JSON.stringify(data) }), submitTestimonial: (data) => request('/testimonials', { method: 'POST', body: JSON.stringify(data) }), submitDonation: (data) => request('/donations', { method: 'POST', body: JSON.stringify(data) }),
  initiateDonation: (data) => request('/donations/initiate', { method: 'POST', body: JSON.stringify(data) }), getDonationStatus: (ref) => request(`/donations/status?ref=${encodeURIComponent(ref)}`), confirmDonation: (id, data = {}) => request(`/donations/confirm/${id}`, { method: 'POST', body: JSON.stringify(data) }), login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }), logout: () => request('/auth/logout', { method: 'POST' }),
  dev: { summary: () => request('/dev/summary'), database: () => request('/dev/database'), security: () => request('/dev/security'), audit: () => request('/dev/audit'), system: () => request('/dev/system'), session: () => request('/dev/session'), diagnostics: () => request('/dev/diagnostics') },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    churchSettings: () => request('/admin/church-settings'),
    updateChurchSettings: async (data) => { const result = await request('/admin/church-settings', { method: 'PATCH', body: JSON.stringify(data) }); churchSettingsCache = null; churchSettingsCacheAt = 0; return result; },
    list: (resource) => request(`/admin/${resource}`), get: (resource, id) => request(`/admin/${resource}/${id}`), create: (resource, data) => request(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(data) }), update: (resource, id, data) => request(`/admin/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), remove: (resource, id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' }), upload, addPhoto: (eventId, data) => request(`/admin/events/${eventId}/photos`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
