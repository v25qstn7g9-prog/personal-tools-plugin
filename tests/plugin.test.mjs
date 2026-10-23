import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const plugin = JSON.parse(readFileSync(new URL('plugin.json', root), 'utf8'));
const mcp = JSON.parse(readFileSync(new URL('mcp.json', root), 'utf8'));
const legacy = JSON.parse(readFileSync(new URL('.mcp.json', root), 'utf8'));
const expected = {
  'stock-app': 'new-version-stack-app.9n94fh64jr.workers.dev',
  'atlas-lab': 'atlas-lab.9n94fh64jr.workers.dev',
  'si-hub': 'si-hub-v2.9n94fh64jr.workers.dev',
  regwatch: 'reg-watch.9n94fh64jr.workers.dev',
};

test('root manifest declares Agent Plugins 1.0 and does not mix inline legacy MCP fields', () => {
  assert.ok(plugin.name && plugin.description);
  assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(plugin.version, '1.0.1');
  assert.ok(!('mcpServers' in plugin));
  const allowed = new Set(['$schema', 'name', 'version', 'description', 'author',
    'homepage', 'repository', 'license', 'keywords', 'extensions']);
  for (const key of Object.keys(plugin)) assert.ok(allowed.has(key));
});

test('canonical MCP configuration contains four concrete remote definitions without credentials', () => {
  assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
  assert.deepEqual(Object.keys(mcp).sort(), ['$schema', 'mcpServers']);
  assert.deepEqual(Object.keys(mcp.mcpServers).sort(), Object.keys(expected).sort());
  for (const [id, server] of Object.entries(mcp.mcpServers)) {
    assert.deepEqual(Object.keys(server).sort(), ['type', 'url']);
    assert.equal(server.type, 'streamable-http');
    const u = new URL(server.url);
    assert.equal(u.protocol, 'https:');
    assert.equal(u.hostname, expected[id]);
    assert.equal(u.pathname, '/mcp');
    assert.equal(u.search, '');
    assert.equal(u.username + u.password + u.hash, '');
    assert.ok(!/\$\{/.test(server.url));
  }
});

test('legacy hidden MCP configuration mirrors canonical servers without exposing credentials', () => {
  assert.deepEqual(Object.keys(legacy), ['mcpServers']);
  assert.deepEqual(Object.keys(legacy.mcpServers).sort(), Object.keys(expected).sort());
  for (const [id, server] of Object.entries(legacy.mcpServers)) {
    assert.equal(server.type, 'http');
    assert.equal(server.url, mcp.mcpServers[id].url);
    assert.deepEqual(Object.keys(server).sort(), ['type', 'url']);
  }
});

test('publishable root contains only reviewed package files', () => {
  const allowed = new Set(['.git', 'plugin.json', 'mcp.json', '.mcp.json', 'README.md', 'tests']);
  for (const file of readdirSync(root)) assert.ok(allowed.has(file), `Unexpected public file: ${file}`);
  const configs = JSON.stringify({plugin, mcp, legacy});
  assert.ok(!/Bearer\s+|x-api-key|headers|token|password|secret|\$\{/i.test(configs));
});
