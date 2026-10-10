# BountyRadar MCP — Nurture Baseline (Stage 0)

**Snapshot date:** 2026-10-10 (monthly deep)  ·  **Actor:** `QnlMLgxMxh1i7WSSF`  ·  **Repo:** `PanStories/bountyradar-mcp` (public, MIT)  ·  **Sartbot slug:** `bountyradar-mcp`

## KPI 基线（Apify + GitHub）

| 维度 | 数值 | 备注 |
|---|---|---|
| `isPublic` | true | 公开上架 |
| `totalRuns` | 11 | 全部为内部/测试调用，无外部采用 |
| `totalUsers` | 1 | 仅 1 个用户（疑似老板自测） |
| `totalUsers7/30/90d` | 0 / 0 / 0 | 近 30 天无新增用户 |
| `actorReviewCount` / rating | 0 / 0 | 无 Store 评价 |
| `bookmarkCount` | 0 | 无收藏 |
| `lastRunStartedAt` | 2026-10-09T14:33Z | 最近一次运行 |
| `chargedEventCounts` | **null（Standby 恒为 null）** | ⚠️ 不用它判活/判计费；以 `totalRuns` 为代理 |
| GitHub commits (30d) | 13 | 2026-10-07~09 集中做 m8ven/信任/公开化 |
| Apify versions | `1.0@latest`, `1.1@latest` | 当前 build 1.1 |
| Apify `seoTitle` | "BountyRadar MCP: ranked agent-solvable bounty feed" | 本轮补（此前为空）✅ |

## 信任基线（trust_audit.py --strict，2026-10-10）

**结果：FAIL 0 · WARN 2 · PASS 14 → 已达可提交门槛**

| # | 项 | 结果 |
|---|---|---|
| 9 | secret 环境变量 4 个（<5，未触发红旗） | ✅ pass |
| 12 | README 含 m8ven badge（tokenized 验证行） | ✅ pass |
| 12 | 无 `.well-known/m8ven-publisher.txt` | ⚠️ warn（页面已 Verified Publisher，可延后） |
| — | `package.json` 无 `dependencies`（用 optionalDependencies） | ⚠️ warn（良性，部署走 Docker/apify） |

## M8ven 验证状态（2026-10-10）

- **评分 / grade：** **B · 89/100 · Emerging**
- **Claim：** ✅ **Verified Publisher**（页面已显示，老板已完成邮件验证，无需动作）
- **Live Monitored：** ✅ 已开启（每次代码变更自动复检）
- **README badge 行：** 本轮已修 — 删除冗余 canonical 斜杠行，仅留 tokenized 验证行，已 push 并线上核验 ✅

## 定价基线（Apify Console pricingInfos，2026-10-07 配）

PPE 模型，Apify 抽成 20%。`initialize` / `tools/list` / `list_sources` / `get_bounty_detail` **免费**。

| 计费事件 | 价格 |
|---|---|
| `mcp-get-bounty-feed`（主事件） | $0.0005 |
| `mcp-search` | $0.0010 |
| `mcp-score` | $0.0005 |
| `mcp-stats` | $0.0005 |
| `mcp-subscribe` | $0.0005 |

README 定价表与 Console 完全一致 → **无漂移**。

## 目录在架状态（确定性 curl，2026-10-10）

| 目录 | 状态 | 证据 |
|---|---|---|
| Apify Store | ✅ | https://apify.com/neeenja/bountyradar-mcp (200) |
| Glama | ✅ | https://glama.ai/mcp/servers/@neeenja/bountyradar-mcp (200) |
| LobeHub | ✅ | https://lobehub.com/mcp/panstories-bountyradar-mcp (200) |
| Sartbot | ✅ | https://sartbot.com/mcp/bountyradar-mcp/ (200) |
| Smithery | ❌ | https://smithery.ai/server/@neeenja/bountyradar-mcp (404) |
| PulseMCP | ❌ | https://www.pulsemcp.com/mcp/neeenja-bountyradar-mcp (404) |
| mcpservers.org | ⚠️ 未验证 | 请求超时 (http=000)，无法判定 |

---
*本基线作为 Stage 4 决策有效性的对照锚点。下次月度 deep 复测上述数值。*
