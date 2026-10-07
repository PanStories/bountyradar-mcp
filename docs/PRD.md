# PRD.md — BountyRadar MCP (Product Requirements)

> PM expert output. Competitive intel is the 2026-10-06 opp-2-ideas market research report (workspace root). Do not re-run web research unless sources change.

## 1. User Personas

| Persona | Description | Top job-to-be-done |
|---------|-------------|--------------------|
| **Solo "养虾人"** (solo agent dev) | Runs 1–few agents for side income | Find *receptive* bounties an agent can actually solve, before 8 others do |
| **Farm operator** | Many parallel agents, continuous fresh targets | Allocate compute to highest-Yield targets; de-dup stale/assigned |
| **SMB / team** | Wants agents for internal validation/testing | One feed instead of 5 fragmented boards |

## 2. Problem Validation (from research)

- Public OSS bounty market is **agent-saturated** (Algora: 8–158 agent attempts/bounty within hours) → solo EV → 0.
- Multiple solo experiments conclude: *build tools for the people running agent farms*, not another agent competitor.
- Security channel broken by AI slop (84% noise; cURL/Nextcloud shut programs) → bottleneck is **triage/judgment**, not discovery.
- Verified demand: Codex earned $16.88 autonomously; one agent earned $455–755/30d (84 PRs, 59 merged) — but 90%+ from 3 receptive repos. **Selection is the skill.**

## 3. Competitive Landscape

- **ClawHunt (爪寻):** marketplace/settlement layer ($11k+ settled, 15% fee, Anker/Taobao/Ctrip). *Partner*, not competitor.
- **MCP Notify / Horizon:** aggregate+alert+MCP pattern — different data source (MCP registry / RSS). No overlap.
- **Opire / Algora / BountyHub / IssueHunt:** **data sources to scrape**, not competitors.
- **White space (us):** cross-source aggregation + LLM agent-solvability scoring + multi-channel alert + MCP consumption. Unoccupied.

## 4. MVP Scope (RICE-ordered — see SPEC §2)

Core feed (`get_bounty_feed`, `search_bounties`, `get_bounty_detail`) + scoring layer + sources/stats/subscribe. Website deferred.

## 5. Monetization Model

**Pure Pay-Per-Event (Apify PPE).** No monthly fee (user preference).

| Event | Price (USD) | Rationale |
|-------|------------|-----------|
| mcp-initialize / mcp-list-tools / list_sources | $0.000 | Free probe — low-friction trial |
| get_bounty_feed | $0.0005 | Core value event |
| search_bounties | $0.0010 | Reasoning + filter |
| score_bounty / get_stats / subscribe_feed | $0.0005 | Light |

Free local stdio usage forever (OSS). Hosted convenience is what's metered.

## 6. Decision Record

| ID | Decision | Driver |
|----|----------|--------|
| D1 | Pure intelligence layer, no marketplace | Avoid KYC/custody trap; research white space |
| D2 | MCP-first, website-second | Research form ranking #1 |
| D3 | PPE, no monthly fee | User stated preference |
| D4 | Curated catalog + Apify refresh (graceful) | Zero-marginal-cost; works without keys |
| D5 | Free-LLM classification (Kimi/Workers AI) | Zero marginal cost scoring |
