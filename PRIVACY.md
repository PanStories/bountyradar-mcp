# Privacy Policy

**Product:** BountyRadar MCP (MCP server)
**Operator:** PanStories
**Repository:** https://github.com/PanStories/bountyradar-mcp
**Last updated:** 2026-10-09
**Effective date:** 2026-10-09

This policy explains what data BountyRadar MCP ("the Service", "we") processes when you
connect to it as a Model Context Protocol (MCP) server — via the hosted endpoint or a
self-hosted build — and what we deliberately do **not** collect.

---

## 1. Summary (TL;DR)

- The Service is a **read-only** MCP server. It serves a ranked feed of AI-agent-solvable
  bounties from a curated catalog. It never modifies, deletes, or acts on your systems.
- **No accounts, no sign-up, no cookies, no advertising or analytics trackers.**
- We do **not** sell, rent, or share your data with advertisers or data brokers.
- The service keeps **in-memory subscriptions**. If you provide an optional **`webhook_url`**,
  it is held in memory for the session to describe how you would be notified — it is **not**
  written to any public store or shared.
- Optional classification may send bounty text to a **configured third-party LLM endpoint**
  (only if the operator has set one up); no personal data is included.
- Hosting is provided by **Apify**; platform-level processing is governed by Apify's own
  privacy policy.

---

## 2. Data we process

| Data | Source | Why we process it | Retention |
|---|---|---|---|
| Feed filters (category, min reward, source, etc.) | You | To rank and filter the bounty feed | In memory for the duration of the request only |
| `webhook_url` (optional, via `subscribe_feed`) | You | To record where you would like notifications delivered | In-memory subscription for the session; not persisted to disk |
| IP address + User-Agent | Your request | Transient rate-limiting only | In-memory window; not persisted, not logged to disk |
| Apify API token | Apify gateway | Authenticates the caller at the platform edge | Not seen or stored by the Service |

## 3. What we do NOT collect

- No names, email addresses, phone numbers, or other personal identifiers.
- No accounts, passwords, or credentials.
- No persistent profile of your subscriptions or queries.
- No cookies, analytics, pixels, or advertising trackers.

## 4. Third parties / data recipients

| Recipient | Purpose | What they see | Notes |
|---|---|---|---|
| **Configured LLM endpoint** (optional classification) | Classify whether a bounty is agent-solvable | Bounty text only (public listing content) — **never** your filters or identity | Only used if the operator has configured an LLM endpoint |
| **Apify** (hosting) | Runs the Standby container and meters usage | Request metadata | Subject to Apify's privacy policy |

The bounty catalog itself is bundled with the Service. We do not disclose your inputs to
any other third party.

## 5. Hosting and infrastructure

The hosted Service runs on Apify's Standby infrastructure. Apify may process operational
metadata (timestamps, IP, billing records) as an independent controller. See
<https://apify.com/privacy-policy>. The Service runs no external database; subscriptions
live in process memory and are discarded on restart.

## 6. Self-hosted / open-source builds

This repository is open source (MIT). When you self-host, **you** are the data controller
for anything your deployment processes, including any webhook URL or LLM endpoint you
configure. The code ships with no telemetry that reports back to us.

## 7. Security

Transport is encrypted (TLS) at the Apify edge. All requests require the Apify gateway
bearer token. See [`SECURITY.md`](./SECURITY.md) for the threat model and vulnerability
reporting.

## 8. Children's privacy

The Service is a developer tool not directed at children, and we do not knowingly process
data from children under 16.

## 9. Your rights

Because we do not maintain persistent user profiles, there is generally no personal data to
access, correct, or erase. If you believe we hold data about you, contact us (Section 11)
and we will respond within 30 days.

## 10. Changes to this policy

We may update this policy as the Service evolves. Material changes will be reflected in the
"Last updated" date and, where appropriate, in the repository changelog.

## 11. Contact

Privacy questions or requests:
**Open an issue** at <https://github.com/PanStories/bountyradar-mcp/issues>.
For security matters, see [`SECURITY.md`](./SECURITY.md).

---

## 简体中文

**产品：** BountyRadar MCP — AI 智能体可解决的悬赏聚合与排序 MCP server
**运营方：** PanStories
**最后更新：** 2026-10-09

### 概要

- 本服务是**只读** MCP server，提供来自人工策展目录的、面向 AI 智能体的悬赏排序 feed，
  不会修改、删除或操作用户的任何系统。
- **无账号、无注册、无 Cookie、无广告或分析追踪。**
- 我们**不会**向广告商或数据经纪商出售、出租或共享你的数据。
- 服务维护**内存态订阅**。若你提供可选的 **`webhook_url`**，它仅在会话期间驻留内存，
  用于描述通知去向——**不**写入任何公开存储，也不外泄。
- 可选分类功能可能将悬赏文本发送至**由运营者配置的第三方 LLM 端点**（仅当已配置时）；
  不包含任何个人信息。
- 托管由 **Apify** 提供，平台层处理受 Apify 隐私政策约束。

### 我们处理的数据

| 数据 | 来源 | 用途 | 保留 |
|---|---|---|---|
| Feed 筛选条件（类别、最低赏金、来源等） | 调用方 | 排序与筛选悬赏 | 仅请求期间驻留内存 |
| `webhook_url`（可选，`subscribe_feed`） | 调用方 | 记录通知投递地址 | 会话内内存订阅；不落盘 |
| IP + User-Agent | 请求 | 仅用于限流 | 内存窗口，不落盘 |
| Apify API token | Apify 网关 | 在平台边缘鉴权 | 本服务不接触、不存储 |

### 第三方

- **已配置的 LLM 端点**（可选分类）：仅发送悬赏文本（公开列表内容），**绝不**发送你的筛选条件或身份。
- **Apify**（托管）：运行 Standby 容器并计量。

悬赏目录随服务自带；订阅为进程内存态，重启即丢弃。

### 自托管

本仓库为开源（MIT）。自托管时**你**即数据处理的控制者，包括你所配置的 webhook URL 或 LLM 端点。
代码不含任何回传遥测。

### 联系方式

在 <https://github.com/PanStories/bountyradar-mcp/issues> 提交 issue。
安全事项见 [`SECURITY.md`](./SECURITY.md)。
