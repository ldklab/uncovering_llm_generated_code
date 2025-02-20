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
   * Custom method to establish a connection through a SOCKS proxy.
   * It handles creating the socket and conducts the SOCKS handshake.
   */
  createConnection(options, callback) {
    const isSecureEndpoint = options.port === 443 || options.secureEndpoint;
    const proxyOptions = {
      proxy: {
        ipaddress: this.proxyOptions.hostname,
        port: parseInt(this.proxyOptions.port || '1080', 10),
        type: parseInt(this.proxyOptions.protocol.replace(/\D/g, ''), 10)
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
          const hostHeader = options.host;
          const tlsOptions = {
            socket,
            servername: options.servername || (hostHeader && hostHeader.replace(/:.*$/, ''))
          };
          socket = tls.connect(tlsOptions);
        }
        callback(null, socket);
      })
      .catch(callback);
  }
}

export { SocksProxyAgent };

// Usage with the HTTPS module
import https from 'https';
import { SocksProxyAgent } from './socks-proxy-agent.js';

const agent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

https.get('https://ipinfo.io', { agent }, (res) => {
  res.pipe(process.stdout);
});

// Usage with the WebSocket module
import WebSocket from 'ws';

const wsAgent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

const socket = new WebSocket('ws://echo.websocket.events', { agent: wsAgent });

socket.on('open', () => {
  console.log('"open" event!');
  socket.send('hello world');
});

socket.on('message', (data, flags) => {
  console.log('"message" event!', data, flags);
  socket.close();
});
