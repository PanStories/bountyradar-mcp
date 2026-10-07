// scraper/src/core/types.mjs — copy of bountyradar-mcp/src/core/types.mjs.
// Kept local so the Apify actor builds as a self-contained unit. Keep in sync
// with the canonical file at ../../src/core/types.mjs (classification contract).
export const TASK_TYPES = ['debug', 'test', 'validate', 'feature', 'needs_human', 'research'];
export const SOURCE_NAMES = ['opire', 'bountyhub', 'clawhunt', 'algora', 'github', 'hackerone_valid', 'curated'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const TASK_SOLVABLE_DEFAULT = {
  debug: 0.85, test: 0.80, validate: 0.80, feature: 0.60, research: 0.50, needs_human: 0.15,
};
export function isTaskType(v) { return TASK_TYPES.includes(v); }
export function isSourceName(v) { return SOURCE_NAMES.includes(v); }
