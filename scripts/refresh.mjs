#!/usr/bin/env node
// scripts/refresh.mjs — refresh the catalog from live sources.
// Graceful: with no credentials it still runs GitHub (anonymous 60/hr) and
// skips platform sources that need keys. With GITHUB_TOKEN it pulls more.
// Writes collected records to data/bounties/<id>.json (overwriting live data).
//
// Usage:
//   node scripts/refresh.mjs                 # collect github (anonymous) + skip rest
//   GITHUB_TOKEN=ghp_xxx node scripts/refresh.mjs
//   node scripts/refresh.mjs --sources github,opire   (opire needs OPIRE_API_KEY)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collect } from '../scraper/src/run.mjs';

// Live-collected records go to data/live/ so the CURATED catalog (data/bounties)
// stays a clean, reviewable seed. The MCP merges live only when BR_INCLUDE_LIVE=1.
const LIVE_DIR = fileURLToPath(new URL('../data/live/', import.meta.url));
mkdirSync(LIVE_DIR, { recursive: true });

const args = process.argv.slice(2);
const srcArg = (args.find((a) => a.startsWith('--sources=')) || '').split('=')[1];
const sources = srcArg ? srcArg.split(',').map((s) => s.trim()) : ['github'];

const llm = {
  url: process.env.CHEAPEST_LLM_ROUTER_URL || process.env.WORKERS_AI_URL,
  key: process.env.CHEAPEST_LLM_ROUTER_KEY || process.env.WORKERS_AI_KEY,
  model: process.env.CHEAPEST_LLM_MODEL,
};

async function main() {
  console.error(`[refresh] collecting from: ${sources.join(', ')}`);
  let written = 0;
  const records = await collect({
    sources,
    maxItemsPerSource: 60,
    githubToken: process.env.GITHUB_TOKEN,
    llm,
    env: process.env,
    push: (r) => {
      writeFileSync(`${LIVE_DIR}/${r.id}.json`, JSON.stringify(r, null, 2));
      written++;
    },
  });
  console.error(`[refresh] done — ${records.length} collected, ${written} written to ${LIVE_DIR}`);
  if (written === 0) console.error('[refresh] nothing written. Set GITHUB_TOKEN or platform keys to collect live data.');
}

main().catch((e) => { console.error('[refresh] error:', e.message); process.exit(1); });
