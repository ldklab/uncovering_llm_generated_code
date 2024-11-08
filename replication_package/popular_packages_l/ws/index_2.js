// ws-server.js
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(`Echo: ${message}`);
  });

  ws.send('Hello! Message From Server!!');
});

console.log('WebSocket server is listening on ws://localhost:8080');

// ws-client.js
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('error', console.error);

ws.on('open', () => {
  console.log('Connected to server');
  ws.send('Hello, Server!');
});

ws.on('message', (message) => {
  console.log('Server says:', message);
});

ws.on('close', () => {
  console.log('Disconnected from server');
});
