// core/classify.mjs — LLM-assisted agent-solvability classification (graceful).
// Uses free-LLM (Cheapest-LLM Router / Cloudflare Workers AI) when creds present;
// otherwise falls back to deterministic keyword heuristics. Zero hard dependency.
import { TASK_TYPES, TASK_SOLVABLE_DEFAULT } from './types.mjs';

const KEYWORD_MAP = {
  debug: ['bug', 'fix', 'crash', 'exception', 'error', 'stack trace', 'regression', 'panic'],
  test: ['test', 'coverage', 'unit test', 'e2e', 'spec', 'pytest', 'jest', 'vitest'],
  validate: ['validate', 'verification', 'prove', 'check', 'assert', 'confirm', 'lint'],
  feature: ['feature', 'implement', 'add support', 'new capability', 'enhancement'],
  research: ['research', 'investigate', 'benchmark', 'evaluate', 'survey'],
  needs_human: ['design doc', 'architecture', 'negotiation', 'legal', 'interview', 'ux review'],
};

/**
 * Classify a raw bounty into task_type + agent_solvable.
 * @param {{title?:string, description?:string, repo?:string}} raw
 * @param {{llmUrl?:string, llmKey?:string, model?:string}} [opts]
 * @returns {Promise<{task_type:import('./types.mjs').TaskType, agent_solvable:number, confidence:number, method:'llm'|'heuristic'}>}
 */
export async function classify(raw, opts = {}) {
  const text = `${raw.title || ''} ${raw.description || ''}`.toLowerCase();
  if (opts.llmUrl && opts.llmKey) {
    try {
      const r = await llmClassify(text, opts);
      if (r && TASK_TYPES.includes(r.task_type)) {
        return { ...r, method: 'llm' };
      }
    } catch (e) {
      // fall through to heuristic on any LLM failure
    }
  }
  return heuristic(text);
}

async function llmClassify(text, opts) {
  const prompt = `Classify this bounty for an AI coding agent. Reply JSON only: {"task_type":"debug|test|validate|feature|needs_human|research","agent_solvable":0.0-1.0,"confidence":0.0-1.0}. Bounty: ${text.slice(0, 800)}`;
  const res = await fetch(opts.llmUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.llmKey}` },
    body: JSON.stringify({ model: opts.model || 'kimi-k2.6', messages: [{ role: 'user', content: prompt }] }),
  });
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content || json?.content || '';
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no json from llm');
  return JSON.parse(m[0]);
}

function heuristic(text) {
  let best = 'feature', bestScore = 0;
  for (const [type, kws] of Object.entries(KEYWORD_MAP)) {
    const score = kws.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = type; }
  }
  const confidence = bestScore > 0 ? Math.min(1, 0.4 + bestScore * 0.15) : 0.3;
  return {
    task_type: /** @type {import('./types.mjs').TaskType} */ (best),
    agent_solvable: TASK_SOLVABLE_DEFAULT[best],
    confidence: Math.round(confidence * 100) / 100,
    method: 'heuristic',
  };
}
