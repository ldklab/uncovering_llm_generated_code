// The original Node.js code defines an HttpProxyAgent to proxy HTTP requests.
// Explanation:
// 1. The `HttpProxyAgent` is a custom agent that extends the native `http.Agent`.
// 2. The constructor takes a proxy URL (as a string or URL object) and optionally, headers.
// 3. The `addRequest` method establishes a connection to the proxy server using the `net.connect` function and sends an HTTP CONNECT method to request a tunnel to the target server (specified in `options.hostname` and `options.port`).
// 4. If the proxy responds with '200 Connection Established', the connection is successful; otherwise, an error is emitted.
// 5. The agent can be used to make proxied HTTP requests, as demonstrated in the example usage.

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
    const socket = net.connect({
      hostname: this.proxy.hostname,
      port: this.proxy.port || 80
    }, () => {
      const headers = Object.assign({}, this.headers, {
        'Host': `${options.hostname}:${options.port}`,
        'Connection': 'close'
      });

      if (typeof this.headers === 'function') {
        Object.assign(headers, this.headers());
      }

      const proxyHeaders = Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n');

      const connectRequest = [
        `CONNECT ${options.hostname}:${options.port} HTTP/1.1`,
        proxyHeaders,
        '',
        ''
      ].join('\r\n');

      socket.write(connectRequest);

      socket.once('data', (chunk) => {
        const response = chunk.toString();
        if (!response.includes('200 Connection Established')) {
          socket.end();
          req.emit('error', new Error('Failed to connect to proxy'));
          return;
        }

        req.onSocket(socket);
      });
    });

    socket.on('error', (err) => {
      req.emit('error', err);
    });
  }
}

// Example usage
import { HttpProxyAgent } from './http-proxy-agent';
import http from 'http';

const agent = new HttpProxyAgent('http://168.63.76.32:3128');

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
