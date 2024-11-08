// Import required modules
const http = require('http');
const https = require('https');
const { URL } = require('url');

// HttpsProxyAgent class definition
class HttpsProxyAgent extends http.Agent {
  constructor(proxyUrl, options = {}) {
    super(options);
    this.proxy = new URL(proxyUrl);
    this.headers = options.headers || {};
  }

  // Method to handle connection via proxy
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

    req.on('connect', (res, socket, head) => {
      if (res.statusCode === 200) {
        options.socket = socket;
        const conn = super.createConnection(options, callback);
        callback(null, conn);
      } else {
        callback(new Error(`Proxy connection failed with status code: ${res.statusCode}`));
      }
    });

    req.on('error', err => callback(err));
  }
}

// Usage example: HTTPS request via HTTPS proxy
function httpsRequestExample() {
  const agent = new HttpsProxyAgent('http://168.63.76.32:3128');
  https.get('https://example.com', { agent }, (res) => {
    console.log('"response" event!', res.headers);
    res.pipe(process.stdout);
  });
}

// Exporting the HttpsProxyAgent and examples for use in other modules
module.exports = { HttpsProxyAgent, httpsRequestExample };
