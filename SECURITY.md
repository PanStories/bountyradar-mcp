# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| latest on `main` | ✅ |
| older tags | ❌ (upgrade to latest) |

## Reporting a vulnerability

Use GitHub's **private vulnerability reporting** (Security tab → Report a vulnerability).
Do not open a public issue with exploit details. You will get an acknowledgement
within 7 days and a fix or a mitigation plan within 30 days for confirmed issues.

## Scope

- This server is a **read-only intelligence feed** over a locally seeded bounty
  catalog. It never writes to your filesystem, executes shell commands, or
  requests secrets.
- `subscribe_feed` stores a filter profile **in memory only** (nothing persisted,
  nothing sent anywhere). It is positioned as an alerting/intel layer and is
  deliberately **not** a marketplace: no custody, no KYC, no settlement.
- Honeypot entries are flagged and excluded from feeds by default.
- The hosted Apify endpoint authenticates through the Apify platform's own token
  mechanism. This server stores no additional secrets and requires no API keys.

## What we will never ask for

This server never requests wallet keys, database passwords, or raw credentials of
any kind. Any "version" of it that does is not ours.
