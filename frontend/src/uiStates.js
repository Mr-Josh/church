let stateRoot = null;
let progress = null;
let activeGets = 0;
let toastTimer = null;

function ensureRoot() {
  if (typeof document === 'undefined') return null;
  if (stateRoot?.isConnected) return stateRoot;
  stateRoot = document.createElement('div');
  stateRoot.id = 'app-state-layer';
  stateRoot.setAttribute('aria-live', 'polite');
  stateRoot.setAttribute('aria-atomic', 'true');
  document.body.appendChild(stateRoot);
  return stateRoot;
}

function setProgress(visible) {
  const root = ensureRoot(); if (!root) return;
  if (!progress) { progress = document.createElement('div'); progress.className = 'request-progress'; progress.setAttribute('role', 'progressbar'); progress.setAttribute('aria-label', 'Chargement'); root.appendChild(progress); }
  progress.classList.toggle('is-visible', visible);
}

function toast(title, text, type = 'success') {
  const root = ensureRoot(); if (!root) return;
  root.querySelectorAll('.state-toast').forEach(node => node.remove());
  const item = document.createElement('div'); item.className = `state-toast state-toast--${type}`;
  const heading = document.createElement('strong'); heading.textContent = title;
  const body = document.createElement('span'); body.textContent = text;
  item.append(heading, body); root.appendChild(item);
  requestAnimationFrame(() => item.classList.add('is-visible'));
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { item.classList.remove('is-visible'); window.setTimeout(() => item.remove(), 220); }, 3600);
}

export function requestStarted(method) {
  if (method === 'GET' || method === 'HEAD') { activeGets += 1; setProgress(true); }
}

export function requestFinished(method) {
  if (method === 'GET' || method === 'HEAD') { activeGets = Math.max(0, activeGets - 1); if (!activeGets) setProgress(false); }
}

export function requestSucceeded(method, path) {
  if (method !== 'GET' && method !== 'HEAD') toast(path.includes('login') ? 'Connexion réussie' : 'Action enregistrée', path.includes('login') ? 'Vous êtes maintenant connecté.' : 'La modification a bien été enregistrée.');
}

export function requestFailed(method, path, error, retry) {
  requestFinished(method);
  const message = error?.message || 'Une erreur est survenue. Vérifiez votre connexion puis réessayez.';
  if (method !== 'GET' && method !== 'HEAD') toast('Action impossible', message, 'error');
  else toast('Connexion indisponible', message, 'error');
}

export function setupStateAccessibility() {
  if (typeof document === 'undefined') return;
  ensureRoot();
  document.documentElement.classList.add('state-ui-ready');
  if (document.documentElement.dataset.stateErrorsInstalled) return;
  document.documentElement.dataset.stateErrorsInstalled = 'true';
  window.addEventListener('error', event => { if (event.error) toast('Erreur inattendue', 'Une erreur technique est survenue. Veuillez réessayer.', 'error'); });
  window.addEventListener('unhandledrejection', () => toast('Erreur inattendue', 'Une opération n’a pas pu être terminée.', 'error'));
}
