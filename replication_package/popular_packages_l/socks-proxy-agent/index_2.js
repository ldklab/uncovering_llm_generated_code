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

  createConnection(options, callback) {
    const isSecure = options.port === 443 || options.secureEndpoint;
    const proxyOptions = {
      proxy: {
        ipaddress: this.proxyOptions.hostname,
        port: parseInt(this.proxyOptions.port || '1080'),
        type: parseInt(this.proxyOptions.protocol.replace(/\D/g, ''))
      },
      command: 'connect',
      destination: {
        host: options.hostname,
        port: options.port
      },
      userId: decodeURIComponent(this.proxyOptions.username),
      password: decodeURIComponent(this.proxyOptions.password),
    };

    SocksClient.createConnection(proxyOptions).then((info) => {
      let socket = info.socket;
      if (isSecure) {
        const tlsOptions = {
          socket,
          servername: options.servername || options.host.replace(/:.*$/, '')
        };
        socket = tls.connect(tlsOptions);
      }
      callback(null, socket);
    }).catch(callback);
  }
}

export { SocksProxyAgent };

// Usage with https module
import https from 'https';

const agent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

https.get('https://ipinfo.io', { agent }, (res) => {
  console.log(res.headers);
  res.pipe(process.stdout);
});

// Usage with ws (WebSocket) module
import WebSocket from 'ws';

const wsAgent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');

const socket = new WebSocket('ws://echo.websocket.events', { agent: wsAgent });

socket.on('open', () => {
  console.log('"open" event!');
  socket.send('hello world');
});

socket.on('message', (data) => {
  console.log('"message" event!', data);
  socket.close();
});
