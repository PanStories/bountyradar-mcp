#!/usr/bin/env node
// scripts/mcp-smoke.mjs — spawn the MCP server, drive initialize -> tools/list -> tools/call, assert.
// Zero install (uses node:child_process). Exits non-zero on failure.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SERVER = fileURLToPath(new URL('../src/server.mjs', import.meta.url));

function rpc(id, method, params) { return JSON.stringify({ jsonrpc: '2.0', id, method, params }); }

function run() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [SERVER], { stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [];
    let buf = '';
    child.stdout.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (line) { try { out.push(JSON.parse(line)); } catch {} }
      }
    });
    child.stderr.on('data', () => {});

    const send = (msg) => child.stdin.write(msg + '\n');
    const waitFor = (pred, ms = 3000) => new Promise((res, rej) => {
      const t0 = Date.now();
      const iv = setInterval(() => {
        const hit = out.find(pred);
        if (hit) { clearInterval(iv); res(hit); }
        else if (Date.now() - t0 > ms) { clearInterval(iv); rej(new Error('timeout')); }
      }, 20);
    });

    send(rpc(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } }));
    send(rpc(2, 'tools/list', {}));
    send(rpc(3, 'tools/call', { name: 'get_bounty_feed', arguments: { max_competition: 3, agent_solvable_min: 0.7, limit: 5 } }));
    send(rpc(4, 'tools/call', { name: 'get_stats', arguments: {} }));

    (async () => {
      try {
        const init = await waitFor((m) => m.id === 1);
        assert(init.result.protocolVersion === '2024-11-05', 'protocol version');
        const list = await waitFor((m) => m.id === 2);
        assert(list.result.tools.length >= 7, 'tool count >= 7');
        const feed = await waitFor((m) => m.id === 3);
        assert(feed.result.structuredContent.total >= 1, 'feed has items');
        assert(feed.result.structuredContent.items.every((i) => i.score.composite >= 0), 'feed scored');
        const stats = await waitFor((m) => m.id === 4);
        assert(stats.result.structuredContent.total >= 12, 'stats total');
        console.log('SMOKE OK — initialize, tools/list(>=7), get_bounty_feed, get_stats all passed');
        child.kill();
        resolve();
      } catch (e) { child.kill(); reject(e); }
    })();
  });
}

function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }

run().then(() => process.exit(0)).catch((e) => { console.error('SMOKE FAIL:', e.message); process.exit(1); });
