// tests/core.test.mjs — node --test (zero install). Covers schema + scoring + catalog.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBounty } from '../src/core/validate.mjs';
import { scoreBounty, rankBounties } from '../src/core/score.mjs';
import { loadBounties, getFeed, searchBounties, getStats } from '../src/core/catalog.mjs';

test('schema rejects missing required fields', () => {
  const r = validateBounty({ id: 'x' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('title')));
  assert.ok(r.errors.some((e) => e.includes('source')));
});

test('schema rejects unknown property (additionalProperties:false)', () => {
  const r = validateBounty({ id: 'x', title: 't', source: 'opire', url: 'https://a.b/c', task_type: 'debug', reward_usd: 1, posted_at: '2026-01-01T00:00:00Z', evil: 1 });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('evil')));
});

test('schema rejects bad enum + bad uri', () => {
  const r = validateBounty({ id: 'x', title: 't', source: 'bogus', url: 'not-a-url', task_type: 'debug', reward_usd: 1, posted_at: '2026-01-01T00:00:00Z' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('source')));
  assert.ok(r.errors.some((e) => e.includes('uri')));
});

test('scoreBounty returns all components in [0,1]', () => {
  const s = scoreBounty({ task_type: 'debug', reward_usd: 250, competition_count: 2, updated_at: new Date().toISOString() });
  for (const k of ['freshness', 'competition', 'agent_solvable', 'reward_score', 'composite']) {
    assert.ok(s[k] >= 0 && s[k] <= 1, `${k}=${s[k]}`);
  }
});

test('rankBounties sorts by composite desc', () => {
  const ranked = rankBounties([
    { task_type: 'needs_human', reward_usd: 10, competition_count: 0, posted_at: '2026-10-01T00:00:00Z' },
    { task_type: 'debug', reward_usd: 500, competition_count: 0, posted_at: '2026-10-05T00:00:00Z' },
  ]);
  assert.ok(ranked[0].score.composite >= ranked[1].score.composite);
});

test('getFeed max_competition=0 returns only zero-competition', () => {
  const B = loadBounties();
  const { items } = getFeed(B, { max_competition: 0 });
  assert.ok(items.every((i) => (i.bounty.competition_count || 0) === 0));
});

test('getFeed excludes honeypot by default', () => {
  const B = loadBounties();
  const { items } = getFeed(B, {});
  assert.ok(items.every((i) => !i.bounty.honeypot));
});

test('getFeed agent_solvable_min filters', () => {
  const B = loadBounties();
  const { items } = getFeed(B, { agent_solvable_min: 0.8 });
  assert.ok(items.every((i) => i.score.agent_solvable >= 0.8));
});

test('loadBounties loads all shipped samples and they validate (AC-08)', () => {
  const B = loadBounties();
  assert.ok(B.length >= 12);
  for (const b of B) assert.equal(validateBounty(b).valid, true, `invalid: ${b.id}`);
});

test('searchBounties finds by keyword', () => {
  const B = loadBounties();
  const { items, total } = searchBounties(B, 'webhook');
  assert.ok(total >= 1);
  assert.ok(items.some((i) => i.bounty.id === 'clawhunt-001'));
});

test('getStats totals match catalog', () => {
  const B = loadBounties();
  const s = getStats(B);
  assert.equal(s.total, B.length);
  assert.ok(Object.keys(s.by_source).length >= 5);
});
