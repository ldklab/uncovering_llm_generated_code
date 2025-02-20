const http = require('http');
const https = require('https');
const http2 = require('http2');

class NodeHttpHandler {
  constructor() {
    // Initialize HTTP and HTTPS agents
    this.httpAgent = new http.Agent({});
    this.httpsAgent = new https.Agent({});
    // Maintain a cache for HTTP/2 sessions
    this.http2SessionCache = new Map();
  }

  handle(request) {
    return new Promise((resolve, reject) => {
      // Destructure request properties
      const { protocol, hostname, port, path, method, headers, body } = request;
      // Determine if the protocol is HTTPS
      const isSecureProtocol = /^https/.test(protocol);
      let httpRequest;
      
      // Handling based on protocol type
      if (isSecureProtocol) {
        if (protocol === 'https:') {
          // Setup options for HTTPS request
          const options = {
            hostname, port, path, method, headers,
            agent: this.httpsAgent
          };
          httpRequest = https.request(options);
        } else if (protocol === 'https2:') {
          // HTTP/2 request - check if session exists
          let client = this.http2SessionCache.get(hostname);
          // If not, establish a new HTTP/2 connection
          if (!client) {
            client = http2.connect(`${protocol}//${hostname}:${port}`);
            this.http2SessionCache.set(hostname, client);
          }
          httpRequest = client.request({ ':method': method, ':path': path, ...headers });
        }
      } else {
        // Setup options for HTTP request
        const options = {
          hostname, port, path, method, headers,
          agent: this.httpAgent
        };
        httpRequest = http.request(options);
      }

      // Handle response data
      httpRequest.on('response', (response) => {
        const data = [];
        // Collect response data
        response.on('data', chunk => data.push(chunk));
        // When finished, resolve with the response details
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(data)
          });
        });
      });

      // Handle request errors
      httpRequest.on('error', (err) => {
        reject(err);
      });

      // Write body data if present
      if (body) {
        httpRequest.write(body);
      }
      
      // Signal end of request
      httpRequest.end();
    });
  }
}

module.exports = { NodeHttpHandler };
