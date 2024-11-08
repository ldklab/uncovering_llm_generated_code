import http from 'node:http';
import { URL } from 'node:url';

// A simple implementation of HTTP request function
async function request(url, options = {}) {
  const { method = 'GET', headers = {}, body = null } = options;
  const urlObject = new URL(url);

  const requestOptions = {
    hostname: urlObject.hostname,
    port: urlObject.port || (urlObject.protocol === 'https:' ? 443 : 80),
    path: urlObject.pathname + urlObject.search,
    method,
    headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          trailers: res.trailers,
          body: Buffer.concat(chunks)
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (body instanceof URLSearchParams || body instanceof String || typeof body === 'string') {
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.write(body.toString());
      } else if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      }
    }

    req.end();
  });
}

export { request };
