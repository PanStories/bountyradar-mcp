// handler.mjs — Apify-hosted MCP transport (Pay-Per-Event).
// Loaded only in the Apify runtime where express + SDK + apify are installed.
// Exports `app` and `startServer()` so the actor's main process can bind the port
// itself (Standby-safe). DISCIPLINE: stdout carries ONLY JSON-RPC frames from tools;
// all logs go to stderr.
import express from 'express';
import { Actor } from 'apify';
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

// Actor.isAtHome() is the reliable at-home signal (standby sets APIFY_META_ORIGON only).
const AT_HOME = Actor.isAtHome();
if (AT_HOME) {
  await Actor.init(); // must run before Actor.charge(); without it charge() throws and is swallowed
  console.error('[bountyradar] Apify Actor initialized — pay-per-event billing is ON');
}

export async function charge(name) {
  if (!PRICED[name] || !AT_HOME) return;
  try {
    await Actor.charge({ eventName: PRICED[name] });
  } catch (e) {
    console.error('[bountyradar] charge failed:', e.message);
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
    // At home the only caller is Apify's gateway (Bearer-token gated), so the SDK's
    // DNS-rebinding Host check is redundant and would reject the *.actor host.
    // Keep it on when NOT at home (local/dev) as defence-in-depth.
    enableDnsRebindingProtection: !AT_HOME,
    allowedHosts: AT_HOME ? undefined : ['localhost', '127.0.0.1'],
  });
  res.on('close', () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
app.get('/mcp', async (_req, res) => { res.status(405).json({ error: 'Method not allowed' }); });

// Start the HTTP server (Standby-safe: main process binds the port itself).
export async function startServer() {
  const port = Number(process.env.ACTOR_WEB_SERVER_PORT || process.env.APIFY_CONTAINER_PORT || process.env.PORT || 8000);
  app.listen(port, () => console.error(`[bountyradar] http listening on ${port} (atHome=${AT_HOME})`));
}
