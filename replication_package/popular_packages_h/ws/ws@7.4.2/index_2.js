'use strict';

const WebSocket = require('./lib/websocket');

const createWebSocketStream = require('./lib/stream');
const WebSocketServer = require('./lib/websocket-server');
const WebSocketReceiver = require('./lib/receiver');
const WebSocketSender = require('./lib/sender');

WebSocket.createWebSocketStream = createWebSocketStream;
WebSocket.Server = WebSocketServer;
WebSocket.Receiver = WebSocketReceiver;
WebSocket.Sender = WebSocketSender;

module.exports = WebSocket;
