# BountyRadar MCP — 每月深度经营报告 (Stage 1–4)

**日期：** 2026-10-10  ·  **标的：** BountyRadar MCP (`QnlMLgxMxh1i7WSSF` / `PanStories/bountyradar-mcp` / Sartbot `bountyradar-mcp`)
**方法论：** Nurture-MCP Stage 0–4 + Cheap-First-Routing（白天走 Hy3 免费额度，检索用免费 WebSearch，本地 curl/git/trust_audit = 0 token）
**执行者注：** 本轮为自动化月度批处理，所有「需新凭据 / 改价 / 真人点击 / 首次对外发帖」一律只列待拍板，未动手。

---

## 一、状态总表

| 维度 | 现状 | 目标 | 徽章 | 依据 |
|---|---|---|---|---|
| 信任闸门（OpenAI 可上架） | FAIL 0 / WARN 2 / PASS 14 | 0 FAIL | ✅ | trust_audit.py --strict 2026-10-10 |
| M8ven 信任分 | B · 89/100 · Emerging | 维持 B+ | ✅ | m8ven.ai/mcp/PanStories/bountyradar-mcp |
| M8ven Claim | Verified Publisher + Live Monitored | 已达成 | ✅ | 页面已显示（老板已完成） |
| README badge 行格式 | 已修（仅 tokenized） | 合规 | ✅ | 本轮 push 30a0805 + 线上核验 |
| 采用度（totalRuns/users） | 11 runs / 1 user / 0 新增(30d) | 破冰外部用户 | 🔴 | Apify stats 2026-10-10 |
| 目录在架 | 4/7（缺 Smithery/PulseMCP） | 6/7+ | ⏸️ | curl 2026-10-10 |
| 定价一致性（README↔Console） | 完全一致 | 一致 | ✅ | README 表 = pricingInfos |
| 竞品差异化（选择层定位） | 已声明 scoring | 真做实 | ⏸️ | 见 Stage 2/3 |
| 命名冲突风险 | battam1111 同名 `bounty-radar-mcp` | 去歧义 | ⏸️ | LobeHub 同名条目 |

---

## 二、M8ven 验证状态三件套（2026-10-09 新增巡检项）

1. **评分 / grade：** **B · 89/100 · Emerging**（对比 2026-10-09 修复后无退化；Live Monitored 约每日复检）
2. **Claim 状态：** ✅ **Verified Publisher**（老板已完成邮件验证点击，**无需动作**）
3. **README badge 行格式：** ✅ **tokenized 验证行**（`panstories-bountyradar-mcp-njjpan?v=cb319…`）；原 canonical 斜杠行已删除并 push

---

## 三、自治修复清单（本轮实际改动）

| 文件/对象 | 动作 | 凭据 | 是否 deploy/push | 状态 |
|---|---|---|---|---|
| `README.md` | 删除冗余 canonical 斜杠 m8ven badge 行，仅留 tokenized 验证行 | git (MistifyTea PAT) | ✅ push `30a0805` → `main`，线上核验仅 tokenized 行 | ✅ 完成 |
| Apify actor `seoTitle` | 由空 → "BountyRadar MCP: ranked agent-solvable bounty feed" | APIFY_TOKEN | ✅ PUT 成功，复拉确认 | ✅ 完成 |

> 其余「需新凭据/改价/真人点击/首次发帖」见第五节待拍板清单，本轮一律未动。

---

## 四、Stage 1 — 市场信号表（8–12 路并行，EN+ZH）

> 可信度：🟢 一手实测 / 🟡 官方文档或目录条目 / 🔴 二手转述。未亲手复现的标「未验证」。

