# Church Read-Only MCP

This package exposes a **read-only** MCP interface for the Church application. It is intended for the main development agent and a separate security / UX / UI audit agent.

## Guarantees

The server exposes no write tool. Its HTTP client blocks every non-GET request. It does not expose SQL execution, shell execution, file writes, deployment, credentials or secrets.

The MCP authenticates as a dedicated **developer** account and then consumes the existing `/api/dev/*` read-only endpoints.

## Local setup

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

## Important deployment note

The current implementation is intentionally **stdio/local**. For a remote agent, expose the same server through MCP Streamable HTTP behind proper authentication and HTTPS. Do not put developer credentials in the frontend or in a committed configuration file.
