import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { buildServer } from './server-core.mjs';

serveStdio(buildServer);
