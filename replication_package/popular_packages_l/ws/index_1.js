// ws-server.js
const { WebSocketServer } = require('ws');

// Initialize a WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

// Listen for client connections to the server
wss.on('connection', (clientSocket) => {
  
  // Handle errors on the client socket
  clientSocket.on('error', console.error);
  
  // Set up an event listener for incoming messages from clients
  clientSocket.on('message', (receivedMessage) => {
    
    // Log the received message to the console
    console.log('Received:', receivedMessage);
    
    // Echo the message back to the originating client
    clientSocket.send(`Echo: ${receivedMessage}`);
  });

  // Send a greeting message to the client upon successful connection
  clientSocket.send('Hello! Message From Server!!');
});

console.log('WebSocket server is listening on ws://localhost:8080');

// ws-client.js
const WebSocket = require('ws');

// Establish a connection to the WebSocket server
const client = new WebSocket('ws://localhost:8080');

// Handle any errors that occur during the WebSocket connection
client.on('error', console.error);

// Event handler for when the connection to the server is successfully established
client.on('open', () => {
  console.log('Connected to server');
  
  // Send a greeting message to the server
  client.send('Hello, Server!');
});

// Set up an event listener to process messages received from the server
client.on('message', (serverMessage) => {
  console.log('Server says:', serverMessage);
});

// Event handler for when the connection to the server is closed
client.on('close', () => {
  console.log('Disconnected from server');
});
