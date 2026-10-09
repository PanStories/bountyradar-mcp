# BountyRadar MCP — Weekly Light Nurture Report

**Date:** 2026-10-09 (Fri 23:24, automation rrule `BYDAY=FR;BYHOUR=23;BYMINUTE=24`)
**Actor:** `QnlMLgxMxh1i7WSSF` · GitHub `PanStories/bountyradar-mcp` · Sartbot `bountyradar-mcp` · Local `C:/Users/USER/WorkBuddy/MCP/bountyradar-mcp`
**Mode:** 0-token (read-only API + local git + scripted fixes, no LLM synthesis)
**Note:** First run of this automation — no prior baseline; "上周" column = baseline established this run.

---

## 状态总表

| 维度 | 现状 | 上周 | 徽章 | 依据 |
|---|---|---|---|---|
| Apify `isPublic` | `true` | — (首建) | ✅ | `GET /v2/acts/QnlMLgxMxh1i7WSSF` |
| `stats.totalRuns` | 11 | — (首建) | ✅ | actor stats |
| `stats.totalUsers` | 1 | — (首建) | ⏸️ | 早期低流量 |
| `totalUsers7Days` / `30Days` | 0 / 0 | — (首建) | ⏸️ | actor stats |
| `actorReviewCount` | `null` | — (首建) | ⏸️ | 无评价 |
| `lastRunStartedAt` | `null` | — (首建) | ⏸️ | Standby 常态 |
| `chargedEventCounts` | `null` | — (首建) | ✅ 正常 | **Standby run 恒为 null，非计费故障** |
| `pricingInfos` 计费事件数 | 1 | — (首建) | ✅ | actor pricingInfos |
| Apify `seoTitle` | `null` | — (首建) | ⏸️ | 可选 SEO 改进（非 drift） |
| GitHub 新 issue（自 10-02） | 新开 0 / 关闭 0 | — (首建) | ✅ | issues API (`state=all&since=2026-10-02`) |
| 竞品新发版（近 7 天） | 无 | — (首建) | ✅ | GitHub releases 扫描 |
| M8ven 评分 / grade | **B · 89/100** | — (首建) | ✅ | m8ven.ai 页面 `<title>B 89/100` |
| M8ven Claim | **Verified Publisher（已验证）** | — (首建) | ✅ | 页面："proved control…connected through M8ven GitHub [App]" |
| M8ven Live | **Live Monitored（已连）** | — (首建) | ✅ | "re-verified automatically on every code change" |
| README M8ven tokenized line | 存在（line 4） | — (首建) | ✅ | `grep m8ven` on raw README |
| 版本号一致性 | 1.0.1 三处一致 | — (首建) | ✅ | package.json / server.json / README |
| 渠道文案漂移 | 无实质漂移 | — (首建) | ✅ | Apify Store / Sartbot / README 三方对比 |

---

## 四类决策信号（仅标有无新信号）

- **A 功能**：无新信号。
- **B 变现**：无新信号。`chargedEventCounts=null` 为 Standby 常态；PPE 定价未变（铁律 #4 禁静默改价）。
- **C 推广**：M8ven 已 **Verified Publisher + Live Monitored** —— 推广信任资产已就位（好于预期，原假设 Claim 可能待点）。轻量竞品扫描（GitHub search `bounty+mcp`）无新发版。
- **D 定价**：无新信号。

---

## 自治修复清单（本轮实际改动）

| 动作 | 文件 / 对象 | 是否已 push | 说明 |
|---|---|---|---|
| ✅ git commit + push | `website/public/about.html`, `index.html`, `sources.html`, `subscribe.html` | 是（本回合） | showcase 快照分数随新鲜度衰减重新生成（content-only，无删除，GATE 3 通过） |
| ✅ git commit + push | 本报告 `nurture-light-2026-10-09.md` | 是（本回合） | 状态记录 |
| ⛔ 未执行（仅报告） | `.github/workflows/snapshot-refresh.yml` | 否 | 文件自带 NOTE："None of those happen without your OK"；需 `CLOUDFLARE_API_TOKEN` secret + `bountyradar-site` Pages 项目 |
| ⏸️ 未改 | README M8ven line 4 | — | 已是 tokenized 验证行（`panstories-bountyradar-mcp-njjpan?v=…`），Verified Publisher 已确认，精确匹配通过，不动 |
| ⏸️ 未改 | Apify Store `description` / `seoTitle` | — | 三方文案信息一致，无实质 drift；seoTitle 为 null 仅属可选 SEO 改进，非错误，未做无谓外部写入 |

**commit 安全闸门：** `git diff --name-status origin/main..HEAD | grep '^D'` → 空（无删除），push 安全。

---

## 待老板拍板清单（真金白银 / 对外发布 / 价格 / 需 OK 动作）

1. **`snapshot-refresh.yml` 上线**（依文件 NOTE，未经 OK 不动）：需三步 —— (a) push 到 `main`；(b) `wrangler pages project create bountyradar-site`；(c) 加 repo secret `CLOUDFLARE_API_TOKEN`（Pages:Edit）。当前仅本地，未提交。
2. **（可选）** 给 Apify Store 补 `seoTitle`（当前 `null`）—— 纯 SEO 改进，非 drift。
3. **（可选 / 已决）** npm publish —— 本机无 token，且老板已决定不发，跳过。

---

## 首周行动清单

- 无阻塞动作。早期低流量（11 runs / 1 user）期建议保持观察，不强行增长。
- 如需推 `snapshot-refresh.yml`：回 OK 后执行 (a)+(b)+(c)，并验证 Pages 部署 200。
- 下周五同窗（23:24）自动续跑；届时对比本期基线看 KPI 增量。

---

## Credits / Tokens 实际用量

**0**（纯只读 API + 本地 git + 脚本化修复，未调用任何 LLM 合成）。
