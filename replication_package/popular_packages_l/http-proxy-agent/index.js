// http-proxy-agent/index.js
import http from 'http';
import { URL } from 'url';
import net from 'net';

export class HttpProxyAgent extends http.Agent {
  constructor(proxy, options = {}) {
    super(options);
    this.proxy = typeof(proxy) === 'string' ? new URL(proxy) : proxy;
    this.headers = options.headers || {};
  }

  addRequest(req, options) {
    const socket = net.connect({
      hostname: this.proxy.hostname,
      port: this.proxy.port || 80
    }, () => {
      const headers = Object.assign({}, this.headers);
      headers['Host'] = `${options.hostname}:${options.port}`;
      headers['Connection'] = 'close';

      if (typeof this.headers === 'function') {
        Object.assign(headers, this.headers());
      }

      const proxyHeaders = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
      const connectReq = [
        `CONNECT ${options.hostname}:${options.port} HTTP/1.1`,
        proxyHeaders,
        '',
        ''
      ].join('\r\n');

      socket.write(connectReq);

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

// Example of usage from README.md
import { HttpProxyAgent } from './http-proxy-agent';
import http from 'http';

const agent = new HttpProxyAgent('http://168.63.76.32:3128');

http.get('http://nodejs.org/api/', { agent }, (res) => {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});
