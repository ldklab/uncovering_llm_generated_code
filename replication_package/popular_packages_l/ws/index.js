// ws-server.js
const { WebSocketServer } = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });

// Listen for connection events
wss.on('connection', (ws) => {
  ws.on('error', console.error);
  
  // Respond to received messages
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Echo the message back to the client
    ws.send(`Echo: ${message}`);
  });

  // Send a message to the client upon connection
  ws.send('Hello! Message From Server!!');
});

console.log('WebSocket server is listening on ws://localhost:8080');

// ws-client.js
const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080');

// Handle possible connection errors
ws.on('error', console.error);

// Once connection is open, send a message to the server
ws.on('open', () => {
  console.log('Connected to server');
  ws.send('Hello, Server!');
});

// Listen for messages from the server
ws.on('message', (message) => {
  console.log('Server says:', message);
});

// Handle connection close events
ws.on('close', () => {
  console.log('Disconnected from server');
});
