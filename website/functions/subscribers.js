// website/functions/subscribers.js — Cloudflare Pages Function.
// Guarded CSV export of subscribers. Fail closed: 403 unless ADMIN_KEY matches.
const HEADER = ['submitted_at', 'email', 'channel', 'category', 'min_reward', 'max_competition', 'source'];

function safeEqual(a, b) {
  a = String(a == null ? '' : a); b = String(b == null ? '' : b);
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function csvCell(v) {
  v = String(v == null ? '' : v);
  if (/["\n\r,]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}
export async function onRequestGet({ request, env }) {
  if (!env || !env.ADMIN_KEY) return forbidden('not_configured');
  const key = new URL(request.url).searchParams.get('key');
  if (!safeEqual(key, env.ADMIN_KEY)) return forbidden('bad_key');
  if (!env || !env.BOUNTY_SUBSCRIBERS) return forbidden('no_binding');

  let out = '﻿' + HEADER.join(',') + '\r\n';
  let cursor;
  do {
    const list = await env.BOUNTY_SUBSCRIBERS.list({ prefix: 'sub:', cursor });
    for (const { name } of list.keys) {
      try {
        const raw = await env.BOUNTY_SUBSCRIBERS.get(name);
        const r = JSON.parse(raw);
        out += HEADER.map((h) => csvCell(h === 'category' || h === 'channel' ? (r[h] || []).join(' | ') : r[h])).join(',') + '\r\n';
      } catch (e) { /* skip corrupt row */ }
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  const day = new Date().toISOString().slice(0, 10);
  return new Response(out, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${day}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
function forbidden(why) {
  return new Response(JSON.stringify({ error: why }), { status: 403, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
