import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

const API_BASE = (process.env.CHURCH_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const SESSION_COOKIE = process.env.CHURCH_MCP_SESSION_COOKIE || '';
const MCP_EMAIL = process.env.CHURCH_MCP_EMAIL || '';
const MCP_PASSWORD = process.env.CHURCH_MCP_PASSWORD || '';
const REQUEST_TIMEOUT_MS = Number(process.env.CHURCH_MCP_TIMEOUT_MS || 8000);

let cachedCookie = SESSION_COOKIE;

function textResult(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

async function request(path, options = {}) {
  if (options.method && options.method !== 'GET') {
    throw new Error('Church MCP is read-only: non-GET requests are blocked.');
  }
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (cachedCookie) headers.set('Cookie', cachedCookie);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'error'
    });
    const body = await response.text();
    let data;
    try { data = body ? JSON.parse(body) : {}; } catch { data = { message: 'API returned non-JSON data.' }; }
    if (!response.ok) throw new Error(`Church API ${response.status}: ${data.message || 'request failed'}`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function authenticateDeveloper() {
  if (!MCP_EMAIL || !MCP_PASSWORD) {
    throw new Error('Configure CHURCH_MCP_EMAIL and CHURCH_MCP_PASSWORD for the local MCP developer account.');
  }
  const headers = new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: MCP_EMAIL, password: MCP_PASSWORD }),
      signal: controller.signal,
      redirect: 'error'
    });
    const body = await response.text();
    let data;
    try { data = body ? JSON.parse(body) : {}; } catch { data = {}; }
    if (!response.ok || data?.user?.role !== 'developer') throw new Error('MCP credentials must belong to an active developer account.');
    const setCookie = response.headers.get('set-cookie');
    const match = setCookie?.match(/PHPSESSID=[^;]+/);
    if (!match) throw new Error('The Church API did not return a PHP session cookie.');
    cachedCookie = match[0];
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureDeveloperSession() {
  if (!cachedCookie) {
    await authenticateDeveloper();
    return;
  }
  try {
    const session = await request('/api/dev/session');
    if (session?.data?.user?.role !== 'developer') throw new Error('The supplied MCP session is not a developer session.');
  } catch {
    cachedCookie = '';
    await authenticateDeveloper();
  }
}

async function devGet(path) {
  await ensureDeveloperSession();
  return request(path);
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

function registerDevReadTool(server, name, description, path) {
  server.registerTool(name, { description, annotations: READ_ONLY }, async () => textResult(await devGet(path)));
}

serveStdio(() => {
  const server = new McpServer({ name: 'church-readonly', version: '0.1.0' });

  server.registerTool('church_health', {
    description: 'Read the public API health status. No application data is modified.',
    annotations: READ_ONLY
  }, async () => textResult(await request('/api/health')));

  registerDevReadTool(server, 'church_overview', 'Read safe operational counters and application health exposed to developers.', '/api/dev/summary');
  registerDevReadTool(server, 'church_database', 'Read database metadata: table names, row estimates, engines and collations. No row contents are exposed.', '/api/dev/database');
  registerDevReadTool(server, 'church_security', 'Read developer-visible security posture, role counts and audit availability.', '/api/dev/security');
  registerDevReadTool(server, 'church_audit', 'Read the latest technical account audit entries exposed to developers.', '/api/dev/audit');
  registerDevReadTool(server, 'church_system', 'Read application, PHP, server and database version information.', '/api/dev/system');
  registerDevReadTool(server, 'church_session', 'Read the current MCP developer session identity and session status.', '/api/dev/session');
  registerDevReadTool(server, 'church_diagnostics', 'Run the server-side read-only application diagnostics.', '/api/dev/diagnostics');

  server.registerResource('architecture', 'church://architecture', {
    title: 'Church architecture',
    description: 'Security boundaries and major application layers.',
    mimeType: 'text/plain'
  }, async () => ({ contents: [{ uri: 'church://architecture', mimeType: 'text/plain', text: `Church application architecture\n\nFrontend: React/Vite\nBackend: PHP API\nDatabase: MySQL\nAdmin role: manages church content\nDeveloper role: manages technical operations and developer accounts\nMCP role: read-only technical inspection\nAudit agent: read-only evaluation of security and UX/UI\n\nMCP must never expose credentials, secrets, raw passwords, session identifiers, or arbitrary SQL execution.` }] }));

  server.registerResource('security-model', 'church://security-model', {
    title: 'Church security model',
    description: 'Read-only policy used by the security audit agent.',
    mimeType: 'application/json'
  }, async () => ({ contents: [{ uri: 'church://security-model', mimeType: 'application/json', text: JSON.stringify({
    roles: {
      admin: { purpose: 'church administration', can_modify: ['church content', 'church administration users'] },
      developer: { purpose: 'technical administration', can_modify: ['developer accounts'], cannot_modify: ['church settings', 'church content', 'pastoral requests'] },
      mcp: { purpose: 'inspection', read_only: true, can_write: false, can_execute_sql: false, can_run_shell: false },
      auditor: { purpose: 'security and UX/UI evaluation', read_only: true, can_write: false }
    },
    forbidden_mcp_capabilities: ['create', 'update', 'patch', 'delete', 'execute_sql', 'shell', 'deploy', 'read_secrets']
  }, null, 2) }] }));

  return server;
});
