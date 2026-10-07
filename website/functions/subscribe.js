// website/functions/subscribe.js — Cloudflare Pages Function.
// Validate -> persist to KV (BOUNTY_SUBSCRIBERS) -> optional Slack forward.
// No creds / no binding => log-only, still 200 so the site can ship first.
export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_json' }, 400); }

  const email = String(data.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email_invalid' }, 400);

  const channel = Array.isArray(data.channel) ? data.channel.slice(0, 4) : ['email'];
  const category = Array.isArray(data.category) ? data.category.slice(0, 6) : [];
  const min_reward = Math.max(0, Math.min(100000, Number(data.min_reward) || 0));
  const max_competition = Math.max(0, Math.min(500, Number(data.max_competition) || 5));

  const sub = {
    email, channel, category, min_reward, max_competition,
    submitted_at: new Date().toISOString(),
    source: 'website',
  };

  if (env && env.BOUNTY_SUBSCRIBERS) {
    try {
      const key = 'sub:' + String(Date.now()).padStart(15, '0') + '-' + Math.random().toString(36).slice(2, 6);
      await env.BOUNTY_SUBSCRIBERS.put(key, JSON.stringify(sub));
    } catch (e) {
      console.error('[subscribe] KV write failed:', e && e.message);
      return json({ ok: false, error: 'storage_unavailable' }, 503);
    }
  } else {
    console.log('[subscribe] no KV binding — logged only:', email);
  }

  if (env && env.SUBSCRIBE_SLACK_WEBHOOK) {
    try {
      await fetch(env.SUBSCRIBE_SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `New BountyRadar subscriber: ${email} (${channel.join(',')})` }),
      });
    } catch (e) { console.error('[subscribe] slack failed:', e.message); }
  }
  return json({ ok: true });
}
function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
