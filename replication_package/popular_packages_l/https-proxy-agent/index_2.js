import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

class HttpsProxyAgent extends http.Agent {
  constructor(proxyUrl, options = {}) {
    super(options);
    this.proxy = new URL(proxyUrl);
    this.headers = options.headers || {};
  }

  createConnection(options, callback) {
    const requestOptions = {
      hostname: this.proxy.hostname,
      port: parseInt(this.proxy.port, 10),
      method: 'CONNECT',
      path: `${options.hostname}:${options.port}`,
      headers: this.headers,
    };

    const proxyRequest = http.request(requestOptions);
    proxyRequest.end();

    proxyRequest.on('connect', (res, socket) => {
      if (res.statusCode === 200) {
        options.socket = socket;
        const connection = super.createConnection(options, callback);
        callback(null, connection);
      } else {
        callback(new Error(`Proxy connection failed: ${res.statusCode}`));
      }
    });

    proxyRequest.on('error', (err) => { callback(err); });
  }
}

function exampleHttpsRequest() {
  const agent = new HttpsProxyAgent('http://168.63.76.32:3128');
  https.get('https://example.com', { agent }, (res) => {
    console.log('Response received:', res.headers);
    res.pipe(process.stdout);
  });
}

export { HttpsProxyAgent, exampleHttpsRequest };
