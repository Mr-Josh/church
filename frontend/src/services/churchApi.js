import { requestFailed, requestFinished, requestStarted, requestSucceeded, setupStateAccessibility } from '../uiStates';
import '../uiStates.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
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

export const churchApi = {
  health: () => request('/health'), church: () => request('/church'), ministries: () => request('/ministries'), programs: () => request('/programs'), events: () => request('/events'), sermons: () => request('/sermons'), gallery: () => request('/gallery'), testimonials: () => request('/testimonials'),
  submitPrayerRequest: (data) => request('/prayer-requests', { method: 'POST', body: JSON.stringify(data) }),
  submitHelpRequest: (data) => request('/help-requests', { method: 'POST', body: JSON.stringify(data) }),
  submitTestimonial: (data) => request('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  dev: {
    summary: () => request('/dev/summary'),
    database: () => request('/dev/database'),
    security: () => request('/dev/security'),
    audit: () => request('/dev/audit'),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    churchSettings: () => request('/admin/church-settings'),
    updateChurchSettings: (data) => request('/admin/church-settings', { method: 'PATCH', body: JSON.stringify(data) }),
    list: (resource) => request(`/admin/${resource}`), get: (resource, id) => request(`/admin/${resource}/${id}`),
    create: (resource, data) => request(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (resource, id, data) => request(`/admin/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (resource, id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' }),
  },
};
