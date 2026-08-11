import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { buildServer } from './server-core.mjs';

const HOST = process.env.CHURCH_MCP_HOST || '127.0.0.1';
const PORT = Number(process.env.CHURCH_MCP_PORT || 8787);
const MCP_TOKEN = process.env.CHURCH_MCP_BEARER_TOKEN || '';
const ALLOWED_HOSTS = new Set((process.env.CHURCH_MCP_ALLOWED_HOSTS || '127.0.0.1,localhost').split(',').map(value => value.trim().toLowerCase()).filter(Boolean));
const ALLOWED_ORIGINS = new Set((process.env.CHURCH_MCP_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean));
const MAX_BODY_BYTES = Number(process.env.CHURCH_MCP_MAX_BODY_BYTES || 1024 * 1024);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.CHURCH_MCP_RATE_LIMIT || 60);
const rateBuckets = new Map();

if (!MCP_TOKEN) {
  throw new Error('CHURCH_MCP_BEARER_TOKEN is required for the HTTP MCP server.');
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('CHURCH_MCP_PORT must be a valid TCP port.');
}

if (!['127.0.0.1', 'localhost', '::1'].includes(HOST) && !process.env.CHURCH_MCP_ALLOWED_HOSTS) {
  throw new Error('CHURCH_MCP_ALLOWED_HOSTS is required when the HTTP MCP is not bound to loopback.');
}

function safeTokenEqual(provided) {
  const expected = Buffer.from(MCP_TOKEN, 'utf8');
  const actual = Buffer.from(provided, 'utf8');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function bearerToken(req) {
  const value = req.headers.authorization || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(value);
  return match?.[1] || '';
}

function hostName(req) {
  return String(req.headers.host || '').split(':')[0].toLowerCase();
}

function allowedHost(req) {
  return ALLOWED_HOSTS.has(hostName(req));
}

function allowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return ALLOWED_ORIGINS.has(origin);
}

function rateLimit(req) {
  const key = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= RATE_LIMIT_MAX;
}

function reject(res, status, message, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(JSON.stringify({ error: message }));
}

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [key, bucket] of rateBuckets) {
    if (bucket.startedAt < cutoff) rateBuckets.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

const handler = createMcpHandler(buildServer);
const nodeHandler = toNodeHandler(handler);

const httpServer = createServer((req, res) => {
  if (req.url !== '/mcp') {
    reject(res, 404, 'Not found.');
    return;
  }

  if (req.method === 'OPTIONS') {
    reject(res, 405, 'CORS preflight is not supported by this agent-only MCP endpoint.');
    return;
  }

  if (!allowedHost(req)) {
    reject(res, 421, 'MCP host is not allowed.');
    return;
  }

  if (!allowedOrigin(req)) {
    reject(res, 403, 'MCP origin is not allowed.');
    return;
  }

  if (!rateLimit(req)) {
    reject(res, 429, 'MCP rate limit exceeded.', { 'Retry-After': '60' });
    return;
  }

  const token = bearerToken(req);
  if (!safeTokenEqual(token)) {
    reject(res, 401, 'MCP authentication required.', { 'WWW-Authenticate': 'Bearer' });
    return;
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    reject(res, 413, 'MCP request body is too large.');
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  void nodeHandler(req, res);
});

httpServer.listen(PORT, HOST, () => {
  console.error(`[mcp] authenticated read-only HTTP endpoint listening on http://${HOST}:${PORT}/mcp`);
});
