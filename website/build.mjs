#!/usr/bin/env node
// website/build.mjs — generate the zero-dependency BountyRadar static site from
// the SAME catalog the MCP server serves (single source of truth).
// Output: website/public/{index,sources,subscribe,about}.html + assets/* + SEO.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadBounties, getFeed, getStats, loadSources } from '../src/core/catalog.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = `${ROOT}public`;
mkdirSync(`${PUBLIC}/assets`, { recursive: true });

/* ================= assets content (defined before use) ================= */
const CSS = `:root{--bg:#0B1220;--surface:#111B2E;--surface2:#16223A;--text:#E6EDF6;--muted:#93A4BC;--accent:#2DD4BF;--sky:#38BDF8;--violet:#A78BFA;--line:#1F2C44;--warn:#FBBF24;--danger:#F87171;--radius:12px}
[data-theme="light"]{--bg:#F4F7FB;--surface:#FFFFFF;--surface2:#EEF3F9;--text:#0E1726;--muted:#51607A;--line:#DCE4EF;--radius:12px}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--text);font:15px/1.55 system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px}
.skip{position:absolute;left:-999px;top:0;background:var(--accent);color:#04201c;padding:8px 12px;border-radius:0 0 8px 0;z-index:10}
.skip:focus{left:0}
.topbar{border-bottom:1px solid var(--line);background:var(--surface);position:sticky;top:0;z-index:5}
.bar{display:flex;align-items:center;gap:18px;height:60px}
.brand{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--text);font-size:17px}
.brand .dot{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--accent),#0c8c7e)}
.nav{display:flex;gap:4px;margin-left:auto}
.nav a{color:var(--muted);padding:7px 12px;border-radius:8px;font-size:14px}
.nav a.active,.nav a:hover{color:var(--text);background:var(--surface2);text-decoration:none}
.toggle{margin-left:10px;background:var(--surface2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:7px 12px;cursor:pointer;font-size:13px}
.toggle:hover{border-color:var(--accent)}
main.wrap{padding-top:34px;padding-bottom:60px}
.foot{border-top:1px solid var(--line);padding:22px 0;color:var(--muted);font-size:13px}
.foot .wrap{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
.hero{padding:18px 0 8px}
.hero h1{font-size:30px;line-height:1.2;margin:0 0 12px;max-width:18ch}
.hero h1 span{color:var(--accent)}
.lead{color:var(--muted);font-size:16px;max-width:70ch;margin:0 0 18px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-block;padding:10px 18px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--text);font-weight:600;font-size:14px}
.btn:hover{text-decoration:none;border-color:var(--accent)}
.btn.primary{background:var(--accent);color:#04201c;border-color:var(--accent)}
.section{margin-top:40px}
.section h2{font-size:20px;margin:0 0 14px;border-left:3px solid var(--accent);padding-left:11px}
.band{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px;min-width:120px}
.stat b{display:block;font-size:24px;color:var(--accent)}
.stat span{color:var(--muted);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px;position:relative}
.card .rank{position:absolute;top:12px;right:14px;color:var(--muted);font-size:13px}
.ctop{display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
.badge{font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;padding:3px 7px;border-radius:6px;background:var(--surface2);color:var(--accent)}
.task{font:11px/1 ui-monospace,monospace;text-transform:uppercase}
.reward{margin-left:auto;font-weight:700;color:var(--text)}
.card h3{margin:4px 0 8px;font-size:15px;line-height:1.35}
.card h3 a{color:var(--text)}
.repo{font:12px/1 ui-monospace,monospace;color:var(--muted);margin-bottom:8px;word-break:break-all}
.compbar{height:8px;background:var(--surface2);border-radius:5px;overflow:hidden}
.compbar .fill{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--sky))}
.complabel{font-size:12px;color:var(--muted);margin:5px 0 9px}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{font:11px/1 ui-monospace,monospace;background:var(--surface2);color:var(--muted);padding:3px 6px;border-radius:5px}
.warn{margin-top:8px;color:var(--warn);font-size:12px}
.note{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;color:var(--muted);font-size:13px;margin-top:24px}
.note b{color:var(--text)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.step{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px}
.step .n{width:30px;height:30px;border-radius:50%;background:var(--accent);color:#04201c;display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:10px}
.step h3{margin:0 0 6px;font-size:16px}
.step p{margin:0;color:var(--muted);font-size:14px}
.cta{text-align:center}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px}
.panel.ok{border-color:rgba(45,212,191,.5)}
.panel.no{border-color:rgba(248,113,113,.5)}
.panel h3{margin:0 0 10px;font-size:16px}
.panel ul{margin:0;padding-left:18px;color:var(--muted);font-size:14px}
.panel ul li{margin:4px 0}
.code{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px;font:13px/1.5 ui-monospace,monospace;color:var(--text);overflow:auto}
table.src{width:100%;border-collapse:collapse;font-size:14px}
table.src th,table.src td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}
table.src th{color:var(--muted);font-weight:600}
.badge.partner_candidate{color:var(--violet)}
.badge.live{color:var(--accent)}
.badge.curated_opt_in{color:var(--sky)}
.form{max-width:520px;display:flex;flex-direction:column;gap:14px}
.form label{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--text)}
.form input[type=email],.form input[type=number]{padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:14px}
.fieldset,.form fieldset{border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;gap:14px;flex-wrap:wrap}
.form fieldset legend{color:var(--muted);font-size:13px;padding:0 6px}
.chk{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--text)}
.msg{font-size:14px;min-height:20px}
.msg.ok{color:var(--accent)}
.msg.err{color:var(--danger)}
@media(max-width:640px){.two{grid-template-columns:1fr}.nav a{padding:7px 8px}}
`;

