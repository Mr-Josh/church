import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

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
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (cachedCookie) headers.set('Cookie', cachedCookie);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      redirect: 'error'
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie && path === '/api/auth/login') {
      const match = setCookie.match(/PHPSESSID=[^;]+/);
      if (match) cachedCookie = match[0];
    }

    const body = await response.text();
    let data;
    try { data = body ? JSON.parse(body) : {}; } catch { data = { message: 'API returned non-JSON data.' }; }
    if (!response.ok) {
      throw new Error(`Church API ${response.status}: ${data.message || 'request failed'}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureSession() {
  if (cachedCookie) return;
  if (!MCP_EMAIL || !MCP_PASSWORD) {
    throw new Error('Configure CHURCH_MCP_SESSION_COOKIE or CHURCH_MCP_EMAIL + CHURCH_MCP_PASSWORD.');
  }
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: MCP_EMAIL, password: MCP_PASSWORD })
  });
  if (data?.user?.role !== 'developer') {
    throw new Error('The MCP credential must belong to a developer account.');
  }
}

async function devGet(path) {
  await ensureSession();
  return request(path);
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

function registerReadTool(server, name, description, path) {
  server.registerTool(name, {
    description,
    annotations: READ_ONLY
  }, async () => textResult(await devGet(path)));
}

serveStdio(() => {
  const server = new McpServer({
    name: 'church-readonly',
    version: '0.1.0'
  });

  registerReadTool(server, 'church_health', 'Read the public API health status. No application data is modified.', '/api/health');
  registerReadTool(server, 'church_overview', 'Read safe operational counters and application health exposed to developers.', '/api/dev/summary');
  registerReadTool(server, 'church_database', 'Read database metadata: table names, row estimates, engines and collations. No row contents are exposed.', '/api/dev/database');
  registerReadTool(server, 'church_security', 'Read developer-visible security posture, role counts and audit availability.', '/api/dev/security');
  registerReadTool(server, 'church_audit', 'Read the latest technical account audit entries exposed to developers.', '/api/dev/audit');
  registerReadTool(server, 'church_system', 'Read application, PHP, server and database version information.', '/api/dev/system');
  registerReadTool(server, 'church_session', 'Read the current MCP developer session identity and session status.', '/api/dev/session');
  registerReadTool(server, 'church_diagnostics', 'Run the server-side read-only application diagnostics.', '/api/dev/diagnostics');

  server.registerResource(
    'architecture',
    'church://architecture',
    { title: 'Church architecture', description: 'Security boundaries and major application layers.', mimeType: 'text/plain' },
    async () => ({ contents: [{ uri: 'church://architecture', mimeType: 'text/plain', text: `Church application architecture\n\nFrontend: React/Vite\nBackend: PHP API\nDatabase: MySQL\nAdmin role: manages church content\nDeveloper role: manages technical operations and developer accounts\nMCP role: read-only technical inspection\nAudit agent: read-only evaluation of security and UX/UI\n\nMCP must never expose credentials, secrets, raw passwords, session identifiers, or arbitrary SQL execution.` }] })
  );

  server.registerResource(
    'security-model',
    'church://security-model',
    { title: 'Church security model', description: 'Read-only policy used by the security audit agent.', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'church://security-model', mimeType: 'application/json', text: JSON.stringify({
      roles: {
        admin: { purpose: 'church administration', can_modify: ['church content', 'church administration users'] },
        developer: { purpose: 'technical administration', can_modify: ['developer accounts'], cannot_modify: ['church settings', 'church content', 'pastoral requests'] },
        mcp: { purpose: 'inspection', read_only: true, can_write: false, can_execute_sql: false, can_run_shell: false },
        auditor: { purpose: 'security and UX/UI evaluation', read_only: true, can_write: false }
      },
      forbidden_mcp_capabilities: ['create', 'update', 'patch', 'delete', 'execute_sql', 'shell', 'deploy', 'read_secrets']
    }, null, 2) }] })
  );

  return server;
});
