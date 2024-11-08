// http-proxy-agent/index.js
import http from 'http';
import { URL } from 'url';
import net from 'net';

export class HttpProxyAgent extends http.Agent {
  constructor(proxy, options = {}) {
    super(options);
    this.proxy = typeof proxy === 'string' ? new URL(proxy) : proxy;
    this.headers = options.headers || {};
  }

  addRequest(req, options) {
    const { hostname, port } = this.proxy;

    const socket = net.connect({ hostname, port: port || 80 }, () => {
      const headers = { ...this.headers, Host: `${options.hostname}:${options.port}`, Connection: 'close' };

      if (typeof this.headers === 'function') {
        Object.assign(headers, this.headers());
      }

      const proxyHeaders = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\r\n');
      const connectReq = `CONNECT ${options.hostname}:${options.port} HTTP/1.1\r\n${proxyHeaders}\r\n\r\n`;

      socket.write(connectReq);

      socket.once('data', (chunk) => {
        if (!chunk.toString().includes('200 Connection Established')) {
          socket.end();
          req.emit('error', new Error('Failed to connect to proxy'));
          return;
        }

        req.onSocket(socket);
      });
    });

    socket.on('error', (err) => req.emit('error', err));
  }
}

// Example of usage from README.md
import { HttpProxyAgent } from './http-proxy-agent';
import http from 'http';

const agent = new HttpProxyAgent('http://168.63.76.32:3128');

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
