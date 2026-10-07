# Changelog

## 1.0.0 (2026-10-06)
- Initial release. Zero-dependency stdio MCP server + Apify PPE hosted variant.
- 7 tools (get_bounty_feed, search_bounties, get_bounty_detail, score_bounty, list_sources, get_stats, subscribe_feed).
- 3 resources (feed/latest, stats, sources) + 1 prompt (daily_bounty_brief).
- Deterministic agent-solvability scoring (freshness / competition / agent_solvable / reward / composite).
- Curated catalog of 12 sample bounties across 7 sources with a honeypot guard.
- Graceful refresh script (Apify scrape + free-LLM classify) that serves curated catalog without creds.