const THEME_JS = `(function(){try{var t=localStorage.getItem('br-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
`;

const APP_JS = `// theme toggle
(function(){var b=document.getElementById('theme-toggle');if(b){b.addEventListener('click',function(){var cur=document.documentElement.getAttribute('data-theme');var next=cur==='light'?'dark':'light';document.documentElement.setAttribute('data-theme',next);try{localStorage.setItem('br-theme',next)}catch(e){}});}}());
// subscribe form -> POST /subscribe, keep values on failure
(function(){var f=document.getElementById('sub-form');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var m=document.getElementById('sub-msg');m.className='msg';m.textContent='submitting...';var data=Object.fromEntries(new FormData(f).entries());data.channel=Array.from(f.querySelectorAll('input[name=channel]:checked')).map(function(i){return i.value});data.category=Array.from(f.querySelectorAll('input[name=category]:checked')).map(function(i){return i.value});fetch('/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(o){if(o.ok&&o.j.ok){m.className='msg ok';m.textContent='Subscribed. Check your inbox (dry-run: logged only until KV is bound).';f.reset();}else{throw new Error((o.j&&o.j.error)||'submit failed')}}).catch(function(err){m.className='msg err';m.textContent='Could not subscribe: '+err.message+' — your input is kept.';});});})();
`;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = (v) => Math.round((v || 0) * 100);

/* ---------- data ---------- */
const B = loadBounties();
const stats = getStats(B);
const sources = (loadSources().sources || []).filter((s) => s.status !== 'partner_candidate');
const feed = getFeed(B, { limit: 12 }).items;
const totalSources = (loadSources().sources || []).length;
const generatedAt = new Date().toISOString();

/* ---------- shared card ---------- */
function card({ bounty: b, score: s }, rank) {
  const colors = { debug: '#2DD4BF', test: '#38BDF8', validate: '#A78BFA', feature: '#FBBF24', needs_human: '#F87171', research: '#94A3B8' };
  const ac = colors[b.task_type] || '#94A3B8';
  return `<article class="card" data-source="${esc(b.source)}" data-category="${esc(b.task_type)}">
    <div class="rank">#${rank}</div>
    <div class="ctop">
      <span class="badge">${esc(b.source)}</span>
      <span class="task" style="color:${ac}">${esc(b.task_type)}</span>
      <span class="reward">$${b.reward_usd}</span>
    </div>
    <h3><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.title)}</a></h3>
    ${b.repo ? `<div class="repo">${esc(b.repo)}</div>` : ''}
    <div class="compbar"><span class="fill" style="width:${pct(s.composite)}%"></span></div>
    <div class="complabel">composite ${pct(s.composite)}% · solvable ${pct(s.agent_solvable)}% · fresh ${pct(s.freshness)}% · low-comp ${pct(s.competition)}%</div>
    <div class="tags">${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${b.honeypot ? '<div class="warn">honeypot — excluded from default feed</div>' : ''}
  </article>`;
}

/* ---------- layout ---------- */
const NAV = [
  ['index.html', 'Feed'],
  ['sources.html', 'Sources'],
  ['subscribe.html', 'Subscribe'],
  ['about.html', 'About'],
];
function layout({ title, description, active, body, noindex }) {
  const nav = NAV.map(([href, label]) => `<a href="${href}" class="${label.toLowerCase() === active ? 'active' : ''}">${label}</a>`).join('');
  return `<!doctype html><html lang="en" data-theme="dark"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — BountyRadar</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex,nofollow">' : ''}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230B1220'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%232DD4BF'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/styles.css">
<script src="assets/theme.js"></script>
</head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="wrap bar">
  <a class="brand" href="index.html"><span class="dot"></span>BountyRadar</a>
  <nav class="nav">${nav}</nav>
  <button id="theme-toggle" class="toggle" aria-label="Toggle theme">theme</button>
</div></header>
<main id="main" class="wrap">${body}</main>
<footer class="foot"><div class="wrap">
  <span>BountyRadar — the intelligence layer for the agent-bounty economy. Not a marketplace.</span>
  <span class="muted">Generated ${esc(generatedAt.slice(0, 10))} · data: curated catalog</span>
</div></footer>
<script src="assets/app.js"></script>
</body></html>`;
}

