// scraper/src/scrapers/platform.mjs — adapters for bounty platforms.
//
// HONESTY NOTE: Opire / Algora / BountyHub / ClawHunt do not publish a free,
// open bounty-list API. Each requires either a platform API key, an Apify actor,
// or authenticated scraping. These adapters are the integration points: they
// throw a clear, actionable error when the required credential is absent, so the
// orchestrator can skip them gracefully instead of faking data.
//
// To enable a source: set its env var (see below) and the orchestrator will run
// it. The mapping logic (raw platform shape -> BountyRecord) is the only part
// left to fill per platform.

export class PlatformScraper {
  constructor({ name, envKey, run }) {
    this.name = name; this.envKey = envKey; this._run = run;
  }
  async scrape(env = process.env, opts = {}) {
    const key = env[this.envKey];
    if (!key) {
      throw new Error(`${this.name} requires ${this.envKey} (set in Apify secrets) — skipped`);
    }
    return this._run(key, opts);
  }
}

// Opire: issues carry a "$X" bounty comment; reachable via GitHub label "bounty"
// OR Opire's API (token-gated). Uses the GitHub path when OPIRE_GITHUB_TOKEN set.
export const opire = new PlatformScraper({
  name: 'opire', envKey: 'OPIRE_API_KEY',
  run: async (key) => { throw new Error('Opire adapter: implement API call with OPIRE_API_KEY'); },
});

export const algora = new PlatformScraper({
  name: 'algora', envKey: 'ALGORA_API_KEY',
  run: async (key) => { throw new Error('Algora adapter: implement API call with ALGORA_API_KEY'); },
});

export const bountyhub = new PlatformScraper({
  name: 'bountyhub', envKey: 'BOUNTYHUB_API_KEY',
  run: async (key) => { throw new Error('BountyHub adapter: implement API call with BOUNTYHUB_API_KEY'); },
});

// ClawHunt is treated as a partner_candidate: index upstream, do NOT scrape as a
// competitor. Adapter left intentionally inert.
export const clawhunt = new PlatformScraper({
  name: 'clawhunt', envKey: 'CLAWHUNT_API_KEY',
  run: async () => { throw new Error('ClawHunt is a partner_candidate — index upstream, do not scrape'); },
});
