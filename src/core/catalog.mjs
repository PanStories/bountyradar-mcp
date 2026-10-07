// core/catalog.mjs — load + validate + filter + rank + search + stats. Zero dependencies.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateBounty } from './validate.mjs';
import { rankBounties, scoreBounty } from './score.mjs';
import { isTaskType, isSourceName } from './types.mjs';

const BOUNTIES_DIR = fileURLToPath(new URL('../../data/bounties/', import.meta.url));
const LIVE_DIR = fileURLToPath(new URL('../../data/live/', import.meta.url));
const SOURCES_FILE = fileURLToPath(new URL('../../data/sources.json', import.meta.url));

/**
 * Read + validate all bounty JSON in a directory. Skips (does not throw on)
 * invalid live records so a bad scrape can't take down the whole feed.
 * @param {string} dir
 * @param {boolean} strict
 */
function readDir(dir, strict = false) {
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')); }
  catch { return []; }
  const out = [];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    const res = validateBounty(raw);
    if (!res.valid) {
      if (strict) throw new Error(`Invalid bounty ${f}: ${res.errors.join('; ')}`);
      console.error(`[catalog] skip invalid ${f}: ${res.errors.join('; ')}`);
      continue;
    }
    out.push(raw);
  }
  return out;
}

/**
 * Load + validate all curated bounties. Throws if any curated sample is invalid.
 * When BR_INCLUDE_LIVE=1, also merges live-scraped records from data/live/.
 * @returns {import('./types.mjs').BountyRecord[]}
 */
export function loadBounties(dir = BOUNTIES_DIR) {
  const out = readDir(dir, true);
  if (process.env.BR_INCLUDE_LIVE) out.push(...readDir(LIVE_DIR, false));
  return out;
}

/**
 * @typedef {Object} FeedFilters
 * @property {number} [limit]
 * @property {string} [category]        task_type
 * @property {number} [min_reward_usd]
 * @property {number} [max_competition] competition_count
 * @property {string} [source]
 * @property {number} [freshness_min]
 * @property {number} [agent_solvable_min]
 * @property {boolean} [include_honeypot]
 * @property {'composite'|'reward'|'freshness'|'competition'} [sort]
 */

/**
 * Filter + rank the feed.
 * @param {import('./types.mjs').BountyRecord[]} bounties
 * @param {FeedFilters} f
 * @param {number} [now]
 */
export function getFeed(bounties, f = {}, now = Date.now()) {
  let ranked = rankBounties(bounties, now);
  if (!f.include_honeypot) ranked = ranked.filter((r) => !r.bounty.honeypot);

  if (f.category && isTaskType(f.category)) ranked = ranked.filter((r) => r.bounty.task_type === f.category);
  if (f.source && isSourceName(f.source)) ranked = ranked.filter((r) => r.bounty.source === f.source);
  if (f.min_reward_usd != null) ranked = ranked.filter((r) => r.bounty.reward_usd >= f.min_reward_usd);
  if (f.max_competition != null) ranked = ranked.filter((r) => (r.bounty.competition_count || 0) <= f.max_competition);
  if (f.freshness_min != null) ranked = ranked.filter((r) => r.score.freshness >= f.freshness_min);
  if (f.agent_solvable_min != null) ranked = ranked.filter((r) => r.score.agent_solvable >= f.agent_solvable_min);

  const sortKey = f.sort || 'composite';
  ranked = [...ranked].sort((a, b) => b.score[sortKey] - a.score[sortKey]);

  const limit = f.limit && f.limit > 0 ? f.limit : ranked.length;
  return { items: ranked.slice(0, limit), total: ranked.length };
}

/**
 * Keyword search across title/description/tags/repo. AND over tokens, ranked by composite.
 * @param {import('./types.mjs').BountyRecord[]} bounties
 * @param {string} query
 * @param {{limit?:number, category?:string, source?:string}} [opts]
 */
export function searchBounties(bounties, query, opts = {}, now = Date.now()) {
  const tokens = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = rankBounties(bounties, now);
  let hits = ranked.filter(({ bounty: b }) => {
    if (opts.category && b.task_type !== opts.category) return false;
    if (opts.source && b.source !== opts.source) return false;
    if (!tokens.length) return true;
    const hay = `${b.title} ${b.description || ''} ${(b.tags || []).join(' ')} ${b.repo || ''}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
  const limit = opts.limit && opts.limit > 0 ? opts.limit : hits.length;
  return { items: hits.slice(0, limit), total: hits.length };
}

/**
 * Aggregate stats.
 * @param {import('./types.mjs').BountyRecord[]} bounties
 */
export function getStats(bounties) {
  const by_source = {};
  const by_category = {};
  const reward_bands = { '0-100': 0, '100-500': 0, '500-2000': 0, '2000+': 0 };
  for (const b of bounties) {
    by_source[b.source] = (by_source[b.source] || 0) + 1;
    by_category[b.task_type] = (by_category[b.task_type] || 0) + 1;
    const r = b.reward_usd || 0;
    if (r < 100) reward_bands['0-100']++;
    else if (r < 500) reward_bands['100-500']++;
    else if (r < 2000) reward_bands['500-2000']++;
    else reward_bands['2000+']++;
  }
  return { by_source, by_category, reward_bands, total: bounties.length };
}

/**
 * Source registry with status.
 * @returns {any}
 */
export function loadSources() {
  try { return JSON.parse(readFileSync(SOURCES_FILE, 'utf8')); }
  catch { return { sources: [] }; }
}

export { scoreBounty };
