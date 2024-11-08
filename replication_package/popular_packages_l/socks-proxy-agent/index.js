// socks-proxy-agent.js
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

  /**
   * Custom implementation of the Agent's `createConnection` method.
   * This method is called to create a socket and execute the SOCKS handshake.
   */
  createConnection(options, callback) {
    const isSecureEndpoint = Boolean(options.port === 443 || options.secureEndpoint);
    const proxyOptions = {
      proxy: {
        ipaddress: this.proxyOptions.hostname,
        port: parseInt(this.proxyOptions.port || '1080'),
        type: parseInt(this.proxyOptions.protocol.replace(/\D/g, '')) // Extracts protocol number (e.g. 'socks5' -> 5)
      },
      command: 'connect',
      destination: {
        host: options.hostname,
        port: options.port
      },
      userId: decodeURIComponent(this.proxyOptions.username),
      password: decodeURIComponent(this.proxyOptions.password),
    };

    const onSocksConnect = (info) => {
      let socket = info.socket;
      if (isSecureEndpoint) {
        const hostHeader = options.host;
        const tlsOptions = {
          socket: socket,
          servername: options.servername || hostHeader && hostHeader.replace(/:.*$/, '')
        };
        socket = tls.connect(tlsOptions);
      }
      callback(null, socket);
    };

    SocksClient.createConnection(proxyOptions).then(onSocksConnect).catch(callback);
  }
}

export { SocksProxyAgent };

// Usage with https module
import https from 'https';
import { SocksProxyAgent } from './socks-proxy-agent.js';

const agent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

https.get('https://ipinfo.io', { agent }, (res) => {
  console.log(res.headers);
  res.pipe(process.stdout);
});

// Usage with ws (WebSocket) module
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
