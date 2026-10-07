#!/usr/bin/env node
// server.mjs — BountyRadar MCP server (zero-dependency JSON-RPC 2.0 over stdio).
// DISCIPLINE: stdout carries ONLY JSON-RPC frames; all logs go to stderr (SPEC §11 C1).
import { createInterface } from 'node:readline';
import * as D from './core/dispatch.mjs';

// Eager-load catalog so failures surface before serving.
try { D.bounties(); } catch (e) { console.error('[bountyradar] catalog load failed:', e.message); process.exit(1); }

function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }

function dispatch(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize': return send({ jsonrpc: '2.0', id, result: D.initializeResult() });
    case 'ping': return send({ jsonrpc: '2.0', id, result: {} });
    case 'tools/list': return send({ jsonrpc: '2.0', id, result: D.toolsList() });
    case 'tools/call': {
      const r = D.toolsCall(params.name, params.arguments || {});
      return send({ jsonrpc: '2.0', id, result: r });
    }
    case 'resources/list': return send({ jsonrpc: '2.0', id, result: D.resourcesList() });
    case 'resources/read': return send({ jsonrpc: '2.0', id, result: D.resourcesRead(params.uri) });
    case 'prompts/list': return send({ jsonrpc: '2.0', id, result: D.promptsList() });
    case 'prompts/get': return send({ jsonrpc: '2.0', id, result: D.promptsGet(params.name, params.arguments) });
    default: return send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  const t = line.trim();
  if (!t) return;
  let msg;
  try { msg = JSON.parse(t); } catch { return; }
  if (msg.id === undefined || msg.id === null) return; // notification -> no response
  try { dispatch(msg); } catch (e) { send({ jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: e.message } }); }
});
rl.on('close', () => process.exit(0));

console.error(`[bountyradar] ready: ${D.bounties().length} bounties loaded`);
