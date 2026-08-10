let stateRoot = null;
let progress = null;
let activeRequests = 0;
let activeMutations = 0;
let delayedSkeletonTimer = null;
let lastRequest = null;

function ensureRoot() {
  if (typeof document === 'undefined') return null;
  if (stateRoot) return stateRoot;
  stateRoot = document.createElement('div');
  stateRoot.id = 'app-state-layer';
  stateRoot.setAttribute('aria-live', 'polite');
  document.body.appendChild(stateRoot);
  return stateRoot;
}

function setProgress(visible) {
  const root = ensureRoot();
  if (!root) return;
  if (!progress) {
    progress = document.createElement('div');
    progress.className = 'request-progress';
    progress.innerHTML = '<span></span>';
    root.appendChild(progress);
  }
  progress.classList.toggle('is-visible', visible);
}

function showSkeleton() {
  const root = ensureRoot();
  if (!root || document.getElementById('global-data-skeleton')) return;
  const skeleton = document.createElement('div');
  skeleton.id = 'global-data-skeleton';
  skeleton.className = 'state-overlay state-overlay--loading';
  skeleton.innerHTML = `
    <div class="state-skeleton" role="status" aria-label="Chargement">
      <div class="state-skeleton__line state-skeleton__line--short"></div>
      <div class="state-skeleton__title"></div>
      <div class="state-skeleton__grid">
        <div class="state-skeleton__card"></div>
        <div class="state-skeleton__card"></div>
        <div class="state-skeleton__card"></div>
      </div>
    </div>`;
  root.appendChild(skeleton);
}

function hideSkeleton() {
  clearTimeout(delayedSkeletonTimer);
  document.getElementById('global-data-skeleton')?.remove();
}

function showMutation(message = 'Traitement en cours…') {
  const root = ensureRoot();
  if (!root) return;
  document.getElementById('action-waiting')?.remove();
  const modal = document.createElement('div');
  modal.id = 'action-waiting';
  modal.className = 'state-overlay state-overlay--modal';
  modal.innerHTML = `
    <div class="state-card state-card--waiting" role="status" aria-live="assertive">
      <span class="state-spinner" aria-hidden="true"></span>
      <strong>${message}</strong>
      <p>Veuillez patienter.</p>
    </div>`;
  root.appendChild(modal);
}

function hideMutation() {
  document.getElementById('action-waiting')?.remove();
}

function toast(title, text, type = 'success') {
  const root = ensureRoot();
  if (!root) return;
  const item = document.createElement('div');
  item.className = `state-toast state-toast--${type}`;
  item.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  root.appendChild(item);
  requestAnimationFrame(() => item.classList.add('is-visible'));
  window.setTimeout(() => {
    item.classList.remove('is-visible');
    window.setTimeout(() => item.remove(), 220);
  }, 4200);
}

function showError(error, retry) {
  const root = ensureRoot();
  if (!root) return;
  document.getElementById('request-error')?.remove();
  const box = document.createElement('div');
  box.id = 'request-error';
  box.className = 'state-overlay state-overlay--modal';
  box.innerHTML = `
    <div class="state-card state-card--error" role="alert">
      <div class="state-icon">!</div>
      <strong>Impossible de terminer cette action</strong>
      <p>${error?.message || 'Une erreur est survenue. Vérifiez votre connexion puis réessayez.'}</p>
      <div class="state-actions">
        <button type="button" data-state-retry>Réessayer</button>
        <button type="button" data-state-close>Fermer</button>
      </div>
    </div>`;
  root.appendChild(box);
  box.querySelector('[data-state-retry]')?.addEventListener('click', () => {
    box.remove();
    if (retry) retry();
  });
  box.querySelector('[data-state-close]')?.addEventListener('click', () => box.remove());
}

export function requestStarted(method, path, retry) {
  const mutation = method !== 'GET' && method !== 'HEAD';
  lastRequest = { method, path, retry };
  if (mutation) {
    activeMutations += 1;
    showMutation(path.includes('login') ? 'Connexion en cours…' : 'Traitement en cours…');
  } else {
    activeRequests += 1;
    setProgress(true);
    clearTimeout(delayedSkeletonTimer);
    delayedSkeletonTimer = window.setTimeout(showSkeleton, 180);
  }
}

export function requestFinished(method, path) {
  const mutation = method !== 'GET' && method !== 'HEAD';
  if (mutation) {
    activeMutations = Math.max(0, activeMutations - 1);
    if (!activeMutations) hideMutation();
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    if (!activeRequests) {
      setProgress(false);
      hideSkeleton();
    }
  }
}

export function requestSucceeded(method, path) {
  if (method !== 'GET' && method !== 'HEAD') {
    const label = path.includes('login') ? 'Connexion réussie' : 'Action effectuée';
    toast('✓ ' + label, 'La demande a été traitée avec succès.');
  }
}

export function requestFailed(method, path, error, retry) {
  requestFinished(method, path);
  if (method !== 'GET' && method !== 'HEAD') {
    showError(error, retry);
  } else {
    toast('Connexion indisponible', error?.message || 'Les données n’ont pas pu être récupérées.', 'error');
  }
}

export function setupStateAccessibility() {
  if (typeof document === 'undefined') return;
  ensureRoot();
  document.documentElement.classList.add('state-ui-ready');
}
