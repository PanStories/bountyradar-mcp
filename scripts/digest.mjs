#!/usr/bin/env node
// scripts/digest.mjs — build + deliver the BountyRadar daily subscriber digest.
//
// Sources the SAME catalog the MCP server serves, filters to each subscriber's
// saved profile, and renders an Email + Slack digest.
//
// Modes:
//   node scripts/digest.mjs                 # dry-run: build, write files, print preview
//   node scripts/digest.mjs --send          # also POST to SLACK_WEBHOOK_URL (if set)
//
// Subscribers:
//   - data/subscribers.json  (seeded sample; used in dry-run / no KV)
//   - KV (optional): CF_API_TOKEN + CF_ACCOUNT_ID + CF_KV_NS_ID  -> live list
//
// Honesty: sample subscriber is flagged; digest never claims live scraping.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadBounties, getFeed, getStats, loadSources } from '../src/core/catalog.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SUBS_FILE = `${ROOT}data/subscribers.json`;
const OUT_MD = `${ROOT}digest-latest.md`;
const OUT_HTML = `${ROOT}digest-latest.html`;

const SLACK = process.env.SLACK_WEBHOOK_URL;
const SEND = process.argv.includes('--send');

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- subscribers ---------- */
async function loadSubscribers() {
  // Live KV path (optional)
  if (process.env.CF_API_TOKEN && process.env.CF_ACCOUNT_ID && process.env.CF_KV_NS_ID) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NS_ID}/keys?prefix=sub:`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } });
    const j = await r.json();
    const keys = (j.result || []).map((k) => k.name);
    const subs = [];
    for (const k of keys) {
      const g = await fetch(url.replace('/keys?', `/values/${encodeURIComponent(k)}?`), { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } });
      if (g.ok) subs.push(JSON.parse(await g.text()));
    }
    return { subs, live: true };
  }
  // Seeded sample
  if (existsSync(SUBS_FILE)) {
    const arr = JSON.parse(readFileSync(SUBS_FILE, 'utf8'));
    return { subs: arr, live: false };
  }
  return { subs: [], live: false };
}

/* ---------- build per-subscriber digest ---------- */
function buildDigest(sub, B) {
  const filters = {
    category: (sub.category && sub.category.length) ? undefined : undefined,
    min_reward_usd: sub.min_reward || 0,
    max_competition: sub.max_competition != null ? sub.max_competition : 5,
    agent_solvable_min: 0.6,
    sort: 'composite',
    limit: 8,
  };
  // category filter: keep only selected categories if any
  if (sub.category && sub.category.length) {
    const items = getFeed(B, { ...filters, limit: 50 }).items.filter((i) => sub.category.includes(i.bounty.task_type));
    const items2 = items.slice(0, filters.limit);
    return render(sub, items2, B);
  }
  const { items } = getFeed(B, filters);
  return render(sub, items, B);
}

function render(sub, items, B) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = items.map(({ bounty: b, score: s }, i) =>
    `${i + 1}. [${b.source}] ${b.title} — $${b.reward_usd} · solvable ${Math.round(s.agent_solvable * 100)}% · comp ${b.competition_count} · fresh ${Math.round(s.freshness * 100)}%${b.honeypot ? ' · HONEYPOT' : ''}\n   ${b.url}`);
  const md = `# BountyRadar Daily — ${date}\n\nFor ${sub.email} (${sub.channel ? sub.channel.join(', ') : 'email'})\n\n${lines.join('\n') || '_No bounties matched your filters today._'}\n\n--\nBountyRadar · intelligence layer for the agent-bounty economy · not a marketplace.\n`;
  const cards = items.map(({ bounty: b, score: s }, i) => `<tr><td>${i + 1}</td><td><b>${esc(b.source)}</b></td><td><a href="${esc(b.url)}">${esc(b.title)}</a></td><td>$${b.reward_usd}</td><td>${Math.round(s.agent_solvable * 100)}%</td><td>${b.competition_count}</td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>body{font:15px/1.5 system-ui,sans-serif;background:#0B1220;color:#E6EDF6;padding:24px}a{color:#2DD4BF}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{text-align:left;padding:8px 10px;border-bottom:1px solid #1F2C44}</style></head><body><h2>BountyRadar Daily — ${date}</h2><p>For ${esc(sub.email)}</p><table><tr><th>#</th><th>source</th><th>bounty</th><th>reward</th><th>solvable</th><th>comp</th></tr>${cards || '<tr><td colspan=6>No matches</td></tr>'}</table><p style="color:#93A4BC;margin-top:18px">BountyRadar — the intelligence layer. Not a marketplace.</p></body></html>`;
  return { md, html, count: items.length };
}

/* ---------- deliver ---------- */
async function sendSlack(text) {
  if (!SLACK) { console.error('[digest] SLACK_WEBHOOK_URL not set — skipping Slack send'); return false; }
  try {
    const r = await fetch(SLACK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    console.error(`[digest] Slack -> ${r.status}`);
    return r.ok;
  } catch (e) { console.error('[digest] Slack error:', e.message); return false; }
}

/* ---------- main ---------- */
async function main() {
  const B = loadBounties();
  const stats = getStats(B);
  const { subs, live } = await loadSubscribers();
  console.error(`[digest] catalog: ${stats.total} bounties · subscribers: ${subs.length} (${live ? 'live KV' : 'seeded sample'})`);

  if (!subs.length) {
    console.error('[digest] no subscribers — nothing to send (dry-run abort).');
    return;
  }

  const built = subs.map((s) => ({ sub: s, ...buildDigest(s, B) }));
  // Write combined latest for preview / archive
  const combined = built.map((d) => d.md).join('\n\n------\n\n');
  writeFileSync(OUT_MD, combined);
  writeFileSync(OUT_HTML, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BountyRadar digest preview</title><style>body{font:14px/1.5 ui-monospace,monospace;background:#0B1220;color:#E6EDF6;padding:20px;white-space:pre-wrap}</style></head><body>${esc(combined)}</body></html>`);

  console.error(`[digest] wrote ${OUT_MD} (${built.length} subscriber digests)`);
  built.forEach((d) => console.error(`  - ${d.sub.email}: ${d.count} matches`));

  if (SEND) {
    for (const d of built) {
      if ((d.sub.channel || []).includes('slack')) await sendSlack(d.md);
    }
  } else {
    console.error('[digest] dry-run (no --send). Preview top digest:');
    console.error(built[0].md.split('\n').slice(0, 12).join('\n'));
  }
}

main().catch((e) => { console.error('[digest] error:', e.message); process.exit(1); });
