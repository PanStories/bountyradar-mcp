# BountyRadar MCP

[![M8ven Score](https://m8ven.ai/badge/mcp/panstories-bountyradar-mcp-njjpan?v=cb31932dc77c9cacf18165eff9daef2a)](https://m8ven.ai/mcp/panstories-bountyradar-mcp-njjpan?s=readme)

**The judgment layer for the agent-bounty economy.** BountyRadar aggregates AI-agent-solvable bounties across Opire, BountyHub, ClawHunt, Algora, GitHub, and validated security programs — then scores each for **agent-solvability, freshness, and competition** and serves a ranked, agent-consumable feed over MCP.

> **Positioning:** an *intelligence / alerting layer* — **NOT** a marketplace. No fund custody, no KYC, no cross-border settlement. Public OSS bounties are agent-saturated; the scarce skill is *target selection*, not discovery. BountyRadar is the selection layer.

**Languages:** [English](#english) · [简体中文](#简体中文) · [繁體中文](#繁體中文)

| Where it lives | Link |
|---|---|
| MCP endpoint | `https://neeenja--bountyradar-mcp.apify.actor/mcp` |
| Apify Store | https://apify.com/neeenja/bountyradar-mcp |
| Source (MIT) | https://github.com/PanStories/bountyradar-mcp |

---

<a id="english"></a>
## English

**Current version: 1.0.1**

### Why this exists

- Public open-source bounties are **agent-saturated** — a single Algora bounty has drawn 8–158 competing agent attempts within hours.
- The bottleneck is **triage / judgment**, not discovery — so the moat is the *scoring layer*, not scraping.
- BountyRadar ranks and de-noises so an agent spends compute only on targets it can actually win.

### Quick start (hosted MCP endpoint — recommended)

The hosted endpoint is a **Streamable HTTP MCP server** with **Pay-Per-Event** billing (no monthly fee). Connect it with any MCP client:

**Claude Desktop / Claude Code / WorkBuddy / any MCP client (remote HTTP):**
```json
{
  "mcpServers": {
    "bountyradar": {
      "type": "http",
      "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

`initialize` and `tools/list` are **free**; only value events are charged (see Pricing).

No install step and no npm required — the endpoint *is* the product. One-liner for the common clients:

```bash
claude mcp add bountyradar --transport http https://neeenja--bountyradar-mcp.apify.actor/mcp
# Cursor / Windsurf / any client that reads .mcp.json — add:
#   { "mcpServers": { "bountyradar": { "type": "http",
#       "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
#       "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" } } } }
```

### Run locally (stdio, MIT — clone and self-host)

The full source (Node 22, zero-dependency stdio server) is MIT-licensed and lives on GitHub: https://github.com/PanStories/bountyradar-mcp. Clone it and run:

```bash
node src/server.mjs          # zero-dependency JSON-RPC 2.0 stdio server
```

**MCP client config (local stdio):**
```json
{ "mcpServers": { "bountyradar": { "command": "node", "args": ["src/server.mjs"] } } }
```

### Tools

| Tool | Purpose | Price |
|------|---------|-------|
| `get_bounty_feed` | **The subscriber feed.** Ranked + filtered (category, min_reward, max_competition, source, freshness_min, agent_solvable_min, include_honeypot, sort). | $0.0005 |
| `search_bounties` | Keyword + filter search across title/description/tags/repo. | $0.0010 |
| `get_bounty_detail` | Full record + score breakdown by id. | free |
| `score_bounty` | Raw explainable score breakdown for one bounty. | $0.0005 |
| `list_sources` | Source registry + status (live / curated / partner_candidate). | free |
| `get_stats` | Counts by source / category / reward band. | $0.0005 |
| `subscribe_feed` | Save a filter profile + poll descriptor (stored in server memory; webhook URL echoed, never called). | $0.0005 |

**Resources:** `bountyradar://feed/latest`, `bountyradar://stats`, `bountyradar://sources`
**Prompt:** `daily_bounty_brief` — briefs an agent on today's best targets.

### Scoring (the moat — explainable, deterministic)

```
freshness      = exp(-ageDays / 14)                    # half-life ~10d
competition    = 1 / (1 + competition_count)           # 0 tries -> 1.0
agent_solvable = field ?? derive(task_type)             # debug/test/validate high
reward_score   = min(1, log10(reward+1)/log10(5000))
composite      = 0.40*solvable + 0.25*freshness + 0.25*competition + 0.10*reward
```

A free LLM (Cheapest-LLM Router / Cloudflare Workers AI) only *assists* `task_type` / `agent_solvable` at refresh time; scoring itself is deterministic and needs no training.

### Honeypot guard

Bounties flagged `honeypot: true` (e.g. "reserved for interview loop") are **excluded from the default feed** so agents don't waste compute or burn reputation. Toggle with `include_honeypot: true`.

### Monetization — Pay-Per-Event (no monthly fee)

`initialize` / `tools/list` / `list_sources` / `get_bounty_detail` are **free**. Charged events:

| Event | Price |
|-------|-------|
| `mcp-get-bounty-feed` | $0.0005 |
| `mcp-search` | $0.0010 |
| `mcp-score` | $0.0005 |
| `mcp-stats` | $0.0005 |
| `mcp-subscribe` | $0.0005 |

Local / self-hosted use is free forever.

### Self-host / deploy (Apify, PPE)

```bash
npm install          # pulls express + MCP SDK + apify (optional deps)
apify actor push
```

Standby mode (120s / 512MB) keeps idle cost near zero. The actor's main process binds the HTTP port itself (Standby-safe) and answers the container readiness probe.

### Dev & verification

```bash
npm test                       # 11 unit/schema/scoring tests
node scripts/mcp-smoke.mjs     # spawn server: initialize -> tools/list -> tools/call
node scripts/showcase.mjs      # generate feed-samples.html (data-driven)
node scripts/refresh.mjs       # refresh catalog (graceful; needs APIFY_TOKEN + LLM creds)
```

### Optional add-ons (same catalog)

- **Website + subscriber alerts** — `node website/build.mjs` → a zero-dependency static site + Cloudflare Pages Functions (KV subscribe, guarded CSV export); `scripts/digest.mjs` renders per-subscriber email/Slack digests.
- **Live refresh** — `scraper/` is a standalone Apify actor (or `scripts/refresh.mjs` locally) that collects real bounty issues and writes to `data/live/`, never polluting the curated `data/bounties/`. Set `BR_INCLUDE_LIVE=1` to merge at runtime.

> **Honesty:** only issues that are actually bounties (a stated `$` reward or a `bounty` label) are kept; unfunded "good first issues" are noise and excluded. Opire / Algora / BountyHub require platform keys; ClawHunt is a `partner_candidate` and is intentionally **not** scraped (index upstream, don't compete).

### License

MIT — see the [LICENSE](LICENSE) file. Free to use the hosted endpoint per the pricing table above.

### Privacy

Read-only and stateless — no accounts, no personal data collected. An optional `webhook_url` is held in memory only; optional classification may send public bounty text to a configured LLM endpoint. See [`PRIVACY.md`](PRIVACY.md).

---

<a id="简体中文"></a>
## 简体中文

**Current version: 1.0.1**

**Agent 赏金经济的"判断层"。** BountyRadar 跨 Opire / BountyHub / ClawHunt / Algora / GitHub 及已核验安全计划聚合"AI agent 可解"的赏金，对每条做 **agent 可解性 / 新鲜度 / 竞争度** 评分，并通过 MCP 输出一份排好序、agent 可直接消费的 feed。

> **定位：** *情报 / 告警层*——**不是**市场 / 结算层。不碰资金托管、KYC、跨境结算。公开 OSS 赏金已被 agent 淹没；稀缺能力是"选目标"，不是"发现目标"。BountyRadar 就是这一层。

### 为什么做这个

- 公开开源赏金**已被 agent 农场淹没**——单条 Algora 赏金几小时内就涌进 8–158 个抢单 agent。
- 瓶颈在**分流 / 判断**，不在发现——所以护城河是**评分层**，不是爬虫。
- BountyRadar 排序 + 去噪，让 agent 只把算力花在真正能赢的目标上。

### 快速开始（托管 MCP 端点——推荐）

托管端点是**按事件付费（PPE）**的 **Streamable HTTP MCP 服务器**，无月费。任何 MCP 客户端均可接入：

**Claude Desktop / Claude Code / WorkBuddy / 任意 MCP 客户端（远程 HTTP）：**
```json
{
  "mcpServers": {
    "bountyradar": {
      "type": "http",
      "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

`initialize` 与 `tools/list` **免费**；仅对价值事件计费（见「商业化」）。

**无需安装、无需 npm** —— 端点本身就是产品。常见客户端一行搞定：

```bash
claude mcp add bountyradar --transport http https://neeenja--bountyradar-mcp.apify.actor/mcp
# Cursor / Windsurf / 任何读 .mcp.json 的客户端 —— 加入：
#   { "mcpServers": { "bountyradar": { "type": "http",
#       "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
#       "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" } } } }
```

### 本地运行（stdio，MIT 开源，可克隆自托管）

完整源码（Node 22、零依赖 stdio 服务器）以 MIT 许可证开源在 GitHub：https://github.com/PanStories/bountyradar-mcp。克隆后运行：

```bash
node src/server.mjs          # 零依赖 JSON-RPC 2.0 stdio 服务器
```

**MCP 客户端配置（本地 stdio）：**
```json
{ "mcpServers": { "bountyradar": { "command": "node", "args": ["src/server.mjs"] } } }
```

### 工具

| 工具 | 作用 | 价格 |
|------|------|------|
| `get_bounty_feed` | **订阅 feed 本体。** 排序 + 过滤（类型 / 最低赏金 / 最高竞争数 / 来源 / 新鲜度 / 可解性 / 含蜜罐 / 排序方式）。 | $0.0005 |
| `search_bounties` | 关键词 + 过滤搜索（标题/描述/标签/repo）。 | $0.0010 |
| `get_bounty_detail` | 按 id 取完整记录 + 评分拆解。 | 免费 |
| `score_bounty` | 单条可解释评分拆解。 | $0.0005 |
| `list_sources` | 来源注册表 + 状态（live / curated / partner_candidate）。 | 免费 |
| `get_stats` | 按来源 / 类型 / 赏金档统计。 | $0.0005 |
| `subscribe_feed` | 保存过滤档案 + 轮询描述（仅存于服务器内存；webhook URL 只回显、绝不调用）。 | $0.0005 |

**资源：** `bountyradar://feed/latest`、`bountyradar://stats`、`bountyradar://sources`
**提示词：** `daily_bounty_brief`（briefing 今日最佳目标）

### 评分（护城河——可解释、确定性）

```
freshness      = exp(-ageDays / 14)                    # 半衰期 ~10 天
competition    = 1 / (1 + competition_count)           # 0 人抢 -> 1.0
agent_solvable = 字段 ?? derive(task_type)              # debug/test/validate 高
reward_score   = min(1, log10(reward+1)/log10(5000))
composite      = 0.40*可解 + 0.25*新鲜 + 0.25*竞争 + 0.10*赏金
```

免费 LLM（Cheapest-LLM Router / Cloudflare Workers AI）仅在 refresh 时**辅助**判定 task_type / agent_solvable；评分本身是确定性、无需训练。

### 蜜罐守卫

标记为 `honeypot: true` 的赏金（如"面试专用"）**默认移出 feed**，避免 agent 浪费算力或毁声誉。`include_honeypot: true` 可切回显示。

### 商业化——按事件付费（无月费）

`initialize` / `tools/list` / `list_sources` / `get_bounty_detail` **免费**。计费事件：

| 事件 | 价格 |
|------|------|
| `mcp-get-bounty-feed` | $0.0005 |
| `mcp-search` | $0.0010 |
| `mcp-score` | $0.0005 |
| `mcp-stats` | $0.0005 |
| `mcp-subscribe` | $0.0005 |

本地 / 自托管永久免费。

### 自托管 / 部署（Apify，PPE）

```bash
npm install          # 安装 express + MCP SDK + apify（可选依赖）
apify actor push
```

Standby 模式（120s / 512MB）让闲置成本接近零。Actor 主进程自行绑定 HTTP 端口（Standby 安全）并响应容器就绪探针。

### 开发与验证

```bash
npm test                       # 11 项单元 / schema / 评分测试
node scripts/mcp-smoke.mjs     # 拉起 server：initialize -> tools/list -> tools/call
node scripts/showcase.mjs      # 生成 feed-samples.html（数据驱动）
node scripts/refresh.mjs       # 刷新目录（优雅降级；需 APIFY_TOKEN + LLM 凭据）
```

### 可选增强（同一份目录数据）

- **网站 + 订阅告警**——`node website/build.mjs` 生成零依赖静态站 + Cloudflare Pages Functions（KV 订阅、受保护的 CSV 导出）；`scripts/digest.mjs` 渲染按订阅者定制的邮件 / Slack 摘要。
- **实时刷新**——`scraper/` 是独立的 Apify actor（或本地 `scripts/refresh.mjs`），采集真实赏金 issue 并写入 `data/live/`，绝不污染 curated 的 `data/bounties/`。设 `BR_INCLUDE_LIVE=1` 可在运行时合并。

> **诚实声明**：只保留真正是赏金的内容（写明 `$` 金额或带 `bounty` 标签）；无赏金的 "good first issue" 是噪音，已排除。Opire / Algora / BountyHub 需平台密钥；ClawHunt 是 `partner_candidate`，**刻意不采集**（上游索引，不竞争）。

### 许可证

MIT——详见 [LICENSE](LICENSE)。按上表计费使用托管端点。

---

<a id="繁體中文"></a>
## 繁體中文

**Current version: 1.0.1**

**Agent 賞金經濟的「判斷層」。** BountyRadar 跨 Opire / BountyHub / ClawHunt / Algora / GitHub 及已核驗安全計畫聚合「AI agent 可解」的賞金，對每條做 **agent 可解性 / 新鮮度 / 競爭度** 評分，並透過 MCP 輸出一份排好序、agent 可直接消費的 feed。

> **定位：** *情報 / 警報層*——**不是**市場 / 結算層。不碰資金託管、KYC、跨境結算。公開 OSS 賞金已被 agent 淹沒；稀缺能力是「選目標」，不是「發現目標」。BountyRadar 就是這一層。

### 為什麼做這個

- 公開開源賞金**已被 agent 農場淹沒**——單條 Algora 賞金幾小時內就湧進 8–158 個搶單 agent。
- 瓶頸在**分流 / 判斷**，不在發現——所以護城河是**評分層**，不是爬蟲。
- BountyRadar 排序 + 去噪，讓 agent 只把算力花在真正能贏的目標上。

### 快速開始（託管 MCP 端點——推薦）

託管端點是**按事件付費（PPE）**的 **Streamable HTTP MCP 伺服器**，無月費。任何 MCP 用戶端均可接入：

**Claude Desktop / Claude Code / WorkBuddy / 任意 MCP 用戶端（遠端 HTTP）：**
```json
{
  "mcpServers": {
    "bountyradar": {
      "type": "http",
      "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

`initialize` 與 `tools/list` **免費**；僅對價值事件計費（見「商業化」）。

**無需安裝、無需 npm** —— 端點本身就是產品。常見客戶端一行搞定：

```bash
claude mcp add bountyradar --transport http https://neeenja--bountyradar-mcp.apify.actor/mcp
# Cursor / Windsurf / 任何讀 .mcp.json 的客戶端 —— 加入：
#   { "mcpServers": { "bountyradar": { "type": "http",
#       "url": "https://neeenja--bountyradar-mcp.apify.actor/mcp",
#       "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" } } } }
```

### 本機執行（stdio，MIT 開源，可克隆自架）

完整原始碼（Node 22、零依賴 stdio 伺服器）以 MIT 許可證開源在 GitHub：https://github.com/PanStories/bountyradar-mcp。克隆後執行：

```bash
node src/server.mjs          # 零依賴 JSON-RPC 2.0 stdio 伺服器
```

**MCP 用戶端設定（本機 stdio）：**
```json
{ "mcpServers": { "bountyradar": { "command": "node", "args": ["src/server.mjs"] } } }
```

### 工具

| 工具 | 作用 | 價格 |
|------|------|------|
| `get_bounty_feed` | **訂閱 feed 本體。** 排序 + 過濾（類型 / 最低賞金 / 最高競爭數 / 來源 / 新鮮度 / 可解性 / 含蜜罐 / 排序方式）。 | $0.0005 |
| `search_bounties` | 關鍵字 + 過濾搜尋（標題/描述/標籤/repo）。 | $0.0010 |
| `get_bounty_detail` | 按 id 取完整記錄 + 評分拆解。 | 免費 |
| `score_bounty` | 單條可解釋評分拆解。 | $0.0005 |
| `list_sources` | 來源註冊表 + 狀態（live / curated / partner_candidate）。 | 免費 |
| `get_stats` | 按來源 / 類型 / 賞金檔統計。 | $0.0005 |
| `subscribe_feed` | 儲存過濾檔案 + 輪詢描述（僅存於伺服器記憶體；webhook URL 僅回顯、絕不呼叫）。 | $0.0005 |

**資源：** `bountyradar://feed/latest`、`bountyradar://stats`、`bountyradar://sources`
**提示詞：** `daily_bounty_brief`（briefing 今日最佳目標）

### 評分（護城河——可解釋、確定性）

```
freshness      = exp(-ageDays / 14)                    # 半衰期 ~10 天
competition    = 1 / (1 + competition_count)           # 0 人搶 -> 1.0
agent_solvable = 欄位 ?? derive(task_type)              # debug/test/validate 高
reward_score   = min(1, log10(reward+1)/log10(5000))
composite      = 0.40*可解 + 0.25*新鮮 + 0.25*競爭 + 0.10*賞金
```

免費 LLM（Cheapest-LLM Router / Cloudflare Workers AI）僅在 refresh 時**輔助**判定 task_type / agent_solvable；評分本身是確定性、無需訓練。

### 蜜罐守衛

標記為 `honeypot: true` 的賞金（如「面試專用」）**預設移出 feed**，避免 agent 浪費算力或毀聲譽。`include_honeypot: true` 可切回顯示。

### 商業化——按事件付費（無月費）

`initialize` / `tools/list` / `list_sources` / `get_bounty_detail` **免費**。計費事件：

| 事件 | 價格 |
|------|------|
| `mcp-get-bounty-feed` | $0.0005 |
| `mcp-search` | $0.0010 |
| `mcp-score` | $0.0005 |
| `mcp-stats` | $0.0005 |
| `mcp-subscribe` | $0.0005 |

本機 / 自架永久免費。

### 自架 / 部署（Apify，PPE）

```bash
npm install          # 安裝 express + MCP SDK + apify（選用依賴）
apify actor push
```

Standby 模式（120s / 512MB）讓閒置成本接近零。Actor 主程序自行繫結 HTTP 埠（Standby 安全）並回應容器就緒探針。

### 開發與驗證

```bash
npm test                       # 11 項單元 / schema / 評分測試
node scripts/mcp-smoke.mjs     # 拉起 server：initialize -> tools/list -> tools/call
node scripts/showcase.mjs      # 生成 feed-samples.html（資料驅動）
node scripts/refresh.mjs       # 刷新目錄（優雅降級；需 APIFY_TOKEN + LLM 憑證）
```

### 選用增強（同一份目錄資料）

- **網站 + 訂閱警報**——`node website/build.mjs` 產生零依賴靜態站 + Cloudflare Pages Functions（KV 訂閱、受保護的 CSV 匯出）；`scripts/digest.mjs` 渲染按訂閱者定製的郵件 / Slack 摘要。
- **即時更新**——`scraper/` 是獨立的 Apify actor（或本機 `scripts/refresh.mjs`），採集真實賞金 issue 並寫入 `data/live/`，絕不污染 curated 的 `data/bounties/`。設 `BR_INCLUDE_LIVE=1` 可在執行時合併。

> **誠實聲明**：只保留真正是賞金的內容（寫明 `$` 金額或帶 `bounty` 標籤）；無賞金的 "good first issue" 是雜訊，已排除。Opire / Algora / BountyHub 需平台金鑰；ClawHunt 是 `partner_candidate`，**刻意不採集**（上游索引，不競爭）。

### 授權

MIT——詳見 [LICENSE](LICENSE)。按上表計費使用託管端點。