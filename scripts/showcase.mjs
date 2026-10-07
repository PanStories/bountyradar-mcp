#!/usr/bin/env node
// scripts/showcase.mjs — generate a data-driven HTML preview of the live feed.
// Reads the SAME catalog the MCP server serves (no hand-written samples).
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadBounties, getFeed, getStats, loadSources, searchBounties } from '../src/core/catalog.mjs';

const OUT = fileURLToPath(new URL('../feed-samples.html', import.meta.url));
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function bar(label, v, color) {
  const pct = Math.round((v || 0) * 100);
  return `<div class="metric"><span class="ml">${label}</span><span class="track"><span class="fill" style="width:${pct}%;background:${color}"></span></span><span class="mv">${pct}%</span></div>`;
}

function card({ bounty: b, score: s }, rank) {
  return `<article class="card">
    <div class="rank">#${rank}</div>
    <div class="ctop">
      <span class="badge ${b.source}">${esc(b.source)}</span>
      <span class="task">${esc(b.task_type)}</span>
      <span class="reward">$${b.reward_usd}</span>
    </div>
    <h3>${esc(b.title)}</h3>
    <div class="compbar"><span class="fill" style="width:${Math.round(s.composite * 100)}%"></span></div>
    <div class="complabel">composite ${Math.round(s.composite * 100)}%</div>
    ${bar('solvable', s.agent_solvable, '#2DD4BF')}
    ${bar('fresh', s.freshness, '#38BDF8')}
    ${bar('low-comp', s.competition, '#A78BFA')}
    <div class="tags">${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${b.honeypot ? '<div class="warn">⚠ honeypot — excluded from default feed</div>' : ''}
    <a class="link" href="${esc(b.url)}" target="_blank" rel="noopener">open ↗</a>
    <details class="raw"><summary>Raw JSON</summary><pre>${esc(JSON.stringify({ bounty: b, score: s }, null, 2))}</pre></details>
  </article>`;
}

