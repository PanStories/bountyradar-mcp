// core/score.mjs — the moat: deterministic, explainable agent-solvability scoring.
// Zero dependencies. No training; LLM only assists task_type/agent_solvable at refresh time.
import { TASK_SOLVABLE_DEFAULT } from './types.mjs';

const DAY_MS = 86400000;
const FRESHNESS_HALFLIFE_DAYS = 10; // exp(-age/14) ~ half-life 10d
const REWARD_LOG_MAX = Math.log10(5000 + 1); // ~3.7 -> reward $5000 saturates

/**
 * Derive agent-solvable from task_type when a classifier score is absent.
 * @param {import('./types.mjs').TaskType} taskType
 * @returns {number} 0..1
 */
export function deriveSolvable(taskType) {
  return TASK_SOLVABLE_DEFAULT[taskType] ?? 0.5;
}

/**
 * Score a single bounty. Pure function.
 * @param {import('./types.mjs').BountyRecord} b
 * @param {number} [now] epoch ms (injectable for tests)
 * @returns {import('./types.mjs').ScoreBreakdown}
 */
export function scoreBounty(b, now = Date.now()) {
  // Freshness: decay from most recent of updated_at / posted_at.
  const stamp = b.updated_at || b.posted_at;
  const ts = stamp ? new Date(stamp).getTime() : now;
  const ageDays = Math.max(0, (now - ts) / DAY_MS);
  const freshness = Math.exp(-ageDays / (FRESHNESS_HALFLIFE_DAYS * 1.4));

  // Competition: fewer known attempts => higher score.
  const cc = Math.max(0, Number(b.competition_count) || 0);
  const competition = 1 / (1 + cc);

  // Agent-solvable: explicit field wins; else derived from task_type.
  const agentSolvable = Number.isFinite(b.agent_solvable)
    ? Math.min(1, Math.max(0, b.agent_solvable))
    : deriveSolvable(b.task_type);

  // Reward: log-normalized, saturates at $5000.
  const reward = Math.max(0, Number(b.reward_usd) || 0);
  const rewardScore = reward > 0 ? Math.min(1, Math.log10(reward + 1) / REWARD_LOG_MAX) : 0;

  // Composite weights (SPEC §5 / ARCHITECTURE §5).
  const composite =
    0.40 * agentSolvable +
    0.25 * freshness +
    0.25 * competition +
    0.10 * rewardScore;

  return {
    freshness: round(freshness),
    competition: round(competition),
    agent_solvable: round(agentSolvable),
    reward_score: round(rewardScore),
    composite: round(composite),
  };
}

/**
 * Rank bounties by composite desc, attach score + honeypot guard.
 * @param {import('./types.mjs').BountyRecord[]} bounties
 * @param {number} [now]
 * @returns {Array<{bounty:import('./types.mjs').BountyRecord, score:import('./types.mjs').ScoreBreakdown}>}
 */
export function rankBounties(bounties, now = Date.now()) {
  return bounties
    .map((b) => ({ bounty: b, score: scoreBounty(b, now) }))
    .sort((a, b) => b.score.composite - a.score.composite);
}

function round(n) { return Math.round(n * 1000) / 1000; }