| # | 结论 | 证据 URL | 日期 | 可信度 | 目标人群 | 已验证 |
|---|---|---|---|---|---|---|
| S1 | 公共 OSS bounty 已**完全 agent 饱和**：单个 $50–$1000 bounty 数小时内 8–158 次 /attempt，后期 PR 9–10+ | clawdbytes.com/article/2026-05-17-… ; clawdbytes.com/article/2026-06-22-… | 2026-05/06 | 🟢 | bounty hunter / agent 运营者 | 实测文 |
| S2 | <5% 公共 bounty 给真金白银，其余为代币/加密/农场噪音；"先到先得"在 2026 是输家游戏 | clawdbytes.com 2026-06-22 | 2026-06 | 🟢 | 同上 | 实测文 |
| S3 | **蜜罐农场**存在：repo 留 $50 标签 + 125 个正确 PR 但永不合并、永不付；判别信号 = 该 org 是否真关过单 | oactodev.github.io/ninety-quid/report/ | 2026 | 🟢 | agent / 风控 | 实测文 |
| S4 | **差异化打法被反复验证有效**：质量>速度、耐心收割（等 14d+ 变 stale）、文档/翻译类 bounty 竞争最低、建信誉引私单 | benhalpern community / wpnews.pro / oacto | 2026 | 🟢 | 战术层 | 实测文 |
| S5 | 竞品已出现同类 MCP：Yultrace（Web3 9 源 feed）、@weiseer/bounty-mcp（Algora 托管 escrow，含 scam 过滤）、battam1111-bounty-radar-mcp（ZK/AI 11 生态，**付费 $19/$97/$497/月**） | skillselion / glama i8lvem92ba / lobehub battam1111 | 2026-08+ | 🟡 | 直接竞品 | 目录条目 |
| S6 | 中文 AI Agent 接单市场高速增长（Upwork/Fiverr/猪八戒 AI 类目月增 25–35%），但**国内无 agent bounty 聚合 MCP**，是蓝海 | juejin.cn/post/7615807694734213162 ; juejin.cn/post/7682232112121675828 | 2026 | 🟡 | 中文开发者 | 社区文 |
| S7 | ClawHunt（中文"爪寻"）已成面向自主 Agent 的悬赏市场，累计处理赏金 >$11k，0% 平台费促销至 2026-11-11 | clawhunt.store / chinadaily 2026-07-06 | 2026-07 | 🟢 | 上游数据源 | 官网+媒体 |
| S8 | 开发者对**不可预测成本**敏感：34% 因"跑前估不出价"限制 agent 自主权（SlashData Q3'26）；用量计费成主流 | slashdata.co/post/agent-autonomy-pricing-problem | 2026 | 🟡 | 定价心理 | 调研 |
| S9 | AI 编码工具开支 Jevons 悖论：token 单价降 98%，账单反翻 100×；企业开始设月度上限 | liveinthefuture.org/stories/ai-coding-cost-jevons-paradox | 2026 | 🟡 | 定价心理 | 分析 |
| S10 | AgentPact 等"agent 市场全生命周期"MCP 已出现（42 工具，USDC 托管）——但偏重"市场/结算"，非"筛选情报" | ai.boce.com/mcp/39328.html | 2026 | 🟡 | 邻接竞品 | 目录条目 |
| S11 | Opire：5,590 用户 / 210 open bounties / $54,959 待领；Algora：Ziverge 单一 org 分发 $143K；均为我们数据源 | gigs.sh/p/opire ; gigs.sh/p/algora | 2026-05 | 🟡 | 上游数据源 | 指南 |
| S12 | 通用 MCP 聚合器（mcp-aggregator 等）走"多 server 合一"，与我们的"单域情报"定位不同层 | mcpservers.org/th/servers/dwillitzer/mcp-aggregator | 2026 | 🟡 | 邻接 | 目录条目 |

**信号收敛：** 市场痛点是"选择/判断"而非"发现"（S1–S4）；我们的"agent-solvability / 竞争 / 新鲜度评分 + 情报层"定位被反复验证（S4, S5）；采用阻塞在主因是**发现度低 + 无外部用户**（基线 🔴），而非产品力。

---

## 五、Stage 2 — 竞品拆解矩阵（对照）

> 说明：竞品以目录/README 公开数据拆解（🟡）。标注「未真跑」者因需 npm/pip 安装 + 上游网络，自动化环境未逐一 `initialize→tools/list`；列为下月轻量动作。

