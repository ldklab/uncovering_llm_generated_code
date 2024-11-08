// socks-proxy-agent.js
import net from 'net';
import tls from 'tls';
import { URL } from 'url';
import { Agent } from 'http';
import { SocksClient } from 'socks';

class SocksProxyAgent extends Agent {
  constructor(uri) {
    super();
    // Parse the provided URI to gather necessary proxy options.
    this.proxyOptions = new URL(uri);
  }

  /**
   * Custom createConnection method for establishing a connection through SOCKS proxy.
   */
  createConnection(options, callback) {
    const isSecureEndpoint = options.port === 443 || options.secureEndpoint;
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
      password: decodeURIComponent(this.proxyOptions.password)
    };

    const onSocksConnect = (info) => {
      let socket = info.socket;
      // Upgrade to TLS if the endpoint is secure.
      if (isSecureEndpoint) {
        const tlsOptions = {
          socket: socket,
          servername: options.servername || options.host?.replace(/:.*$/, '')
        };
        socket = tls.connect(tlsOptions);
      }
      callback(null, socket);
    };

    // Initiate the SOCKS connection.
    SocksClient.createConnection(proxyOptions).then(onSocksConnect).catch(callback);
  }
}

export { SocksProxyAgent };

// Example usage with the https module
import https from 'https';

const agent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');
https.get('https://ipinfo.io', { agent }, (res) => {
  console.log(res.headers);
  res.pipe(process.stdout);
});

// Example usage with the WebSocket module
import WebSocket from 'ws';

const wsAgent = new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com');
const socket = new WebSocket('ws://echo.websocket.events', { agent: wsAgent });

socket.on('open', function() {
  console.log('"open" event!');
  socket.send('hello world');
});

socket.on('message', function(data, flags) {
  console.log('"message" event! %j %j', data, flags);
  socket.close();
});
