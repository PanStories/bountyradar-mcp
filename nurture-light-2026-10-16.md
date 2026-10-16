# BountyRadar MCP — Weekly Light Nurture Report

**Date:** 2026-10-16 (Fri 23:24, automation rrule `BYDAY=FR;BYHOUR=23;BYMINUTE=24`)
**Actor:** `QnlMLgxMxh1i7WSSF` · GitHub `PanStories/bountyradar-mcp` · Sartbot `bountyradar-mcp` · Local `C:/Users/USER/WorkBuddy/MCP/bountyradar-mcp`
**Mode:** 0-token (read-only API + local git + scripted fixes, no LLM synthesis)
**Baseline:** 2026-10-09 (`nurture-light-2026-10-09.md`). "上周" column = that baseline.

---

## 状态总表

| 维度 | 现状 | 上周 | 徽章 | 依据 |
|---|---|---|---|---|
| Apify `isPublic` | `true` | `true` | ✅ | `GET /v2/acts/QnlMLgxMxh1i7WSSF` |
| `stats.totalRuns` | 11 | 11 | ⏸️ 零增长 | actor stats |
| `stats.totalUsers` | 1 | 1 | ⏸️ 早期低流量 | actor stats |
| `totalUsers7Days` / `30Days` / `90Days` | 0 / 0 / 0 | 0 / 0 / — | ⏸️ | actor stats |
| `actorReviewCount` | 0 | `null` | ⏸️ 无评价 | actor stats |
| `lastRunStartedAt` | `2026-10-09T14:33:37Z` | `null` | ✅ 已填充（10-09 有一次 run） | actor stats |
| `chargedEventCounts` | `null`/缺字段 | `null` | ✅ 正常 | **Standby run 恒为 null，非计费故障** |
| `pricingInfos` 计费事件数 | 1 | 1 | ✅ | actor pricingInfos |
| Apify `seoTitle` | "BountyRadar MCP: ranked agent-solvable bounty feed" | `null` | ✅ 已补（10-14 月深填） | actor field |
| GitHub 新 issue（自 10-09） | 新开 0 / 关闭 0 | 0 / 0 | ✅ | issues API (`state=all&since=2026-10-09`) |
| 竞品新发版（近 7 天） | 无 | 无 | ✅ | GitHub releases 扫描 |
| M8ven 评分 / grade | **B · 89/100** | **B · 89/100** | ✅ 不变 | m8ven.ai `<title>`（`--compressed`+`gunzip` 解压后提取） |
| M8ven Claim | **Verified Publisher（已验证，GitHub App 已连）** | 已验证 | ✅ 无需老板点击 | README tokenized 验证行命中 + 基线确认 |
| M8ven Live | Live Monitored（已连，代码变更自动复验） | 已连 | ✅ | 基线确认 |
| README M8ven tokenized line | 存在（line 3，`panstories-bountyradar-mcp-njjpan?v=cb31932…`） | 存在 | ✅ 本地=远端一致，精确匹配通过 | `grep m8ven` raw+local |
| 版本号一致性 | **全仓 1.0.1（本轮修齐）** | 1.0.1 但 server.json=1.1 / lhm=1.0.0 漂移 | ✅ 已修复 | package.json/README×3/dispatch.mjs/CHANGELOG/manifest = 1.0.1；server.json+lhm 已对齐 |
| 渠道文案漂移（Apify/Sartbot/README 事实层） | 无实质漂移 | 无 | ✅ | 7 工具 / pay-per-event / 双横线端点 三方一致 |
| 托管端点存活 | http 401（活，缺 token） | — | ✅ | `POST /mcp` → 401（skill 判据：401=活，404=URL错） |
| License | MIT（repo 公开，MIT 正确） | MIT | ✅ | repo `private:false`；LICENSE+README+package.json 一致 |
| Sartbot `updated_at` | `2026-10-07`（元数据 stale） | — | ⏸️ 事实未变，仅时间戳旧 | Sartbot live JSON（下次改 Sartbot 时顺手 bump） |

---

## 四类决策信号（仅标有无新信号）

- **A 功能**：无新信号。M8ven Live 持续复验（B 89 未掉），工具层 7 tools×四 hint 已合规（基线已修）。无新 issue / 无新需求。
- **B 变现**：无新信号。`chargedEventCounts=null` 为 Standby 常态（非计费故障）；PPE 定价未变（铁律 #4 禁静默改价）。
- **C 推广**：M8ven 已 **Verified Publisher + Live Monitored**，信任资产稳固（B 89 持平）。轻量竞品扫描（GitHub `bounty`/`bug-bounty` MCP releases）无新发版。
- **D 定价**：无新信号。

