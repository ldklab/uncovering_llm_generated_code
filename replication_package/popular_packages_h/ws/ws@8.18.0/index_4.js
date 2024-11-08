'use strict';

const WebSocket = require('./lib/websocket');

const createWebSocketStream = require('./lib/stream');
const Server = require('./lib/websocket-server');
const Receiver = require('./lib/receiver');
const Sender = require('./lib/sender');

module.exports = {
  ...WebSocket,
  createWebSocketStream,
  WebSocket: WebSocket,
  Server,
  Receiver,
  Sender,
  WebSocketServer: Server
};
