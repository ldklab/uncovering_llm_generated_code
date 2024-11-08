// ws-server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (client) => {
  client.on('error', console.error);

  client.on('message', (data) => {
    console.log('Received:', data);
    client.send(`Echo: ${data}`);
  });

  client.send('Hello! Message From Server!!');
});

console.log('WebSocket server is listening on ws://localhost:8080');

// ws-client.js
const WebSocket = require('ws');

const client = new WebSocket('ws://localhost:8080');

client.on('error', console.error);

client.on('open', () => {
  console.log('Connected to server');
  client.send('Hello, Server!');
});

client.on('message', (data) => {
  console.log('Server says:', data);
});

client.on('close', () => {
  console.log('Disconnected from server');
});
