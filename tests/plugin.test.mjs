import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const plugin = JSON.parse(readFileSync(new URL('plugin.json', root), 'utf8'));
const mcp = JSON.parse(readFileSync(new URL('mcp.json', root), 'utf8'));
const expected = {
  'stock-app': 'new-version-stack-app.9n94fh64jr.workers.dev',
  'atlas-lab': 'atlas-lab.9n94fh64jr.workers.dev',
  'si-hub': 'si-hub-v2.9n94fh64jr.workers.dev',
  regwatch: 'reg-watch.9n94fh64jr.workers.dev',
};

test('root manifest contains four concrete remote MCP definitions without credentials', () => {
  assert.ok(plugin.name && plugin.description);
  assert.deepEqual(Object.keys(plugin.mcpServers).sort(), Object.keys(expected).sort());
  for (const [id, server] of Object.entries(plugin.mcpServers)) {
    assert.deepEqual(Object.keys(server).sort(), ['type', 'url']);
    assert.equal(server.type, 'http');
    const u = new URL(server.url);
    assert.equal(u.protocol, 'https:');
    assert.equal(u.hostname, expected[id]);
    assert.equal(u.pathname, '/mcp');
    assert.equal(u.search, '');
    assert.equal(u.username + u.password + u.hash, '');
    assert.ok(!/\$\{/.test(server.url));
  }
});

test('standard MCP configuration mirrors the same four servers', () => {
  assert.deepEqual(Object.keys(mcp.mcpServers).sort(), Object.keys(expected).sort());
  for (const [id, server] of Object.entries(mcp.mcpServers)) {
    assert.equal(server.type, 'streamable-http');
    assert.equal(server.url, plugin.mcpServers[id].url);
    assert.deepEqual(Object.keys(server).sort(), ['type', 'url']);
  }
});

test('publishable root contains only reviewed package files', () => {
  const allowed = new Set(['.git', 'plugin.json', 'mcp.json', 'README.md', 'tests']);
  for (const file of readdirSync(root)) assert.ok(allowed.has(file), `Unexpected public file: ${file}`);
  const configs = JSON.stringify({plugin, mcp});
  assert.ok(!/Bearer\s+|x-api-key|headers|token|password|secret|\$\{/i.test(configs));
});
