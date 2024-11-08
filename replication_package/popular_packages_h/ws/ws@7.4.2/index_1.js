'use strict';

const WebSocket = require('./lib/websocket');

Object.assign(WebSocket, {
  createWebSocketStream: require('./lib/stream'),
  Server: require('./lib/websocket-server'),
  Receiver: require('./lib/receiver'),
  Sender: require('./lib/sender')
});

module.exports = WebSocket;