| 维度 | BountyRadar（我们） | @weiseer/bounty-mcp | battam1111-bounty-radar-mcp | Yultrace Bounty Feed |
|---|---|---|---|---|
| 工具面 | 7（feed/search/detail/score/stats/sources/subscribe） | 4（list/find_matching/get_bounty/stats） | 5（search/get/list_ecosystems/list_sources/summary+upgrade） | search-oriented（索引查询） |
| 传输 | Streamable HTTP（托管 PPE） | stdio（npm -g） | stdio（pip） | 远程 HTTP（cloudflare tunnel） |
| 免费额度 | initialize/tools/list/detail/sources 免费 | 全免费（OSS） | 免费层：top200/30min | 免费 catalog |
| 定价 | PPE $0.0005–$0.001 | 免费 | $19/$97/$497 月 | 免费 |
| 数据源广度 | Opire+BountyHub+ClawHunt+Algora+GitHub+安全 | 仅 Algora（escrow） | 11 生态（ZK/AI 偏） | 9 源（Web3 偏） |
| 评分/楔子 | **agent-solvable+竞争+新鲜度复合分**（选择层） | 基础过滤 + scam 农场排除 | merge_probability | 无评分 |
| 文档 | 三语+定价表+llms 友好 | 英文 | 英文 | 英文 |
| 活跃度 | 13 commits/30d，公开化中 | 有版本迭代 | v0.1.0 | v0.1.1 |
| 诈骗过滤 | ✅ honeypot 标记排除 | ✅ scam-farm 排除 | 未提 | 未提 |

### 差距清单（四类打标）

- 🛡️ **Table stakes（不做就输）：**
  - 更多数据源（追平/超过竞品的 9–11 源广度，尤其 Bountycaster/Dework/Superteam/Sherlock/IssueHunt）→ A4
  - 显式 scam/honeypot 过滤（weiseer 已有，我们已有 honeypot 标记，需对外强调）→ A7
- ⚔️ **Differentiator（我们的楔子）：**
  - **竞争强度 + 耐心收割信号**（实时 attempts 计数 + "ripe/abandoned" 检测）——直接把 S1/S4 的饱和痛点转成产品功能 → A5
  - **可解释评分**（为什么 solvable：task_type/agent_solvable 归因）→ A1
  - **零配置托管 + 极低价 PPE**（$0.0005 vs 竞品 $19/月）—— friction 碾压 → D4 沟通
- 🧱 **Defender（维持即可）：**
  - 三语 README / 定价透明 / llms.txt / M8ven B 分 → 保持
  - `subscribe_feed` 告警（竞品无）→ 保持并强化
- 🚫 **Irrelevant（明确不做）：**
  - 自建结算/托管/KYC（与市场冲突，定位为情报层非市场）→ 写进 Out-of-scope
  - 通用 MCP 聚合器（mcp-aggregator 类别）→ 不做

---

## 六、Stage 3 — 用户反馈 pain 表

> 优先级：Apify run 日志 > GitHub issues > Store reviews > 社交 > 站点。本标的采用度极低，反馈以**市场信号 + 竞品反向印证**为主；≥3 独立来源才进 RICE。

| 痛点 | 频次 | 严重度 | 根因 | workaround | 映射到 Stage 2 |
|---|---|---|---|---|---|
| 公共 bounty 饱和，agent 抢不到 | 高（S1/S2/S4 多源） | 高 | 信息对称 + 先到先得 | 质量/耐心/文档类 | A5（竞争信号） |
| 真金白银 bounty 被代币/农场噪音淹没 | 高（S2/S3） | 高 | 无信源信誉过滤 | 手工筛 close-behavior | A7（scam 过滤） |
| 选哪个 bounty 才值得 agent 算 | 高（S4/S11） | 中 | 缺"可解性"评分 | 自写 scout.py | A1（可解释评分） |
| 发现度低、没人知道这个 MCP | 高（基线 0 外部用户） | 高 | 目录未铺满 + 无首发帖 | 无 | C1/C2/C4/C6 |
| 命名混淆（battam1111 同名） | 中（S5） | 中 | LobeHub 同名条目 | 无 | C6（SEO 去歧义） |
| 跑前估不出价（agent 计价焦虑） | 中（S8/S9） | 中 | PPE 单价未讲清 | 无 | D4（沟通极低价） |

