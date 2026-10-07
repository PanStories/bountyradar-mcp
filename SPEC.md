# SPEC.md — BountyRadar MCP

**Single source of truth (SPEC-as-Contract).** All implementation follows this file. Changes go through §13.

- **Product:** BountyRadar — an MCP server that aggregates AI-agent-solvable bounties across multiple sources and serves them as a ranked, agent-consumable feed with an *agent-solvability* score.
- **Target user:** Solo agent devs ("养虾人") and agent-farm operators who need a cross-source feed of *agent-solvable* tasks (debug / test / validate), scored for freshness and competition.
- **Core problem solved:** Target selection is the scarce skill in the agent-bounty economy (90% earnings come from ~3 receptive repos; public OSS bounties are agent-saturated). BountyRadar turns a noisy firehose into a ranked, agent-consumable feed.
- **Positioning:** Intelligence / alerting layer — **NOT** a marketplace or settlement layer (no custody, no KYC, no cross-border settlement). This is the deliberate white space identified in research.

---

## 1. Product Definition

- **One-liner:** "The judgment layer for the agent-bounty economy — aggregate, score for agent-solvability, and feed agents."
- **Target user:** Individuals/teams running AI agents to earn bounties (debugging, validation, testing).
- **Core problem:** Discovery is solved (Opire/Algora/BountyHub/ClawHunt exist); *selection* and *de-noising* are not. Agents need a ranked feed, not a webpage.

## 2. MVP Scope (RICE)

| Priority | Feature | Acceptance summary | RICE |
|----------|---------|-------------------|------|
| P0 | `get_bounty_feed` tool (ranked, filtered feed) | Returns top-N bounties ranked by composite score; filters: category, min_reward, max_competition, source, freshness_min, agent_solvable_min | 95 |
| P0 | `search_bounties` tool | Keyword + filter search across catalog | 80 |
| P0 | `get_bounty_detail` tool | Full record by id (incl. score breakdown) | 70 |
| P0 | Agent-solvability scoring (`score.mjs`) | task_type + agent_solvable + freshness + competition + composite; explainable | 90 |
| P1 | `score_bounty` tool | Returns raw score breakdown for one bounty | 55 |
| P1 | `list_sources` tool + resource | Source registry + status (live/curated) | 50 |
| P1 | `get_stats` tool | Counts by source / category / reward band | 45 |
| P1 | `subscribe_feed` tool | Saves a filter profile; returns poll descriptor + (hosted) webhook url | 40 |
| P1 | `bountyradar://feed/latest` resource | Latest ranked feed | 40 |
| P2 | `daily_bounty_brief` prompt | Briefs an agent on today's best targets | 30 |

## 3. Out-of-Scope (never / defer)

| Feature | Reason | Revisit when |
|---------|--------|--------------|
| Marketplace / settlement / custody / KYC | Legal/moat trap (ClawHunt owns this); we stay pure intelligence | Never — partner instead |
| Human-facing website / Newsletter | Research ranks it #2; MCP is #1 | After MCP retention signal |
| Real-time live scraping without keys | Needs Apify + LLM creds owned by user | User provides tokens |
| Encouraging HackerOne spam | ToS + reputational risk | Never |
| Paid monthly tier | WTP unverified; user prefers PPE | PPE revenue proves demand |

## 4. Technical Architecture (versions anchored)

| Layer | Technology | Version | Lock reason |
|-------|-----------|---------|-------------|
| Local MCP transport | Hand-written JSON-RPC 2.0 over stdio | Node 22 LTS | Zero-dependency; verified with cheapest-llm-router; no SDK/Express install needed |
| Hosted MCP transport | `@modelcontextprotocol/sdk` StreamableHTTPServerTransport (stateless) | ^1.25.1 | CVE-2025-66414 fix; DNS-rebinding protection required |
| Hosting | Apify Actor (Standby + PPE) | Apify SDK latest | Your 4-channel publish pipeline; PPE billing |
| Classification LLM | Cheapest-LLM Router / Cloudflare Workers AI (Kimi K2.6) | n/a | Zero marginal cost; free tier |
| Schema | JSON Schema Draft 2020-12 | n/a | Single fact source; `additionalProperties:false` |
| Test | `node --test` + custom smoke | Node 22 | No install; CI-ready |
| Lint | ESLint (optional) | ^9 | CI gate; degrades gracefully if absent |

## 5. API Surface (signatures)