/* ---------- pages ---------- */
function indexPage() {
  const statsBand = `<div class="band">
    <div class="stat"><b>${stats.total}</b><span>ranked bounties</span></div>
    <div class="stat"><b>${totalSources}</b><span>sources tracked</span></div>
    <div class="stat"><b>${stats.by_category.debug || 0}</b><span>debug</span></div>
    <div class="stat"><b>${stats.by_category.test || 0}</b><span>test</span></div>
    <div class="stat"><b>${stats.by_category.validate || 0}</b><span>validate</span></div>
  </div>`;
  const how = `<section class="section">
    <h2>How it works</h2>
    <div class="steps">
      <div class="step"><div class="n">1</div><h3>Aggregate</h3><p>We pull AI-agent-solvable bounties from Opire, BountyHub, ClawHunt, Algora, GitHub and validated security programs.</p></div>
      <div class="step"><div class="n">2</div><h3>Score</h3><p>A deterministic, explainable model ranks each by agent-solvability, freshness, competition and reward.</p></div>
      <div class="step"><div class="n">3</div><h3>Alert</h3><p>Subscribers and agents receive a ranked, filtered feed — by email, Slack, or the MCP server.</p></div>
    </div>
  </section>`;
  const cta = `<section class="section cta">
    <h2>Get the feed</h2>
    <p>Connect the <a href="about.html#mcp">MCP server</a> for programmatic access, or <a href="subscribe.html">subscribe</a> for the daily digest.</p>
    <div class="cta-row">
      <a class="btn primary" href="subscribe.html">Subscribe to alerts</a>
      <a class="btn" href="sources.html">View sources</a>
    </div>
  </section>`;
  const honest = `<section class="note">
    <b>Data status.</b> This site renders the same curated catalog the MCP server serves. Live scraping (Opire / Algora / BountyHub / GitHub) activates when API credentials are present; until then the catalog is hand-curated and labeled as such. Security entries are indexed only and never encourage agent spam.
  </section>`;
  const body = `<section class="hero">
    <h1>The intelligence layer for the <span>agent-bounty economy</span></h1>
    <p class="lead">BountyRadar aggregates, scores and alerts on bounties that AI agents can actually solve — debugging, validation, testing and more. Not a marketplace. A ranked, filtered feed for agents and the humans who run them.</p>
    <div class="cta-row">
      <a class="btn primary" href="subscribe.html">Get daily alerts</a>
      <a class="btn" href="about.html#mcp">Use the MCP server</a>
    </div>
  </section>
  ${statsBand}
  <section class="section">
    <h2>Top ranked feed</h2>
    <div class="grid">${feed.map((it, i) => card(it, i + 1)).join('')}</div>
  </section>
  ${how}${cta}${honest}`;
  return layout({ title: 'Feed', description: 'Aggregated, scored, agent-solvable bounties across Opire, BountyHub, ClawHunt, Algora, GitHub and validated security programs.', active: 'feed', body });
}

function sourcesPage() {
  const all = loadSources().sources || [];
  const rows = all.map((s) => `<tr>
    <td><b>${esc(s.label || s.name)}</b></td>
    <td><span class="badge ${esc(s.status)}">${esc(s.status)}</span></td>
    <td>${esc(s.scrape_method || '—')}</td>
    <td class="muted">${esc(s.notes || '')}</td>
  </tr>`).join('');
  const body = `<section class="section">
    <h2>Sources we track</h2>
    <p class="lead">Seven source classes. <code>partner_candidate</code> sources (e.g. ClawHunt) are settlement layers we index upstream rather than compete with.</p>
    <table class="src"><thead><tr><th>source</th><th>status</th><th>method</th><th>notes</th></tr></thead><tbody>${rows}</tbody></table>
  </section>`;
  return layout({ title: 'Sources', description: 'Source registry: Opire, BountyHub, ClawHunt, Algora, GitHub, validated security and curated entries.', active: 'sources', body });
}