---

## 七、Stage 4 — 四类决策 RICE 表（前四名交老板拍板）

> RICE = Reach × Impact × Confidence ÷ Effort（相对估算，🟡 我的判断，非用户实测）。Reach 1–10，Impact 0.25–3，Confidence 0.5–1，Effort 0.5–5 人日。

### A 功能/技术特性

| ID | 决策 | RICE | 证据 | 日期 | 可信度 | 标记 |
|---|---|---|---|---|---|---|
| A7 | 强化 scam/honeypot 过滤并对外强调（扩展农场名单 + close-behavior 信号） | **8.1** | S2/S3 | 2026-10 | 🟡 | 🛡️→⚔️ |
| A5 | 加竞争强度 + 耐心收割信号（attempts 实时计数、ripe/abandoned 标记） | **6.4** | S1/S4 | 2026-10 | 🟡 | ⚔️ |
| A8 | 输出 token 预算/截断，保持 agent 调用精简 | **4.2** | S8/S9 | 2026-10 | 🟡 | 🧱 |
| A1 | 评分输出加可解释归因（why solvable: task_type/agent_solvable） | **4.0** | S4/S11 | 2026-10 | 🟡 | ⚔️ |
| A4 | 扩数据源至 9–11 源（Bountycaster/Dework/Superteam/Sherlock/IssueHunt） | 3.1 | S5/S11 | 2026-10 | 🟡 | 🛡️ |

### B 变现渠道

| ID | 决策 | RICE | 证据 | 日期 | 可信度 | 标记 |
|---|---|---|---|---|---|---|
| B2 | Sartbot Featured $19 / Spotlight $49 买曝光位 | **9.6** | 基线 0 用户 | 2026-10 | 🟡 | 💰 待老板 |
| B6 | 自有站点交叉推广（sartbot.com / david-s-p-an.com） | **4.2** | S6/S12 | 2026-10 | 🟡 | 🧱 |
| B4 | 与兄弟 MCP 打包成 bundle | 2.3 | — | 2026-10 | 🔴 | 🚫待验证 |
| B5 | 加 pro 告警增值档（类 battam1111 $19/月） | 1.0 | S5 | 2026-10 | 🔴 | ⚔️待验证 |

### C 推广渠道

| ID | 决策 | RICE | 证据 | 日期 | 可信度 | 标记 |
|---|---|---|---|---|---|---|
| C4 | HN/Reddit/lobsters 首发帖（讲"agent 饱和 → 选择层"故事） | **12.0** | S1/S4 | 2026-10 | 🟡 | 🚫 首次对外发帖→待老板 |
| C6 | SEO 优化已上架列表（Apify seoTitle✅已做；Glama topics/LobeHub/Sartbot 描述对齐） | **9.6** | 目录现状 | 2026-10 | 🟢 | ✅ 自治 |
| C1 | 提交 Smithery（需 smithery.yaml + 账号） | **6.0** | 404 | 2026-10 | 🟡 | 🚫 待账号 |
| C5 | 中文长文（掘金/dev.to）："agent 饱和时代的 bounty 选择层" | **4.4** | S6 | 2026-10 | 🟡 | ✍️ 草稿可自治/发待账号 |

### D 定价模型

| ID | 决策 | RICE | 证据 | 日期 | 可信度 | 标记 |
|---|---|---|---|---|---|---|
| D4 | 沟通锚定："per-event $0.0005 vs 竞品 $19/月"——极低价 friction 差异化（文案/Store/README） | **19.2** | S5/S8 | 2026-10 | 🟡 | ✅ 自治文案 |
| D3 | 保持慷慨免费层（init/tools/list/detail/sources 已免费），可考虑前 N 次 feed 免费 | **5.3** | S8 | 2026-10 | 🟡 | 🧱 |
| D2 | `subscribe` 打包/微调价促试用 | 3.6 | — | 2026-10 | 🔴 | 💰 价格变动→待老板 |
| D1 | **维持现状不调价**（铁律 #4：不静默改老事件价） | — | 基线 | 2026-10 | 🟢 | ✅ 维持 |

---

