// scraper/src/run.mjs — orchestration shared by the Apify actor and local refresh.
// Pulls from each enabled source, classifies, and emits BountyRecord-shaped JSON
// via the injected `push` callback. Single source of truth for classification.
import { classify } from './core/classify.mjs';
import { isTaskType, isSourceName } from './core/types.mjs';
import { scrapeGitHub } from './scrapers/github.mjs';
import { opire, algora, bountyhub, clawhunt } from './scrapers/platform.mjs';

const SOURCE_MAP = {
  github: { fn: scrapeGitHub, needsKey: false },
  opire: { fn: () => opire.scrape(), needsKey: true },
  algora: { fn: () => algora.scrape(), needsKey: true },
  bountyhub: { fn: () => bountyhub.scrape(), needsKey: true },
  clawhunt: { fn: () => clawhunt.scrape(), needsKey: true }, // partner_candidate -> throws
};

/**
 * @param {{sources?:string[], maxItemsPerSource?:number, llm?:{url?:string,key?:string,model?:string}, githubToken?:string, env?:any, push?:(r:any)=>Promise<void>|void}} opts
 */
export async function collect(opts = {}) {
  const sources = opts.sources && opts.sources.length ? opts.sources : ['github'];
  const maxPer = opts.maxItemsPerSource || 40;
  const llm = opts.llm || {};
  const push = opts.push || (async () => {});
  const collected = [];

  for (const src of sources) {
    const entry = SOURCE_MAP[src];
    if (!entry) { console.error(`[collect] unknown source ${src} — skip`); continue; }
    let raw = [];
    try {
      raw = src === 'github'
        ? await scrapeGitHub({ token: opts.githubToken, maxItems: maxPer })
        : await entry.fn(opts.env || process.env);
    } catch (e) {
      console.error(`[collect] ${src} skipped: ${e.message}`);
      continue;
    }
    for (const r of raw.slice(0, maxPer)) {
      const c = await classify(r, llm);
      const task_type = isTaskType(c.task_type) ? c.task_type : 'feature';
      const record = {
        id: r.id,
        title: r.title,
        source: isSourceName(src) ? src : 'curated',
        url: r.url,
        task_type,
        reward_usd: Number(r.reward_usd) || 0,
        posted_at: r.posted_at || new Date().toISOString(),
        updated_at: r.updated_at,
        competition_count: Number(r.competition_count) || 0,
        agent_solvable: c.agent_solvable,
        tags: r.tags || [],
        description: r.description || '',
        repo: r.repo || '',
        honeypot: false,
      };
      collected.push(record);
      await push(record);
    }
    console.error(`[collect] ${src}: ${raw.length} raw -> classified`);
  }
  return collected;
}
