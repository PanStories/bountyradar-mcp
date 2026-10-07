# UIUX.md — BountyRadar MCP

> Designer expert output. MCP is headless; this governs the (deferred) directory site + the verification showcase HTML + any console output.

## 1. Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0B1220` (deep navy) | Panels, showcase bg |
| `--surface` | `#111B2E` | Cards |
| `--text` | `#E6EDF6` | Body text (light theme IDE → use `#0B1220` on light) |
| `--accent` | `#2DD4BF` (teal) | Primary action, rank bars |
| `--warn` | `#FBBF24` | Stale / high-competition |
| `--danger` | `#F87171` | needs_human / honeypot flag |
| Font | System UI stack | No web-font dependency |

**Hard rules:** No Indigo/Purple AI-defaults. No gradients. Inline SVG only (zero dependency). System fonts.

## 2. Component Specs (showcase / future site)

- **Feed card:** title (bold), source badge, reward pill, rank bar (composite %), three micro-scores (solvable/fresh/competition) as teal bars, tags.
- **Source badge:** mono uppercase, colored by status (live=teal, curated=slate).
- **Score bars:** 0–100% width, teal fill, label right.

## 3. P0 Red-Line Checklist (automated in CI via check-p0)

- [ ] No emoji icons (use inline SVG)
- [ ] No CSS gradients
- [ ] No placeholder/lorem text in shipped samples
- [ ] No hardcoded Indigo/Purple
- [ ] All user-facing strings i18n-ready (en + zh)

## 4. MCP Consumer Experience

Agent flow: `initialize` → `tools/list` → `get_bounty_feed({max_competition:2, agent_solvable_min:0.7})` → pick top item → `get_bounty_detail`. Read-only, pull-based, no push.
