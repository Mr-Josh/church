# Church Read-Only MCP

This package exposes a **read-only** MCP interface for the Church application. It is intended for the main development agent and a separate security / UX / UI audit agent.

## Guarantees

The server exposes no write tool. Its HTTP client blocks every non-GET request to the Church API. It does not expose SQL execution, shell execution, file writes, deployment, credentials or secrets.

The MCP authenticates to the Church API as a dedicated **developer** account and then consumes the existing `/api/dev/*` read-only endpoints.

The remote HTTP entrypoint adds a second boundary: an MCP bearer token, host/origin allowlists, rate limiting, request-size limiting and `no-store` response headers. HTTPS must be provided by the production reverse proxy or platform. Do not expose the development server directly to the public Internet.

## Local stdio setup

```bash
cd mcp
npm install
```

Configure the MCP process environment without committing secrets:

```bash
export CHURCH_API_URL=http://127.0.0.1:8000
export CHURCH_MCP_EMAIL='developer@example.com'
export CHURCH_MCP_PASSWORD='your-password'
```

A previously issued PHP session can be used instead:

```bash
export CHURCH_API_URL=http://127.0.0.1:8000
export CHURCH_MCP_SESSION_COOKIE='PHPSESSID=...'
```

The account must have the `developer` role. The server verifies that role through `/api/dev/session`.

Start it with:

```bash
npm start
```

For a local MCP client, configure the command as:

```text
node /absolute/path/to/church/mcp/src/server.mjs
```

with the same environment variables.

## Authenticated Streamable HTTP

The HTTP endpoint is intended for a remote audit agent. It listens on `/mcp` and requires a bearer token on every request.

Install dependencies:

```bash
npm install
```

For a local-only test:

```bash
export CHURCH_API_URL=http://127.0.0.1:8000
export CHURCH_MCP_EMAIL='developer@example.com'
export CHURCH_MCP_PASSWORD='your-password'
export CHURCH_MCP_BEARER_TOKEN='generate-a-long-random-secret'
export CHURCH_MCP_HOST=127.0.0.1
export CHURCH_MCP_PORT=8787
export CHURCH_MCP_ALLOWED_HOSTS='127.0.0.1,localhost'
npm run start:http
```

The endpoint is then:

```text
http://127.0.0.1:8787/mcp
```

The bearer token is deliberately separate from the Church developer password. Never reuse the developer password as the MCP bearer token.

For production, bind behind a TLS reverse proxy and configure explicit values for:

```text
CHURCH_MCP_HOST=0.0.0.0
CHURCH_MCP_PORT=8787
CHURCH_MCP_ALLOWED_HOSTS=mcp.example.org
CHURCH_MCP_ALLOWED_ORIGINS=https://allowed-agent-origin.example
CHURCH_MCP_BEARER_TOKEN=<long-random-secret>
```

If the agent is not browser-based and sends no `Origin`, the origin allowlist can remain empty. If an `Origin` header is present, it must exactly match one of the configured values. Wildcard origins are intentionally unsupported.

The HTTP server also rejects unknown hosts, unsupported CORS preflight requests, oversized bodies and requests above the configured rate limit. Defaults are 1 MiB per request and 60 requests per minute per source address.

## HTTP security model

```text
Remote agent
    |
    | HTTPS (reverse proxy)
    v
MCP HTTP endpoint
    |
    +-- Host allowlist
    +-- Origin allowlist when Origin is present
    +-- Bearer authentication
    +-- Rate limit
    +-- Request-size limit
    +-- MCP read-only tools/resources
    |
    v
Church API
    |
    +-- developer session authentication
    +-- server-side role authorization
    +-- GET /api/dev/* only
    |
    v
Database
```

The MCP does not receive database credentials and does not connect directly to MySQL.

## Tools

- `church_health`
- `church_overview`
- `church_database`
- `church_security`
- `church_audit`
- `church_system`
- `church_session`
- `church_diagnostics`

All are marked read-only and idempotent.

## Resources

- `church://architecture`
- `church://security-model`

## Audit-agent contract

The second agent should receive only this MCP surface. It must:

1. inspect the application through the read-only tools and resources;
2. evaluate authentication, authorization, session handling, data exposure, API boundaries, frontend permissions, responsive UX and UI consistency;
3. produce findings with severity, evidence, affected area, impact and remediation;
4. never request or use a write capability;
5. never request passwords, session cookies, environment secrets or raw database credentials;
6. never treat a hidden frontend button as a security control; server-side authorization is the source of truth.

Recommended finding states:

`confirmed`, `needs-verification`, `false-positive`, `fixed`.

## Validation

Before exposing the HTTP endpoint remotely, run:

```bash
npm install
npm run check
```

Then test that an unauthenticated request receives `401`, an invalid host receives `421`, an invalid origin receives `403`, and an authenticated MCP client can discover and call the read-only tools.

The bearer token should be stored only in the MCP runtime secret store/environment. It must never be committed to Git, sent to the frontend, printed in logs, or shared with the Church application password.
