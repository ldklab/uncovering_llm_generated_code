import http from 'node:http';
import { URL } from 'node:url';

// A simple HTTP request function mimicking the undici library
async function request(url, options = {}) {
  const { method = 'GET', headers = {}, body = null } = options;
  const urlObj = new URL(url);

  const requestOptions = {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method,
    headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      const dataChunks = [];
      res.on('data', (chunk) => dataChunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          trailers: res.trailers,
          body: Buffer.concat(dataChunks)
        });
      });
    });

    req.on('error', reject);

    if (body) {
      let contentType = '';
      if (body instanceof URLSearchParams || body instanceof String || typeof body === 'string') {
        contentType = 'application/x-www-form-urlencoded';
        req.setHeader('Content-Type', contentType);
        req.write(body.toString());
      } else if (typeof body === 'object') {
        contentType = 'application/json';
        req.setHeader('Content-Type', contentType);
        req.write(JSON.stringify(body));
      }
    }

    req.end();
  });
}

export { request };
