const http = require('http');

/**
 * Middleware function to calculate and set the Content-Length header for HTTP requests.
 * @param {Object} request - The HTTP request object
 * @param {Function} next - The next middleware function in the stack
 */
function contentLengthMiddleware(request, next) {
  if (request.body && !request.headers['Content-Length']) {
    let bodyBuffer = Buffer.isBuffer(request.body) 
      ? request.body 
      : Buffer.from(typeof request.body === 'string' ? request.body : JSON.stringify(request.body), 'utf-8');

    request.headers['Content-Length'] = bodyBuffer.length;
  }
  next();
}

// Example usage of the middleware
const request = {
  method: 'POST',
  headers: {},
  body: JSON.stringify({ name: 'John Doe' })
};

const next = () => {
  const options = {
    method: request.method,
    headers: request.headers,
  };

  const req = http.request('http://example.com', options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(request.body);
  req.end();
};

contentLengthMiddleware(request, next);