---

## 自治修复清单（本轮实际改动）

| 动作 | 文件 / 对象 | 是否已 push | 说明 |
|---|---|---|---|
| ✅ 版本号同步（自治） | `server.json` `version` `1.1`→`1.0.1` | 是（`8405bf9`） | 对齐 authoritative served version（`src/core/dispatch.mjs` `SERVER.version='1.0.1'`）；Apify actor `1.1` 仅 build 标签，不改 served 字符串，故**不下改 actor.json**（避免重建/打断 standby） |
| ✅ 版本号同步（自治） | `lhm.plugin.json` `version` `1.0.0`→`1.0.1` | 是（`8405bf9`） | 同上，目录站元数据对齐 |
| ✅ git commit + push | `e5ca7b5..8405bf9` (main) | 是 | 2 files changed, 2 insertions, 2 deletions |
| ✅ 远端复核 | `GET /repos/.../contents/server.json?ref=main` | — | 远端 server.json `version=1.0.1` 已生效 |
| ⏸️ 未改（正确判断） | `package.json` / `README×3` / `CHANGELOG` / `manifest` | — | 本就为 1.0.1，与 served 一致，无需动 |
| ⏸️ 未改 | Apify Store `description`/`seoTitle` | — | 文案事实一致；seoTitle 已填，无 drift，无谓外部写入 |
| ⏸️ 未改 | `actor.json`（`1.1`） | — | 仅 Apify build 标签；改它会触发重建、可能打断 live standby，且不影响 served 版本号 → 保留 |
| ⏸️ 未改 | Sartbot `updated_at` | — | 事实未变（7 工具/定价/端点均准）；时间戳 stale 属元数据，下次改 Sartbot 时顺手 bump，不单独 deploy |

**commit 安全闸门（GATE 3）：** `git diff --name-status origin/main..HEAD | grep '^D'` → 空（无删除），push 安全。

**误报排除：** 起初疑 `package.json` MIT 与 README "Proprietary" 冲突 → 实查 repo `private:false` 且 README/LICENSE 均 MIT，**一致性正确，无需修**。

---

## 待老板拍板清单（真金白银 / 对外发布 / 价格 / 需 OK 动作）

1. **（已解决·复核）`snapshot-refresh.yml` 上线**：上周待 OK 项，本周 git log 显示已由月度深跑/自治提交落地（`ad9772b` feat(ci) 48h 静态快照部署 + `e5ca7b5` fix graceful skip when `CLOUDFLARE_API_TOKEN` missing）。**复核项**：`bountyradar-site` Cloudflare Pages 项目是否已实际 live（需 `CLOUDFLARE_API_TOKEN`，本机无 → report-only）。若未建 Pages 项目，需老板在 CF 侧 `wrangler pages project create bountyradar-site` + 加 repo secret 后才会真正部署。
2. **（可选）Sartbot `updated_at` → 2026-10-16**：纯元数据新鲜度，下次编辑 Sartbot 目录时一并 bump + `wrangler deploy`（本机有 CF token，自治可行，但非阻塞）。
3. **（可选 / 已决）npm publish**：本机无 token，且老板已决定不发，跳过。
4. **（无需）M8ven Claim**：已 Verified Publisher，AI 不点邮件链接——**无待点动作**。

---

## 首周行动清单

- 无阻塞动作。早期低流量（11 runs / 1 user）期保持观察，不强行增长。
- 若老板确认 `bountyradar-site` Pages 未 live：回 OK 后执行 `wrangler pages project create bountyradar-site` + 加 `CLOUDFLARE_API_TOKEN` secret，再验证 Pages 200。
- 下周五同窗（23:24）自动续跑；届时对比本期看 KPI 增量与 M8ven grade。

---

## 方法学备注（供下次复用）

- **M8ven 抓取**：`m8ven.ai` 响应为 gzip 且**不声明 `Content-Encoding`**，`curl` 直读是二进制。正确做法：`curl -s URL | gunzip -c` 后再 `grep -oE '<title>[^<]*</title>'`（得 `B 89/100`）。`--compressed` 单独不够。
- **版本事实源**：判定版本漂移先看 `src/core/dispatch.mjs` 的 `SERVER.version`（served 字符串），再比对各 json；actor.json `1.x` 是 Apify build 标签，**不等同** served 版本。

---

## Credits / Tokens 实际用量

**0**（纯只读 API + 本地 git + 脚本化修复，未调用任何 LLM 合成）。
