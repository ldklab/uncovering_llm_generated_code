'use strict';

const WebSocket = require('./lib/websocket');
const createWebSocketStream = require('./lib/stream');
const WebSocketServer = require('./lib/websocket-server');
const Receiver = require('./lib/receiver');
const Sender = require('./lib/sender');

WebSocket.createWebSocketStream = createWebSocketStream;
WebSocket.Server = WebSocketServer;
WebSocket.Receiver = Receiver;
WebSocket.Sender = Sender;

module.exports = WebSocket;