**Tools**
- `get_bounty_feed({ limit?, category?, min_reward_usd?, max_competition?, source?, freshness_min?, agent_solvable_min?, sort? })` → `{ items: FeedItem[], total, generated_at }`
- `search_bounties({ query, limit?, category?, source? })` → `{ items: FeedItem[], total }`
- `get_bounty_detail({ id })` → `{ bounty: BountyRecord, score: ScoreBreakdown }`
- `score_bounty({ id })` → `{ id, score: ScoreBreakdown }`
- `list_sources({})` → `{ sources: SourceStatus[] }`
- `get_stats({})` → `{ by_source, by_category, reward_bands, total }`
- `subscribe_feed({ name, filters, webhook_url? })` → `{ subscription_id, filters, poll_descriptor, webhook_url? }`

**Resources**
- `bountyradar://feed/latest` (text/json) — latest ranked feed
- `bountyradar://stats` (text/json) — stats snapshot
- `bountyradar://sources` (text/json) — source registry

**Prompts**
- `daily_bounty_brief({ max_items? })` → prompt that briefs an agent on best targets today

## 6. Storage / Data

- `schemas/bounty.schema.json` — canonical BountyRecord schema.
- `data/bounties/*.json` — one file per bounty (curated sample ships 12 entries across Opire/BountyHub/ClawHunt/Algora/GitHub/HackerOne-valid).
- `data/sources.json` — source registry (name, url, status, scrape_method).
- No database; file-based catalog loaded at startup, cached in memory.

## 7. Pages

None in MVP (MCP-only). Website deferred (see §3).

## 8. Design Tokens (summary)

MCP is headless; tokens apply to the (deferred) site + showcase HTML. Per UIUX.md: deep-navy enterprise theme, zero-dependency inline SVG, no Indigo/Purple AI-default colors, no gradients, system fonts.

## 9. Acceptance Criteria (EARS)

- **AC-01 (P0):** On `initialize`, server returns protocol v2024-11-05 + capability `tools`, `resources`, `prompts`.
- **AC-02 (P0):** `tools/list` returns ≥7 tools with valid JSON-Schema input schemas.
- **AC-03 (P0):** `get_bounty_feed` returns items sorted by `composite` desc; each item includes `score` breakdown.
- **AC-04 (P0):** Filter `max_competition=0` returns only bounties with `competition_count===0`.
- **AC-05 (P0):** `get_bounty_detail` for unknown id returns a structured error, not a crash.
- **AC-06 (P1):** `score_bounty` returns `freshness`, `competition`, `agent_solvable`, `reward_score`, `composite` all in [0,1].
- **AC-07 (P1):** `resources/read` on `bountyradar://feed/latest` returns the same data as `get_bounty_feed`.
- **AC-08 (P0):** Schema validator rejects a bounty missing `id`/`source`/`title` (test proves it).
- **AC-09 (P1):** `subscribe_feed` returns a stable `subscription_id` and `poll_descriptor`.
- **AC-10 (P0):** stdout carries **only** JSON-RPC frames; all logs go to stderr.

## 10. Boundaries & Constraints

- Read-only, pull-based. No write to curated content at request time.
- Local stdio variant does not push; hosted Apify variant may push via webhook (user-owned).
- Classification is best-effort; labeled `confidence`. Not financial advice.
- Source platforms may rate-limit; refresh script degrades to curated catalog when keys absent.

## 11. Known Pitfalls (signatures + prevention)

- **C1 stdout contamination:** any `console.log` breaks JSON-RPC. → All logging via `console.error` / stderr only (enforced in server.mjs).
- **C2 enum drift:** task_type values must stay in sync across schema / types / score / classify / data / tests. → Single `TASK_TYPES` constant in `core/types.mjs`; tests assert membership.
- **C3 schema vs data mismatch:** curated samples must validate. → `tests/core.test.mjs` validates every shipped sample.
- **C4 Apify KYC wall:** PPE billing requires user KYC (Agentic Payments). → User does it; agent only writes config + gives commands.
- **C5 DNS-rebinding (hosted):** SDK HTTP transport must enable protection. → `enableDnsRebindingProtection:true` + `allowedHosts` in handler.mjs; `startServer()` binds the port itself (no `webServer` delegation — that never binds in Standby and gets the container killed) and answers the `x-apify-container-server-readiness-probe` header, else the Standby run never turns ready.

## 12. End-to-End Verification (copy-paste)

```bash
cd bountyradar-mcp
node --test                             # schema + scoring unit tests (no install)
node scripts/mcp-smoke.mjs              # spawn server: initialize -> tools/list -> tools/call
node scripts/showcase.mjs               # generate feed-samples HTML (data-driven)
```

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-10-06 | SPEC v1.0 created from opp-2-ideas research + design-mcp workflow | WorkBuddy |
