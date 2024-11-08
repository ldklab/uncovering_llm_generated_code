// Revised WebSocket Server (ws-server.js)
const { WebSocketServer } = require('ws');

const server = new WebSocketServer({ port: 8080 });

server.on('connection', (socket) => {
  socket.on('error', console.error);

  socket.on('message', (data) => {
    console.log('Received:', data);
    socket.send(`Echo: ${data}`);
  });

  socket.send('Hello! Message From Server!!');
});

console.log('WebSocket server is listening on ws://localhost:8080');

// Revised WebSocket Client (ws-client.js)
const WebSocket = require('ws');

const client = new WebSocket('ws://localhost:8080');

client.on('error', console.error);

client.on('open', () => {
  console.log('Connected to server');
  client.send('Hello, Server!');
});

client.on('message', (message) => {
  console.log('Server says:', message);
});

client.on('close', () => {
  console.log('Disconnected from server');
});
