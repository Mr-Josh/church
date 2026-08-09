const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Une erreur est survenue.');
  }
  return payload;
}

export const churchApi = {
  health: () => request('/health'),
  church: () => request('/church'),
  ministries: () => request('/ministries'),
  programs: () => request('/programs'),
  events: () => request('/events'),
  sermons: () => request('/sermons'),
  gallery: () => request('/gallery'),
  testimonials: () => request('/testimonials'),

  submitPrayerRequest: (data) => request('/prayer-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submitHelpRequest: (data) => request('/help-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submitTestimonial: (data) => request('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  admin: {
    dashboard: () => request('/admin/dashboard'),
    churchSettings: () => request('/admin/church-settings'),
    updateChurchSettings: (data) => request('/admin/church-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    list: (resource) => request(`/admin/${resource}`),
    get: (resource, id) => request(`/admin/${resource}/${id}`),
    create: (resource, data) => request(`/admin/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (resource, id, data) => request(`/admin/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    remove: (resource, id) => request(`/admin/${resource}/${id}`, {
      method: 'DELETE',
    }),
  },
};
