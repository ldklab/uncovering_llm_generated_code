const http = require('http');
const https = require('https');
const http2 = require('http2');

class NodeHttpHandler {
  constructor() {
    this.httpAgent = new http.Agent({});
    this.httpsAgent = new https.Agent({});
    this.http2SessionCache = new Map();
  }

  handle(request) {
    return new Promise((resolve, reject) => {
      const { protocol, hostname, port, path, method, headers, body } = request;
      const isSecureProtocol = protocol === 'https:' || protocol === 'https2:';
      let httpRequest;

      if (isSecureProtocol) {
        if (protocol === 'https:') {
          const options = { hostname, port, path, method, headers, agent: this.httpsAgent };
          httpRequest = https.request(options);
        } else if (protocol === 'https2:') {
          let client = this.http2SessionCache.get(hostname);
          if (!client) {
            client = http2.connect(`https://${hostname}:${port}`);
            this.http2SessionCache.set(hostname, client);
          }
          httpRequest = client.request({ ':method': method, ':path': path, ...headers });
        }
      } else {
        const options = { hostname, port, path, method, headers, agent: this.httpAgent };
        httpRequest = http.request(options);
      }

      httpRequest.on('response', (response) => {
        const data = [];
        response.on('data', (chunk) => data.push(chunk));
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(data),
          });
        });
      });

      httpRequest.on('error', (err) => reject(err));

      if (body) {
        httpRequest.write(body);
      }

      httpRequest.end();
    });
  }
}

module.exports = { NodeHttpHandler };