## 八、待老板拍板清单（真金白银 / 对外发布 / 价格变动）

1. **B2 — Sartbot 付费曝光位**（$19 Featured / $49 Spotlight）：需老板确认预算。
2. **C1 — Smithery 提交**：需 Smithery 账号（本机无）；补 `smithery.yaml` 后由老板登录部署。
3. **C4 — HN/Reddit/lobsters 首发帖**：首次对外公开发帖，铁律 #5 禁止自治，需老板发或授权。
4. **C5 — 中文长文发布**：草稿可自治写，发布需掘金/dev.to 账号（老板发或授权）。
5. **D2 — subscribe 调价**：任何价格变动必须老板拍板（铁律 #4）。
6. **PulseMCP 提交**：需 `server.json` 格式复核 + 官方 Registry  ingestion（本机已有 server.json，404 疑为 slug/格式，待老板账号或下月轻量自查）。
7. **mcpservers.org**：curl 超时无法判定在架；若需主动提交走免费 GitHub PR（可自治，待确认）。
8. **M8ven `.well-known/m8ven-publisher.txt`**：页面已 Verified Publisher，可延后；若补需 m8ven 给的 token 内容（老板从 m8ven 后台取）。
9. **npm publish**：老板已决定不发（薄壳包本地已验证但无 token），本轮不处理。

---

## 九、首月行动清单（具体命令/文件/负责人）

**自治可执行（机器已有凭据）：**
- [x] README m8ven badge 行纠错 + push（已完成 `30a0805`）
- [x] Apify `seoTitle` PUT（已完成）
- [ ] **C6 收尾**：`git pull` 后对齐 Glama/LobeHub/Sartbot 描述与 README 三语 tagline；Sartbot `data/mcp/bountyradar-mcp.json` 改完 `python scripts/build.py && node <workspace>/node_modules/wrangler/bin/wrangler.js deploy --config wrangler.worker.toml` 并 `verify-live.py` EXIT=0
- [ ] **D4 文案**：README "Why this exists" 段补一句"每次调用 $0.0005 起，比 $19/月 竞品低 2 个数量级"；同步 Apify description（PUT）
- [ ] **A7 轻量**：在 `list_sources` / feed 文档明示 scam/honeypot 过滤逻辑（代码已含 honeypot 标记，仅对外讲清）
- [ ] **C5 草稿**：写中文长文 markdown 存 `website/` 或 `docs/`，不发

**待老板 OK 后执行：**
- [ ] B2：老板确认后 `python scripts/...` 或 Sartbot 后台买 Featured
- [ ] C1：老板给 Smithery 账号 → 补 `smithery.yaml` → 登录部署
- [ ] C4：老板发 HN/Reddit 首发帖（提供文案）
- [ ] 竞品真跑（下月轻量）：`npm i -g @weiseer/bounty-mcp` → `initialize`→`tools/list`→一次 `list_bounties` 实测，补全 Stage 2 一手数据

**负责人**：Wiwi（自动化）/ 老板（拍板项）。节奏：每 4 周周六凌晨月度 deep；每周轻量拉 KPI。

---

## 十、成本披露

| 项 | 事前估算 | 事后实际 |
|---|---|---|
| WebSearch（市场盘货 12 路） | 0 LLM token（免费工具） | 0 token |
| 本地 curl / git / trust_audit / Apify API | 0 token（确定性） | 0 token |
| 合成（本报告 Stage 1–4 推理） | 走 Hy3 免费额度（promo 至 2026-10-31 23:59，白天可用） | 0 credit（Hy3 免费档） |
| 对外动作 | 无（仅自治文案/SEO/README） | 0 credit |
| **总计** | **≈ 0 credit** | **0 credit** |

> ⚠️ 2026-10-31 之后 Hy3/Hy4 免费额度到期：届时合成改走 `models.json` 中已配置外部免费模型（如 Cloudflare Workers AI Kimi K2.6）；外部不可用则仅用最低 credits 并如实报账，不得静默烧 credits。

---
*生成于自动化每月深度批处理。基线见 `nurture/baseline.md`。下一轮复测 KPI/信任/M8ven/目录在架。*
