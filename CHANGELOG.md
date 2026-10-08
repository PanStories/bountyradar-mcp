# Changelog

## 1.0.1 (2026-10-08)
- EN: Added MCP tool annotations (readOnlyHint/destructiveHint/idempotentHint/openWorldHint) to all 7 tools — OpenAI MCP directory hard requirement; added tools trust-contract test suite (every tool referenced + 4-hint boolean assertions + negative cases); added SECURITY.md and M8ven badge; made subscribe_feed description match real behavior (in-memory store, webhook never called).
- 简体：为全部 7 个工具补齐 MCP 工具注解（四个显式布尔 hint，OpenAI 目录硬性要求）；新增工具信任契约测试套件（每个工具均被测试引用 + hint 布尔断言 + 负向用例）；补充 SECURITY.md 与 M8ven 徽章；修正 subscribe_feed 描述使其与实际行为一致（仅存内存，绝不调用 webhook）。
- 繁體：為全部 7 個工具補齊 MCP 工具註解（四個顯式布林 hint，OpenAI 目錄硬性要求）；新增工具信任契約測試套件（每個工具均被測試引用 + hint 布林斷言 + 負向用例）；補充 SECURITY.md 與 M8ven 徽章；修正 subscribe_feed 描述使其與實際行為一致（僅存記憶體，絕不呼叫 webhook）。

## 1.0.0 (2026-10-06)
- Initial release. Zero-dependency stdio MCP server + Apify PPE hosted variant.
- 7 tools (get_bounty_feed, search_bounties, get_bounty_detail, score_bounty, list_sources, get_stats, subscribe_feed).
- 3 resources (feed/latest, stats, sources) + 1 prompt (daily_bounty_brief).
- Deterministic agent-solvability scoring (freshness / competition / agent_solvable / reward / composite).
- Curated catalog of 12 sample bounties across 7 sources with a honeypot guard.
- Graceful refresh script (Apify scrape + free-LLM classify) that serves curated catalog without creds.
