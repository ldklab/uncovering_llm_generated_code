import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

class HttpsProxyAgent extends http.Agent {
  constructor(proxyUrl, options = {}) {
    super(options);
    this.proxy = new URL(proxyUrl);
    this.headers = options.headers || {};
  }

  createConnection(options, callback) {
    const proxyOptions = {
      hostname: this.proxy.hostname,
      port: this.proxy.port,
      method: 'CONNECT',
      path: `${options.hostname}:${options.port}`,
      headers: this.headers,
    };

    const req = http.request(proxyOptions);
    req.end();

    req.on('connect', (res, socket) => {
      if (res.statusCode === 200) {
        options.socket = socket;
        const conn = super.createConnection(options, callback);
        return callback(null, conn);
      } else {
        callback(new Error(`Proxy connection failed with status code: ${res.statusCode}`));
      }
    });

    req.on('error', callback);
  }
}

function httpsRequestExample() {
  const agent = new HttpsProxyAgent('http://168.63.76.32:3128');
  https.get('https://example.com', { agent }, (res) => {
    console.log('"response" event!', res.headers);
    res.pipe(process.stdout);
  });
}

export { HttpsProxyAgent, httpsRequestExample };
