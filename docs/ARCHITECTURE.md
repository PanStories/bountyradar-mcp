# ARCHITECTURE.md — BountyRadar MCP

> Architect expert output.

## 1. Tech Selection Matrix (scored)

| Option | Score | Verdict |
|--------|:----:|---------|
| SDK + Express (hosted) | 7 | Needed only for Apify PPE; heavier |
| **Zero-dep stdio (hand JSON-RPC)** | 9 | Chosen for local; verified pattern; no install; instant run |
| Database (SQLite/Postgres) | 3 | Overkill; file catalog sufficient for MVP |
| Full crawler microservice | 4 | Deferred; refresh script + Apify actor instead |

## 2. Deployment Model

- **Local / OSS:** zero-dependency `server.mjs` over stdio. Runs with plain `node`. Distributed via npm (`npx -y bountyradar-mcp`) + Smithery + Sartbot + mcp.so.
- **Hosted / metered:** `http.mjs` (the actor's main process) on Apify — Express + `@modelcontextprotocol/sdk` StreamableHTTPServerTransport (stateless), `Actor.charge({eventName})` on PPE events. The main process binds the HTTP port itself and answers the `x-apify-container-server-readiness-probe` header (Standby-safe — do NOT delegate via `actor.json` `webServer.requestHandler`, which never binds the port in Standby and gets the container killed). Dynamic-imports the SDK/apify so the module still loads without optional deps.

## 3. Cost Model

- Classification: free-LLM (Cloudflare Workers AI / Kimi K2.6 via Cheapest-LLM Router) → ~$0 marginal.
- Hosting: Apify free tier for dev; PPE revenue funds scale.
- Storage: file-based, $0.

## 4. Data Layer (ADR-003)

- **Single fact source:** `schemas/bounty.schema.json` (Draft 2020-12, `additionalProperties:false`).
- **Catalog:** `data/bounties/*.json` (one per bounty) + `data/sources.json`.
- **Load:** `core/catalog.mjs` reads dir at startup, validates each against schema, caches in memory.
- **Refresh:** `scripts/refresh.mjs` — if `APIFY_TOKEN` + LLM creds present, scrape sources → `core/classify.mjs` labels task_type/agent_solvable → write catalog. **Graceful:** without keys, server serves curated catalog unchanged.

## 5. Scoring Layer (the moat — `core/score.mjs`)

```
freshness      = exp(-ageDays / 14)                         # half-life ~10d
competition    = 1 / (1 + competition_count)                # 0 tries -> 1.0
agent_solvable = field ?? derive(task_type)                 # debug/test/validate high
reward_score   = min(1, log10(reward+1)/log10(5000))        # log-normalized
composite      = 0.40*solvable + 0.25*freshness + 0.25*competition + 0.10*reward
```
Explainable, deterministic, no training needed. LLM only assists `task_type`/`agent_solvable` at refresh time.

## 6. Known Pitfalls (C1–C5)

See SPEC §11. Key: stdout purity (C1), enum sync (C2), schema/data parity (C3), Apify KYC (C4), DNS-rebinding (C5).
