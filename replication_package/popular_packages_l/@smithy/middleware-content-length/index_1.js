const http = require('http');

/**
 * Middleware function that calculates and sets the Content-Length header
 * for HTTP requests based on the request body.
 * @param {Object} request - The HTTP request object.
 * @param {Function} next - The next middleware function to invoke.
 */
function contentLengthMiddleware(request, next) {
  if (request.body && !request.headers['Content-Length']) {
    let bodyBuffer;

    if (Buffer.isBuffer(request.body)) {
      bodyBuffer = request.body;
    } else if (typeof request.body === 'string') {
      bodyBuffer = Buffer.from(request.body, 'utf-8');
    } else if (typeof request.body.pipe === 'function') {
      throw new Error('Stream body not supported in this simple middleware implementation.');
    } else {
      bodyBuffer = Buffer.from(JSON.stringify(request.body), 'utf-8');
    }

    request.headers['Content-Length'] = bodyBuffer.length;
  }

  next();
}

// Example of how the middleware can be used
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