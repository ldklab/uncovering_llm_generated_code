import http from 'http';
import { URL } from 'url';
import net from 'net';

class HttpProxyAgent extends http.Agent {
  constructor(proxyUrl, options = {}) {
    super(options);
    this.proxy = typeof proxyUrl === 'string' ? new URL(proxyUrl) : proxyUrl;
    this.headers = options.headers || {};
  }

  addRequest(req, options) {
    const socket = net.connect({
      host: this.proxy.hostname,
      port: this.proxy.port || 80
    }, () => {
      const defaultHeaders = Object.assign({}, this.headers);
      defaultHeaders['Host'] = `${options.host}:${options.port}`;
      defaultHeaders['Connection'] = 'close';
      
      if (typeof this.headers === 'function') {
        Object.assign(defaultHeaders, this.headers());
      }

      const requestHeaders = Object.entries(defaultHeaders).map(([key, value]) => `${key}: ${value}`).join('\r\n');
      const connectRequest = [
        `CONNECT ${options.host}:${options.port} HTTP/1.1`,
        requestHeaders,
        '',
        ''
      ].join('\r\n');
      
      socket.write(connectRequest);

      socket.once('data', (data) => {
        const response = data.toString();
        if (!response.includes('200 Connection Established')) {
          socket.end();
          req.emit('error', new Error('Could not connect to proxy'));
          return;
        }
        req.onSocket(socket);
      });
    });

    socket.on('error', (error) => {
      req.emit('error', error);
    });
  }
}

// Example demonstrating agent usage
const proxyAgent = new HttpProxyAgent('http://168.63.76.32:3128');

http.get('http://nodejs.org/api/', { agent: proxyAgent }, (response) => {
  console.log('Response received!', response.headers);
  response.pipe(process.stdout);
});
