import http from 'node:http';
import { URL } from 'node:url';

// Simple implementation of HTTP request function using Node.js
async function request(url, options = {}) {
  // Destructuring options, setting default values
  const { method = 'GET', headers = {}, body = null } = options;

  // Parsing provided URL string into a URL object
  const urlObj = new URL(url);

  // Setting up the request options
  const requestOptions = {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method,
    headers
  };

  // Returning a promise to handle asynchronous HTTP request
  return new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk)); // Collecting data chunks
      res.on('end', () => {
        // Resolving with response data
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          trailers: res.trailers,
          body: Buffer.concat(chunks) // Concatenating all chunks
        });
      });
    });

    req.on('error', reject); // Handling request errors

    if (body) {
      // Check body type and set 'Content-Type' accordingly, then send body
      if (body instanceof URLSearchParams || body instanceof String || typeof body === 'string') {
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.write(body.toString());
      } else if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      }
    }

    req.end(); // Marking request completion
  });
}

export { request };
