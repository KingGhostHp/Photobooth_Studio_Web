const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createWebhookGateway } = require('../scripts/webhook-gateway.cjs');

async function fixture(t, options = {}, upstreamHandler) {
  const received = [];
  const upstream = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      received.push({ url: req.url, method: req.method, headers: req.headers, body: Buffer.concat(chunks).toString() });
      if (upstreamHandler) return upstreamHandler(res);
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"success":true}');
    });
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const gateway = createWebhookGateway({ upstreamPort: upstream.address().port, ...options });
  await new Promise(resolve => gateway.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await Promise.all([gateway, upstream].map(server => new Promise(resolve => server.close(resolve)))); });
  const base = `http://127.0.0.1:${gateway.address().port}`;
  const headers = { 'Content-Type': 'application/json', Authorization: 'Apikey unit-test-key' };
  return { base, received, headers };
}
test('gateway exposes only the exact POST webhook route', async t => {
  const f = await fixture(t);
  for (const path of ['/api/admin/orders', '/api/costumes', '/', '/api/payment/webhook?other=1']) {
    assert.equal((await fetch(f.base + path, { method: 'POST', headers: f.headers, body: '{}' })).status, 404);
  }
  assert.equal((await fetch(f.base + '/api/payment/webhook')).status, 404);
  assert.equal(f.received.length, 0);
});
test('gateway rejects missing authentication and non-JSON without reaching backend', async t => {
  const f = await fixture(t);
  assert.equal((await fetch(f.base + '/api/payment/webhook', { method: 'POST', body: '{}' })).status, 401);
  assert.equal((await fetch(f.base + '/api/payment/webhook', {
    method: 'POST', headers: { Authorization: f.headers.Authorization }, body: '{}' })).status, 415);
  assert.equal(f.received.length, 0);
});
test('gateway preserves callback bytes/auth and backend rejection status', async t => {
  const f = await fixture(t, {}, res => { res.writeHead(401); res.end('{"success":false}'); });
  const body = '{ "id": 42, "transferType": "in" }';
  const response = await fetch(f.base + '/api/payment/webhook', { method: 'POST',
    headers: { ...f.headers, Origin: 'https://untrusted.example' }, body });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { success: false });
  assert.equal(f.received[0].body, body);
  assert.equal(f.received[0].headers.authorization, f.headers.Authorization);
  assert.equal(f.received[0].headers.origin, undefined);
});
test('gateway limits callback size and forwards successful responses', async t => {
  const f = await fixture(t, { maxBodyBytes: 128 });
  assert.equal((await fetch(f.base + '/api/payment/webhook', { method: 'POST', headers: f.headers, body: 'x'.repeat(129) })).status, 413);
  assert.equal(f.received.length, 0);
  const response = await fetch(f.base + '/api/payment/webhook', { method: 'POST', headers: f.headers, body: '{}' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
});
