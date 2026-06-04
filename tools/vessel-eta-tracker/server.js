#!/usr/bin/env node
/**
 * VesselETA local server
 * - Serves the HTML dashboard on http://localhost:3000
 * - Proxies WebSocket AIS data at ws://localhost:3000/ais
 *   (browsers can't connect directly to aisstream.io due to Origin checks)
 */

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT     = process.env.PORT || 3000;
const AIS_URL  = 'wss://stream.aisstream.io/v0/stream';
const MIME     = { '.html':'text/html', '.json':'application/json',
                   '.js':'application/javascript', '.css':'text/css',
                   '.png':'image/png', '.ico':'image/x-icon' };

// ── HTTP static file server ──────────────────────────────────────────────────
const httpServer = http.createServer((req, res) => {
  const url  = req.url === '/' ? '/index.html' : req.url;
  const file = path.join(__dirname, url.split('?')[0]);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain',
                          'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ── WebSocket proxy ───────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer, path: '/ais' });

wss.on('connection', (client) => {
  let upstream = null;

  client.on('message', (rawMsg) => {
    // First message from browser = subscription JSON with APIKey
    if (!upstream) {
      try {
        const sub = JSON.parse(rawMsg.toString());
        upstream = new WebSocket(AIS_URL);

        upstream.on('open', () => {
          upstream.send(JSON.stringify(sub));
          console.log('[proxy] Subscribed to aisstream.io, key=…' +
            (sub.APIKey || '').slice(-6));
        });

        upstream.on('message', (data, isBinary) => {
          if (client.readyState === WebSocket.OPEN)
            client.send(isBinary ? data : data.toString(), { binary: false });
        });

        upstream.on('close',  (code, reason) => {
          console.log('[proxy] aisstream.io closed:', code, reason.toString());
          client.close();
        });

        upstream.on('error', (e) => {
          console.error('[proxy] upstream error:', e.message);
          client.close();
        });

      } catch (e) {
        console.error('[proxy] bad subscription message:', e.message);
        client.close();
      }
    } else if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(rawMsg);
    }
  });

  client.on('close', () => { if (upstream) upstream.close(); });
  client.on('error', () => { if (upstream) upstream.close(); });
});

httpServer.listen(PORT, () => {
  console.log(`\n⚓  VesselETA running at  http://localhost:${PORT}`);
  console.log(`   WebSocket proxy       ws://localhost:${PORT}/ais\n`);
});
