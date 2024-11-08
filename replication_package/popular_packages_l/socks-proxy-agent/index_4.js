import net from 'net';
import tls from 'tls';
import { URL } from 'url';
import { Agent } from 'http';
import { SocksClient } from 'socks';

class SocksProxyAgent extends Agent {
  constructor(uri) {
    super();
    this.proxyOptions = new URL(uri);
  }

  createConnection(options, callback) {
    const isSecureEndpoint = options.port === 443 || options.secureEndpoint;
    const proxyOptions = {
      proxy: {
        ipaddress: this.proxyOptions.hostname,
        port: parseInt(this.proxyOptions.port) || 1080,
        type: parseInt(this.proxyOptions.protocol.match(/\d+/)[0])
      },
      command: 'connect',
      destination: {
        host: options.hostname,
        port: options.port
      },
      userId: decodeURIComponent(this.proxyOptions.username),
      password: decodeURIComponent(this.proxyOptions.password),
    };

    SocksClient.createConnection(proxyOptions)
      .then(({ socket }) => {
        if (isSecureEndpoint) {
          const servername = options.servername || options.host.split(':')[0];
          socket = tls.connect({ socket, servername });
        }
        callback(null, socket);
      })
      .catch(callback);
  }
}

export { SocksProxyAgent };

import https from 'https';
import { SocksProxyAgent } from './socks-proxy-agent.js';

const agent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

https.get('https://ipinfo.io', { agent }, (res) => {
  console.log(res.headers);
  res.pipe(process.stdout);
});

import WebSocket from 'ws';
import { SocksProxyAgent } from './socks-proxy-agent.js';

const wsAgent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

const socket = new WebSocket('ws://echo.websocket.events', { agent: wsAgent });

socket.on('open', function () {
  console.log('"open" event!');
  socket.send('hello world');
});

socket.on('message', function (data, flags) {
  console.log('"message" event! %j %j', data, flags);
  socket.close();
});
