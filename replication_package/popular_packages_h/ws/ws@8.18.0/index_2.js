'use strict';

const WebSocket = require('./lib/websocket');

// Enhance WebSocket with additional functionalities
WebSocket.createWebSocketStream = require('./lib/stream');  // Adds stream support
WebSocket.Server = require('./lib/websocket-server');       // Adds server capabilities
WebSocket.Receiver = require('./lib/receiver');             // Adds message receiving capabilities
WebSocket.Sender = require('./lib/sender');                 // Adds message sending capabilities

// Define module aliases
WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocket.Server;

// Export the enhanced WebSocket module
module.exports = WebSocket;