function subscribePage() {
  const body = `<section class="section">
    <h2>Subscribe to bounty alerts</h2>
    <p class="lead">Get a daily digest of the highest-composite, lowest-competition agent-solvable bounties. Free tier. No monthly fee.</p>
    <form id="sub-form" class="form" action="/subscribe" method="post">
      <label>Email <input type="email" name="email" required maxlength="120" placeholder="you@agentfarm.io"></label>
      <fieldset><legend>Channels</legend>
        <label class="chk"><input type="checkbox" name="channel" value="email" checked> Email</label>
        <label class="chk"><input type="checkbox" name="channel" value="slack"> Slack (webhook)</label>
      </fieldset>
      <fieldset><legend>Categories</legend>
        ${['debug', 'test', 'validate', 'feature', 'research'].map((c) => `<label class="chk"><input type="checkbox" name="category" value="${c}" checked> ${c}</label>`).join('')}
      </fieldset>
      <label>Minimum reward (USD) <input type="number" name="min_reward" value="0" min="0" step="10"></label>
      <label>Max competition (known attempts) <input type="number" name="max_competition" value="5" min="0" step="1"></label>
      <button type="submit" class="btn primary">Subscribe</button>
      <p id="sub-msg" class="msg" role="status"></p>
    </form>
    <section class="note"><b>Privacy.</b> We store only your email and filter preferences in a Cloudflare KV namespace. Subscribers can be exported by the operator only. No resale.</section>
  </section>`;
  return layout({ title: 'Subscribe', description: 'Subscribe to the BountyRadar daily digest of agent-solvable bounties. Free, no monthly fee.', active: 'subscribe', body, noindex: false });
}

function aboutPage() {
  const body = `<section class="section">
    <h2>What BountyRadar is — and is not</h2>
    <p class="lead">BountyRadar is an <b>intelligence and alerting layer</b>, not a bounty marketplace. We do not hold funds, perform KYC, or settle payouts. We turn a noisy firehose of bounties into a ranked, agent-consumable feed.</p>
    <div class="two">
      <div class="panel ok"><h3>We do</h3><ul><li>Aggregate across 7 source classes</li><li>Score for agent-solvability, freshness, competition, reward</li><li>Alert subscribers and agents (email / Slack / MCP)</li><li>Flag honeypots and ToS-risky programs</li></ul></div>
      <div class="panel no"><h3>We don't</h3><ul><li>Settle payouts or hold funds</li><li>Run KYC / compliance</li><li>Compete with agent farms</li><li>Encourage agents to spam HackerOne</li></ul></div>
    </div>
  </section>
  <section class="section" id="mcp">
    <h2>MCP server</h2>
    <p>The same feed is available programmatically. An agent connects via <code>initialize</code> → <code>get_bounty_feed({max_competition:3, agent_solvable_min:0.7})</code> → picks the top item. Monetized per event on Apify — <b>no monthly fee</b>.</p>
    <pre class="code">tools: get_bounty_feed · search_bounties · get_bounty_detail
       score_bounty · list_sources · get_stats · subscribe_feed
resources: bountyradar://feed/latest · //stats · //sources
prompts:  daily_bounty_brief</pre>
  </section>
  <section class="section">
    <h2>The moat</h2>
    <p>Anyone can scrape a bounty board. The scarce layer is <b>judgment</b>: scoring each bounty for whether an agent can actually solve it, how fresh it is, and how saturated the competition already is. That is what converts noise into a feed agents trust.</p>
  </section>
  <section class="section">
    <h2>Partnerships</h2>
    <p>ClawHunt (爪寻) is a direct competitor-as-marketplace in China. We treat it as a <b>partner candidate</b>: BountyRadar is the upstream intelligence feed; ClawHunt is the settlement layer. We index, they settle.</p>
  </section>`;
  return layout({ title: 'About', description: 'What BountyRadar is: the intelligence layer for the agent-bounty economy. MCP server, scoring moat, partnership model.', active: 'about', body });
}

/* ---------- write ---------- */
writeFileSync(`${PUBLIC}/index.html`, indexPage());
writeFileSync(`${PUBLIC}/sources.html`, sourcesPage());
writeFileSync(`${PUBLIC}/subscribe.html`, subscribePage());
writeFileSync(`${PUBLIC}/about.html`, aboutPage());
writeFileSync(`${PUBLIC}/assets/styles.css`, CSS);
writeFileSync(`${PUBLIC}/assets/theme.js`, THEME_JS);
writeFileSync(`${PUBLIC}/assets/app.js`, APP_JS);

/* ---------- SEO ---------- */
writeFileSync(`${PUBLIC}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /subscribe\nSitemap: /sitemap.xml\n`);
const urls = ['index.html', 'sources.html', 'about.html'].map((p) => `  <url><loc>https://bountyradar.example/${p}</loc><changefreq>daily</changefreq></url>`).join('\n');
writeFileSync(`${PUBLIC}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`site built: ${feed.length} feed cards, ${stats.total} bounties, ${totalSources} sources -> ${PUBLIC}`);
