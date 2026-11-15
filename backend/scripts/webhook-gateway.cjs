// A local, webhook-only entry point for a development tunnel.
// Authentication and transaction verification stay in the main backend.
const http = require('node:http');

function createWebhookGateway({ upstreamPort = 5000, maxBodyBytes = 65536, timeoutMs = 10000 } = {}) {
  if (!Number.isInteger(upstreamPort) || upstreamPort < 1 || upstreamPort > 65535) throw Error('Invalid upstream port');
  const server = http.createServer((req, res) => {
    const reply = (status, message) => {
      if (res.writableEnded) return;
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ success: false, message }));
    };
    if (req.method !== 'POST' || req.url !== '/api/payment/webhook') {
      req.resume(); return reply(404, 'Not found');
    }
    if (!/^(Apikey|Bearer) \S+$/i.test(req.headers.authorization || '')) {
      req.resume(); return reply(401, 'Webhook authentication required');
    }
    if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
      req.resume(); return reply(415, 'JSON required');
    }
    let size = 0, rejected = false;
    const chunks = [];
    req.on('data', chunk => {
      if (rejected) return;
      size += chunk.length;
      if (size > maxBodyBytes) {
        rejected = true; chunks.length = 0; reply(413, 'Payload too large');
      } else chunks.push(chunk);
    });
    req.on('error', () => reply(400, 'Invalid request'));
    req.on('end', () => {
      if (rejected) return;
      const body = Buffer.concat(chunks);
      const upstream = http.request({
        hostname: '127.0.0.1', port: upstreamPort, path: '/api/payment/webhook', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': body.length,
          Authorization: req.headers.authorization },
      }, response => {
        res.writeHead(response.statusCode, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        response.on('error', () => res.destroy());
        response.pipe(res);
      });
      upstream.setTimeout(timeoutMs, () => upstream.destroy());
      upstream.on('error', () => { if (!res.headersSent) reply(502, 'Studio backend unavailable'); else res.destroy(); });
      res.on('close', () => { if (!res.writableFinished) upstream.destroy(); });
      upstream.end(body);
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (require.main === module) {
  const port = Number(process.env.WEBHOOK_GATEWAY_PORT || 5002);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid gateway port');
  const server = createWebhookGateway();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Webhook-only gateway: http://127.0.0.1:${port}/api/payment/webhook`));
}
module.exports = { createWebhookGateway };
