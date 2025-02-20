const http = require('http');
const https = require('https');
const http2 = require('http2');

// This class, `NodeHttpHandler`, acts as a handler for making HTTP, HTTPS, and HTTP/2 requests.
class NodeHttpHandler {
  constructor() {
    // Initialize HTTP and HTTPS agents for connection pooling and keep-alive management.
    this.httpAgent = new http.Agent({});
    this.httpsAgent = new https.Agent({});
    // Create a cache for managing HTTP/2 sessions to reuse them across requests to the same hostname.
    this.http2SessionCache = new Map();
  }

  // The `handle` function executes the incoming `request`, determines the protocol, and makes the appropriate network request.
  handle(request) {
    return new Promise((resolve, reject) => {
      // Destructure relevant fields from the `request` to construct the options for the network call.
      let { protocol, hostname, port, path, method, headers, body } = request;
      const isSecureProtocol = /^https/.test(protocol);
      let httpRequest;
      
      // Determine if the protocol is HTTPS or HTTP/2, else default to HTTP.
      if (isSecureProtocol) {
        // Handle HTTPS requests.
        if (protocol === 'https:') {
          const options = {
            hostname, port, path, method, headers,
            agent: this.httpsAgent
          };
          // Instantiate an HTTPS request using provided options.
          httpRequest = https.request(options);
        } else if (protocol === 'https2:') {
          // Handle HTTP/2 requests, manage HTTP/2 sessions for each hostname.
          let client = this.http2SessionCache.get(hostname);
          if (!client) {
            // Establish a new HTTP/2 connection if none exists in the cache.
            client = http2.connect(`${protocol}//${hostname}:${port}`);
            this.http2SessionCache.set(hostname, client);
          }
          // Prepare a request through HTTP/2 connection.
          httpRequest = client.request({ ':method': method, ':path': path, ...headers });
        }
      } else {
        // Handle HTTP requests with a different set of options.
        const options = {
          hostname, port, path, method, headers,
          agent: this.httpAgent
        };
        // Instantiate an HTTP request using the specified options.
        httpRequest = http.request(options);
      }

      // Listen for the response event, gather the response data, and resolve the Promise.
      httpRequest.on('response', (response) => {
        const data = [];
        response.on('data', chunk => data.push(chunk));
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(data)
          });
        });
      });

      // Listen for any errors and reject the Promise.
      httpRequest.on('error', (err) => {
        reject(err);
      });

      // If there is a body provided, write it to the request.
      if (body) {
        httpRequest.write(body);
      }
      
      // End the request, notifying that no more data will be sent.
      httpRequest.end();
    });
  }
}

// Export `NodeHttpHandler` as a module for use in other files.
module.exports = { NodeHttpHandler };
