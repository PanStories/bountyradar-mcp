// scraper/src/main.mjs — Apify actor entry for BountyRadar live collection.
// Run on Apify: `apify push` from scraper/ dir. Reads INPUT, runs collect(),
// pushes BountyRecord JSON to the default dataset. Graceful without SDK.
import { collect } from './run.mjs';

async function main() {
  let Actor = null;
  try { ({ Actor } = await import('apify')); await Actor.init(); }
  catch { console.error('[actor] apify SDK not found — local dry-run mode'); }

  const input = Actor ? (await Actor.getInput()) || {} : (JSON.parse(process.env.INPUT_JSON || '{}'));
  const llm = {
    url: input.llmUrl || process.env.CHEAPEST_LLM_ROUTER_URL || process.env.WORKERS_AI_URL,
    key: input.llmKey || process.env.CHEAPEST_LLM_ROUTER_KEY || process.env.WORKERS_AI_KEY,
    model: input.model,
  };

  const records = await collect({
    sources: input.sources || ['github'],
    maxItemsPerSource: input.maxItemsPerSource || 40,
    githubToken: input.githubToken || process.env.GITHUB_TOKEN,
    llm,
    env: process.env,
    push: Actor ? (r) => Actor.pushData(r) : async (r) => console.log('RECORD', JSON.stringify(r)),
  });

  console.error(`[actor] collected ${records.length} bounties`);
  if (Actor) await Actor.exit();
}

main().catch((e) => { console.error('[actor] fatal:', e.message); process.exit(1); });
