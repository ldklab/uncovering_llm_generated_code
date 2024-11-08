'use strict';

const WebSocket = require('./lib/websocket');

// Attach components to the WebSocket object
WebSocket.createWebSocketStream = require('./lib/stream');
WebSocket.Server = require('./lib/websocket-server');
WebSocket.Receiver = require('./lib/receiver');
WebSocket.Sender = require('./lib/sender');

// Provide synonyms for easier access
WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocket.Server;

// Export the WebSocket object
module.exports = WebSocket;
