# Contributing to BountyRadar MCP

Pure intelligence/alerting layer — **never** a marketplace or settlement layer. Keep it that way.

## Local dev (zero install)
```
node --test                # schema + scoring + catalog
node scripts/mcp-smoke.mjs # spawn server, drive JSON-RPC
node scripts/showcase.mjs  # generate feed-samples.html
```

## Adding a bounty source
1. Add the source to `data/sources.json` (status, scrape_method).
2. Add scraped records to `data/bounties/<source>-<id>.json` (must validate against `schemas/bounty.schema.json`).
3. Keep `task_type` within the enum; `agent_solvable` is optional (derived if absent).
4. Run `node --test` — every shipped sample must validate.

## Enum sync (SPEC §11 C2)
If you change `task_type` / `source` enums, update all six places:
schema → `src/core/types.mjs` → `src/core/score.mjs` → `src/core/classify.mjs` → `data/` samples → `tests/`.

## Deploy (Apify PPE)
User-owned: `npm i` (optional deps), `apify login` (KYC required), `apify actor validate`, `apify actor push`.
