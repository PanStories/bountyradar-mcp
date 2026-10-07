// core/dispatch.mjs — shared MCP surface (tools/resources/prompts) for both
// local stdio server and hosted Apify handler. Single definition source.
import { loadBounties, getFeed, searchBounties, getStats, loadSources, scoreBounty } from './catalog.mjs';

export const SERVER = { name: 'bountyradar-mcp', version: '1.0.0' };
export const PROTOCOL = '2024-11-05';

let _bounties = null;
export function bounties() {
  if (_bounties === null) _bounties = loadBounties();
  return _bounties;
}

export const subscriptions = new Map();

export const TOOLS = [
  {
    name: 'get_bounty_feed',
    description: 'Ranked, filtered feed of AI-agent-solvable bounties. The core subscriber feed. Filters: category(task_type), min_reward_usd, max_competition, source, freshness_min, agent_solvable_min, include_honeypot, sort.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer' },
        category: { type: 'string', enum: ['debug', 'test', 'validate', 'feature', 'needs_human', 'research'] },
        min_reward_usd: { type: 'number' },
        max_competition: { type: 'integer' },
        source: { type: 'string', enum: ['opire', 'bountyhub', 'clawhunt', 'algora', 'github', 'hackerone_valid', 'curated'] },
        freshness_min: { type: 'number', minimum: 0, maximum: 1 },
        agent_solvable_min: { type: 'number', minimum: 0, maximum: 1 },
        include_honeypot: { type: 'boolean', default: false },
        sort: { type: 'string', enum: ['composite', 'reward', 'freshness', 'competition'], default: 'composite' },
      },
    },
  },
  {
    name: 'search_bounties',
    description: 'Keyword + filter search across the catalog (title, description, tags, repo).',
    inputSchema: {
      type: 'object', required: ['query'],
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer' },
        category: { type: 'string', enum: ['debug', 'test', 'validate', 'feature', 'needs_human', 'research'] },
        source: { type: 'string' },
      },
    },
  },
  {
    name: 'get_bounty_detail',
    description: 'Full record + score breakdown for one bounty by id.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
  },
  {
    name: 'score_bounty',
    description: 'Raw explainable score breakdown for one bounty.',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
  },
  {
    name: 'list_sources',
    description: 'Source registry with status (live / curated / partner_candidate).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_stats',
    description: 'Aggregate counts by source, category, and reward band.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'subscribe_feed',
    description: 'Save a filter profile + poll descriptor (webhook on hosted). Read-only intent.',
    inputSchema: {
      type: 'object', required: ['name', 'filters'],
      properties: {
        name: { type: 'string' },
        filters: { type: 'object' },
        webhook_url: { type: 'string' },
      },
    },
  },
];

export const PROMPTS = [
  { name: 'daily_bounty_brief', description: 'Briefs an agent on today’s best agent-solvable targets.', arguments: [{ name: 'max_items', required: false }] },
];

export function initializeResult() {
  return { protocolVersion: PROTOCOL, capabilities: { tools: { listChanged: false }, resources: {}, prompts: {} }, serverInfo: SERVER };
}

export function toolsList() { return { tools: TOOLS }; }

export function toolsCall(name, args = {}) {
  const B = bounties();
  switch (name) {
    case 'get_bounty_feed': { const { items, total } = getFeed(B, args); return ok({ total, generated_at: new Date().toISOString(), items }, summaryFeed(items, total)); }
    case 'search_bounties': { const { items, total } = searchBounties(B, args.query, args); return ok({ total, items }, summaryFeed(items, total)); }
    case 'get_bounty_detail': { const b = B.find((x) => x.id === args.id); if (!b) return err(`Bounty "${args.id}" not found`); return ok({ bounty: b, score: scoreBounty(b) }, `Bounty ${b.id}: ${b.title}`); }
    case 'score_bounty': { const b = B.find((x) => x.id === args.id); if (!b) return err(`Bounty "${args.id}" not found`); return ok({ id: b.id, score: scoreBounty(b) }, `Score for ${b.id}`); }
    case 'list_sources': { const s = loadSources(); return ok(s, `Sources: ${(s.sources || []).map((x) => x.name).join(', ')}`); }
    case 'get_stats': { const stats = getStats(B); return ok(stats, `Total ${stats.total} bounties across ${Object.keys(stats.by_source).length} sources`); }
    case 'subscribe_feed': { const id = 'sub_' + Math.random().toString(36).slice(2, 10); subscriptions.set(id, args); return ok({ subscription_id: id, filters: args.filters, poll_descriptor: { tool: 'get_bounty_feed', filters: args.filters }, webhook_url: args.webhook_url || null }, `Subscribed "${args.name}" (${id})`); }
    default: return err(`Unknown tool: ${name}`, -32601);
  }
}

export function resourcesList() {
  return { resources: [
    { uri: 'bountyradar://feed/latest', name: 'Latest ranked feed', mimeType: 'application/json' },
    { uri: 'bountyradar://stats', name: 'Catalog stats', mimeType: 'application/json' },
    { uri: 'bountyradar://sources', name: 'Source registry', mimeType: 'application/json' },
  ] };
}
export function resourcesRead(uri) {
  const B = bounties();
  if (uri === 'bountyradar://feed/latest') { const { items, total } = getFeed(B, { limit: 20 }); return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ total, items }) }] }; }
  if (uri === 'bountyradar://stats') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(getStats(B)) }] };
  if (uri === 'bountyradar://sources') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(loadSources()) }] };
  return { contents: [], error: 'unknown resource' };
}
export function promptsList() { return { prompts: PROMPTS }; }
export function promptsGet(name, args) {
  if (name !== 'daily_bounty_brief') return { messages: [], error: 'unknown prompt' };
  const max = Number(args?.max_items) || 5;
  const { items } = getFeed(bounties(), { limit: max, agent_solvable_min: 0.7, max_competition: 3 });
  const lines = items.map(({ bounty: b, score: s }) =>
    `- [${b.source}] ${b.title} — $${b.reward_usd}, solvable ${(s.agent_solvable * 100) | 0}%, comp ${b.competition_count}, fresh ${(s.freshness * 100) | 0}% (${b.url})`);
  const text = `You are a bounty-routing agent. Today's top agent-solvable targets (pre-filtered):\n${lines.join('\n')}\n\nPick the highest-composite target, read its detail via get_bounty_detail, and only act if agent_solvable >= 0.7 and it is not a honeypot.`;
  return { messages: [{ role: 'user', content: { type: 'text', text } }] };
}

export function ok(structured, text) { return { content: [{ type: 'text', text }], structuredContent: structured }; }
export function err(message, code = -32000) { return { isError: true, content: [{ type: 'text', text: message }], structuredContent: { error: message }, _code: code }; }
export function summaryFeed(items, total) { return `${total} match(es). Top: ` + items.slice(0, 3).map((i) => `${i.bounty.id}(${(i.score.composite * 100) | 0}%)`).join(', '); }
