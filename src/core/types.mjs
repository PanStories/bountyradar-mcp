// core/types.mjs — shared constants + JSDoc types. Zero dependencies.
// Single definition source for enums (SPEC §11 C2).

/** @typedef {'debug'|'test'|'validate'|'feature'|'needs_human'|'research'} TaskType */
/** @typedef {'opire'|'bountyhub'|'clawhunt'|'algora'|'github'|'hackerone_valid'|'curated'} SourceName */
/**
 * @typedef {Object} BountyRecord
 * @property {string} id
 * @property {string} title
 * @property {SourceName} source
 * @property {string} url
 * @property {TaskType} task_type
 * @property {number} reward_usd
 * @property {string} posted_at            ISO date-time
 * @property {string} [updated_at]
 * @property {number} [competition_count]
 * @property {number} [agent_solvable]     0..1, set by classifier
 * @property {('easy'|'medium'|'hard')} [difficulty]
 * @property {string} [language]
 * @property {string[]} [tags]
 * @property {string} [description]
 * @property {boolean} [honeypot]
 */

/**
 * @typedef {Object} ScoreBreakdown
 * @property {number} freshness      0..1
 * @property {number} competition    0..1  (higher = less competition)
 * @property {number} agent_solvable 0..1
 * @property {number} reward_score   0..1
 * @property {number} composite      0..1  weighted rank score
 */

export const TASK_TYPES = /** @type {const} */ ([
  'debug', 'test', 'validate', 'feature', 'needs_human', 'research',
]);

export const SOURCE_NAMES = /** @type {const} */ ([
  'opire', 'bountyhub', 'clawhunt', 'algora', 'github', 'hackerone_valid', 'curated',
]);

export const DIFFICULTIES = /** @type {const} */ (['easy', 'medium', 'hard']);

/** Default agent-solvability by task type (used when classifier absent). */
export const TASK_SOLVABLE_DEFAULT = {
  debug: 0.85,
  test: 0.80,
  validate: 0.80,
  feature: 0.60,
  research: 0.50,
  needs_human: 0.15,
};

export function isTaskType(v) { return TASK_TYPES.includes(v); }
export function isSourceName(v) { return SOURCE_NAMES.includes(v); }
