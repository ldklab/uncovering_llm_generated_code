// index.js
class SerdeMiddleware {
  constructor(options = {}) {
    // Setup serialization and deserialization methods with defaults
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }

  applyMiddleware(request, next) {
    // Serialize the request body if it exists
    if (request.body) {
      request.body = this.serialize(request.body);
    }

    // Pass request to the next middleware or final handler and handle the response
    return next(request).then((response) => {
      // Deserialize the response body if it exists
      if (response.body) {
        response.body = this.deserialize(response.body);
      }
      return response;
    });
  }
}

module.exports = SerdeMiddleware;

// Usage example
function mockHttpClient() {
  const middlewares = [];

  return {
    // Add middleware to the processing chain
    addMiddleware(middleware) {
      middlewares.push(middleware);
    },
    // Send request through the middleware chain to a mock HTTP call
    send(request) {
      let promiseChain = Promise.resolve(request);

      // Build the chain of middleware calls
      middlewares.forEach(middleware => {
        promiseChain = promiseChain.then(req => middleware(req, mockHttpCall));
      });

      return promiseChain.then(response => response);
    }
  };
}

// Mock HTTP call to simulate sending a request and receiving a response
function mockHttpCall(request) {
  return Promise.resolve({
    statusCode: 200,
    body: '{"message":"ok"}' // Simulated JSON response body
  });
}

// Example code using the mock HTTP client with a middleware
const httpClient = mockHttpClient();
httpClient.addMiddleware((req, next) => new SerdeMiddleware().applyMiddleware(req, next));

// Send a test request and log the deserialized response body
httpClient.send({ body: { data: 'test' } }).then(response => {
  console.log(response.body); // Logs the deserialized object: { message: 'ok' }
});
