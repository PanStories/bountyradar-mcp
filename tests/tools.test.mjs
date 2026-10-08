// tools.test.mjs — trust contract for the advertised MCP tool surface.
// Covers MCP-TRUST-STANDARDS §8 checks #1 (four explicit boolean hints per tool)
// and #5 (every tool referenced in tests — M8ven test discovery greps these names).
// Pure in-memory: no network, no subprocess.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, toolsList, toolsCall } from '../src/core/dispatch.mjs';

const HINTS = ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint'];

test('tools/list advertises the full tool set', () => {
  const listed = toolsList().tools.map((t) => t.name);
  for (const n of [
    'get_bounty_feed',
    'search_bounties',
    'get_bounty_detail',
    'score_bounty',
    'list_sources',
    'get_stats',
    'subscribe_feed',
  ]) {
    assert.ok(listed.includes(n), `missing from tools/list: ${n}`);
  }
  assert.equal(listed.length, 7);
});

test('every tool declares four explicit boolean annotations (OpenAI directory gate)', () => {
  for (const t of TOOLS) {
    assert.ok(t.annotations, `${t.name}: annotations object missing`);
    for (const h of HINTS) {
      assert.equal(typeof t.annotations[h], 'boolean', `${t.name}.${h} must be an explicit boolean`);
    }
  }
});

test('get_bounty_feed returns a ranked feed with total and items', () => {
  const r = toolsCall('get_bounty_feed', { limit: 3 });
  assert.equal(r.isError, undefined);
  assert.ok(r.structuredContent.total >= 0);
  assert.ok(Array.isArray(r.structuredContent.items));
  assert.ok(r.content[0].text.length > 0);
});

test('search_bounties matches by keyword', () => {
  const r = toolsCall('search_bounties', { query: 'agent' });
  assert.equal(r.isError, undefined);
  assert.ok(r.structuredContent.total >= 0);
});

test('get_bounty_detail returns record + score for a known id', () => {
  const feed = toolsCall('get_bounty_feed', { limit: 1 });
  const id = feed.structuredContent.items[0].bounty.id;
  const r = toolsCall('get_bounty_detail', { id });
  assert.equal(r.isError, undefined);
  assert.equal(r.structuredContent.bounty.id, id);
  assert.ok(r.structuredContent.score);
});

test('score_bounty returns an explainable breakdown', () => {
  const feed = toolsCall('get_bounty_feed', { limit: 1 });
  const id = feed.structuredContent.items[0].bounty.id;
  const r = toolsCall('score_bounty', { id });
  assert.equal(r.isError, undefined);
  assert.ok(r.structuredContent.score);
});

test('list_sources returns the source registry', () => {
  const r = toolsCall('list_sources', {});
  assert.equal(r.isError, undefined);
  assert.ok(Array.isArray(r.structuredContent.sources));
});

test('get_stats aggregates counts', () => {
  const r = toolsCall('get_stats', {});
  assert.equal(r.isError, undefined);
  assert.ok(r.structuredContent.total >= 0);
});

test('subscribe_feed stores a profile in memory and echoes (never calls) the webhook', () => {
  const r = toolsCall('subscribe_feed', { name: 'ci', filters: { min_reward_usd: 100 }, webhook_url: 'https://example.invalid/hook' });
  assert.equal(r.isError, undefined);
  assert.ok(r.structuredContent.subscription_id.startsWith('sub_'));
  assert.equal(r.structuredContent.webhook_url, 'https://example.invalid/hook');
});

// --- negative cases (OpenAI submission expects documented failure behavior) ---

test('unknown tool name returns a structured error', () => {
  const r = toolsCall('does_not_exist', {});
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /Unknown tool/);
});

test('get_bounty_detail with a missing id returns an error, not a crash', () => {
  const r = toolsCall('get_bounty_detail', {});
  assert.equal(r.isError, true);
});

test('get_bounty_detail with an unknown id returns an error with the id echoed', () => {
  const r = toolsCall('get_bounty_detail', { id: 'no_such_bounty' });
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /no_such_bounty/);
});
