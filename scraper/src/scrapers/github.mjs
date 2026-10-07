// scraper/src/scrapers/github.mjs — real GitHub issue search (bounty / good-first-issue).
// Works with an optional token (higher rate limit); degrades to anonymous 60/hr.
// Returns RAW items; classification + record mapping happens in run.mjs.
const API = 'https://api.github.com';

export async function scrapeGitHub({ token, maxItems = 40 } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'BountyRadar/1.0' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const queries = [
    'label:bounty state:open',
    'label:"good first issue" state:open',
  ];
  const seen = new Set();
  const raw = [];
  for (const q of queries) {
    try {
      const url = `${API}/search/issues?q=${encodeURIComponent(q)}&per_page=${Math.ceil(maxItems / 2)}&sort=updated`;
      const r = await fetch(url, { headers });
      if (!r.ok) { console.error(`[github] ${q} -> ${r.status}`); continue; }
      const j = await r.json();
      for (const it of j.items || []) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        const reward = parseReward(it.body || it.title);
        // HONESTY: only keep issues that are actually bounties (a "$" reward
        // stated, or explicitly label:bounty). Unfunded "good first issues" are
        // noise, not bounties, and must not pollute the catalog.
        const isBounty = reward > 0 || (it.labels || []).some((l) => (typeof l === 'string' ? l : l.name).toLowerCase() === 'bounty');
        if (!isBounty) continue;
        raw.push({
          id: `github-${it.id}`,
          title: it.title,
          url: it.html_url,
          repo: (it.html_url.match(/github\.com\/([^/]+\/[^/]+)\/issues/) || [, ''])[1],
          description: (it.body || '').slice(0, 600),
          posted_at: it.created_at,
          updated_at: it.updated_at,
          competition_count: it.comments || 0,
          tags: (it.labels || []).map((l) => (typeof l === 'string' ? l : l.name)).slice(0, 8),
          reward_usd: reward,
          source: 'github',
        });
      }
    } catch (e) { console.error(`[github] error: ${e.message}`); }
  }
  return raw;
}

function parseReward(text) {
  // Opire-style "$120" or "reward: $50" or "bounty $200"
  const m = text.match(/\$\s?(\d{2,5})/);
  return m ? Number(m[1]) : 0;
}
