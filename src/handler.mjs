// handler.mjs — Apify-hosted MCP transport (Pay-Per-Event).
// Loaded only in the Apify runtime where express + SDK + apify are installed.
// Exports `app` and `startServer()` so the actor's main process can bind the port
// itself (Standby-safe). DISCIPLINE: stdout carries ONLY JSON-RPC frames from tools;
// all logs go to stderr.
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema, CallToolRequestSchema,
  ListResourcesRequestSchema, ReadResourceRequestSchema,
  ListPromptsRequestSchema, GetPromptRequestSchema, InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as D from './core/dispatch.mjs';

// PPE event names (must match pricingInfos). Free events (initialize / list-tools /
// list-sources) are deliberately NOT registered — Apify rejects $0 events and we
// must never charge for connection/tool discovery.
export const PRICED = {
  get_bounty_feed: 'mcp-get-bounty-feed',
  search_bounties: 'mcp-search',
  score_bounty: 'mcp-score',
  get_stats: 'mcp-stats',
  subscribe_feed: 'mcp-subscribe',
};

const atHome = !!(process.env.APIFY_TOKEN || process.env.APIFY_ACTOR_EVENTS || process.env.APIFY_META_ORIGIN);

export async function charge(name) {
  if (!PRICED[name] || !atHome) return;
  try {
    const { Actor } = await import('apify');
    await Actor.charge({ eventName: PRICED[name] });
  } catch (e) {
    console.error('[bountyradar] charge skipped:', e.message);
  }
}

function buildServer() {
  const init = D.initializeResult();
  const server = new Server(init.serverInfo, { capabilities: init.capabilities });
  server.setRequestHandler(ListToolsRequestSchema, async () => D.toolsList());
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    await charge(name);
    const r = D.toolsCall(name, args || {});
    return { content: r.content, structuredContent: r.structuredContent, isError: r.isError || false };
  });
  server.setRequestHandler(ListResourcesRequestSchema, async () => D.resourcesList());
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => D.resourcesRead(req.params.uri));
  server.setRequestHandler(ListPromptsRequestSchema, async () => D.promptsList());
  server.setRequestHandler(GetPromptRequestSchema, async (req) => D.promptsGet(req.params.name, req.params.arguments));
  return server;
}

export const app = express();
app.use(express.json());

// Apify Standby readiness probe: GET / (or any path) carrying the probe header -> 200.
// Without responding to this, the Standby run never becomes "ready" and the container is killed.
app.get('/', (_req, res) => res.status(200).json({ status: 'ready', bounties: D.bounties().length }));
app.use((req, res, next) => {
  if (req.headers['x-apify-container-server-readiness-probe']) {
    res.status(200).json({ status: 'ready' });
    return;
  }
  next();
});

app.post('/mcp', async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableDnsRebindingProtection: true,
    allowedHosts: ['*'], // Apify gateway is the only caller; rebinding protection off in-at-home
  });
  res.on('close', () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
app.get('/mcp', async (_req, res) => { res.status(405).json({ error: 'Method not allowed' }); });

// Start the HTTP server (Standby-safe: main process binds the port itself).
export async function startServer() {
  if (atHome) {
    try {
      const { Actor } = await import('apify');
      await Actor.init();
    } catch (e) {
      console.error('[bountyradar] Actor.init skipped:', e.message);
    }
  }
  const port = Number(process.env.ACTOR_WEB_SERVER_PORT || process.env.APIFY_CONTAINER_PORT || process.env.PORT || 8000);
  app.listen(port, () => console.error(`[bountyradar] http listening on ${port}`));
}