function main() {
  const B = loadBounties();
  const { items, total } = getFeed(B, { limit: 20 });
  const stats = getStats(B);
  const sources = loadSources().sources || [];
  const honeypot = getFeed(B, { include_honeypot: true, limit: 20 }).items.find((i) => i.bounty.honeypot);
  const searchDemo = searchBounties(B, 'webhook').items;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BountyRadar MCP — Feed Samples</title>
<style>
  :root{--bg:#0B1220;--surface:#111B2E;--text:#E6EDF6;--muted:#93A4BC;--accent:#2DD4BF;--line:#1F2C44}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,Segoe UI,Roboto,sans-serif}
  header{padding:28px 22px;border-bottom:1px solid var(--line)}
  h1{margin:0;font-size:24px} h1 span{color:var(--accent)} h2{margin:34px 0 12px;font-size:18px;border-left:3px solid var(--accent);padding-left:10px}
  .wrap{max-width:1100px;margin:0 auto;padding:0 22px 60px}
  .lead{color:var(--muted);margin:6px 0 0}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
  .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;position:relative}
  .rank{position:absolute;top:12px;right:14px;color:var(--muted);font-size:13px}
  .ctop{display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
  .badge{font:11px/1 ui-monospace,monospace;text-transform:uppercase;padding:3px 7px;border-radius:6px;background:#1c2942;color:var(--accent)}
  .task{font:11px/1 ui-monospace,monospace;color:var(--muted);text-transform:uppercase}
  .reward{margin-left:auto;font-weight:700;color:#fff}
  h3{margin:6px 0 10px;font-size:15px;line-height:1.35}
  .compbar{height:8px;background:#0c1626;border-radius:5px;overflow:hidden}
  .compbar .fill{display:block;height:100%;background:linear-gradient(90deg,#2DD4BF,#38BDF8)}
  .complabel{font-size:12px;color:var(--muted);margin:4px 0 10px}
  .metric{display:flex;align-items:center;gap:8px;margin:4px 0;font-size:12px}
  .ml{width:64px;color:var(--muted)}
  .track{flex:1;height:6px;background:#0c1626;border-radius:4px;overflow:hidden}
  .fill{display:block;height:100%}
  .mv{width:38px;text-align:right;color:var(--muted)}
  .tags{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
  .tag{font:11px/1 ui-monospace,monospace;background:#16223a;color:var(--muted);padding:3px 6px;border-radius:5px}
  .warn{margin-top:8px;color:#FBBF24;font-size:12px}
  .link{display:inline-block;margin-top:8px;color:var(--accent);font-size:13px;text-decoration:none}
  .raw{margin-top:8px} .raw summary{cursor:pointer;color:var(--muted);font-size:12px} .raw pre{background:#070d18;padding:10px;border-radius:8px;overflow:auto;font-size:11px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
  th{color:var(--muted);font-weight:600}
  .stat-row{display:flex;gap:18px;flex-wrap:wrap;margin-top:6px}
  .stat{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px}
  .stat b{display:block;font-size:22px;color:var(--accent)}
  .note{background:#0e1a2e;border:1px solid var(--line);border-radius:10px;padding:14px 16px;color:var(--muted);font-size:13px}
  .note b{color:var(--text)}
</style></head><body>
<header><div class="wrap" style="padding-bottom:0">
  <h1>BountyRadar <span>MCP</span> — Feed Samples</h1>
  <p class="lead">Live data the MCP server actually serves (${total} ranked bounties). Not a summary — expand "Raw JSON" on any card to see the exact bytes an agent receives.</p>
</div></header>
<div class="wrap">

  <h2>① What agents receive — get_bounty_feed (ranked, filtered)</h2>
  <div class="grid">${items.map((it, i) => card(it, i + 1)).join('')}</div>

  <h2>② Stats — get_stats</h2>
  <div class="stat-row">
    <div class="stat"><b>${stats.total}</b>total bounties</div>
    <div class="stat"><b>${Object.keys(stats.by_source).length}</b>sources</div>
    <div class="stat"><b>${stats.by_category.debug || 0}</b>debug</div>
    <div class="stat"><b>${stats.by_category.test || 0}</b>test</div>
    <div class="stat"><b>${stats.by_category.validate || 0}</b>validate</div>
  </div>

  <h2>③ Sources — list_sources</h2>
  <table><thead><tr><th>name</th><th>status</th><th>method</th><th>notes</th></tr></thead>
  <tbody>${sources.map((s) => `<tr><td>${esc(s.label || s.name)}</td><td>${esc(s.status)}</td><td>${esc(s.scrape_method || '')}</td><td>${(esc(s.notes) || '')}</td></tr>`).join('')}</tbody></table>

  <h2>④ Search demo — search_bounties("webhook") → ${searchDemo.length} hit(s)</h2>
  <div class="grid">${searchDemo.map((it, i) => card(it, i + 1)).join('')}</div>

  <h2>⑤ Honeypot guard — include_honeypot:true</h2>
  <div class="grid">${honeypot ? card(honeypot, '⚠') : '<p class="lead">none</p>'}</div>

  <h2>⑥ Content source & honesty</h2>
  <div class="note">
    <b>Source:</b> curated JSON catalog (<code>data/bounties/*.json</code>) + <code>data/sources.json</code>. Each record is human-curated or, when live creds are present, scraped from Opire/BountyHub/ClawHunt/Algora/GitHub and classified by a free-LLM (task_type / agent_solvable). No third-party content is repackaged as original; security entries are <b>indexed only</b> and never encourage agent spam (ToS + reputation risk).
  </div>

  <h2>⑦ How an agent consumes this feed</h2>
  <div class="note">
    BountyRadar is <b>pull-based &amp; read-only</b>. An agent connects via <code>initialize</code> → <code>get_bounty_feed({max_competition:3, agent_solvable_min:0.7})</code> → picks the top item → <code>get_bounty_detail</code>. To internalize, an orchestrator pre-pulls the feed and applies the <code>daily_bounty_brief</code> prompt (state the requirement → map to a concrete task). Apply = treat the scoring as a pre-action constraint; case studies/honeypot flags are decision guardrails. <b>It does NOT</b> modify agent weights/system prompts, force tool calls, auto-push, or edit curated content at request time.
  </div>
</div></body></html>`;

  writeFileSync(OUT, html);
  console.log(`showcase written: ${OUT} (${items.length} feed cards)`);
}

main();
