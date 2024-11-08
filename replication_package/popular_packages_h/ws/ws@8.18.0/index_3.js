'use strict';

const WebSocketBase = require('./lib/websocket');
const WebSocketStream = require('./lib/stream');
const WebSocketServer = require('./lib/websocket-server');
const WebSocketReceiver = require('./lib/receiver');
const WebSocketSender = require('./lib/sender');

const WebSocket = {
  createWebSocketStream: WebSocketStream,
  Server: WebSocketServer,
  Receiver: WebSocketReceiver,
  Sender: WebSocketSender,
  WebSocket: WebSocketBase,
  WebSocketServer: WebSocketServer
};

module.exports = WebSocket;
