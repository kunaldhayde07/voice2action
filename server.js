const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// we store connected clients globally so API routes can broadcast
global.wss = null;
global.wsClients = new Set();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/ws' });
  global.wss = wss;

  wss.on('connection', (ws) => {
    global.wsClients.add(ws);
    console.log(`[WS] Client connected. Total: ${global.wsClients.size}`);

    ws.on('message', (data) => {
      // clients can send ping to keep connection alive
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      global.wsClients.delete(ws);
      console.log(`[WS] Client disconnected. Total: ${global.wsClients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
      global.wsClients.delete(ws);
    });

    // send welcome with current timestamp
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Voice2Action real-time feed',
      timestamp: new Date().toISOString()
    }));
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`> Voice2Action running at http://localhost:${PORT}`);
    console.log(`> WebSocket server ready at ws://localhost:${PORT}/ws`);
  });
});