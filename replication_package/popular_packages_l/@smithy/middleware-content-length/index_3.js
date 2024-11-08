const http = require('http');

/**
 * Middleware function to calculate and set the Content-Length header for HTTP requests.
 * @param {Object} request - The HTTP request object
 * @param {Function} next - The next middleware function in the stack
 */
function contentLengthMiddleware(request, next) {
  if (request.body && !request.headers['Content-Length']) {
    let bodyBuffer;
    if (Buffer.isBuffer(request.body)) {
      bodyBuffer = request.body;
    } else if (typeof request.body === 'string') {
      bodyBuffer = Buffer.from(request.body, 'utf-8');
    } else if (typeof request.body.pipe !== 'function') {
      bodyBuffer = Buffer.from(JSON.stringify(request.body), 'utf-8');
    } else {
      throw new Error('Stream body not supported in this simple middleware implementation.');
    }

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
