// index.js
class SerdeMiddleware {
  constructor(options = {}) {
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }

  applyMiddleware(request, next) {
    if (request.body) {
      request.body = this.serialize(request.body);
    }

    return next(request).then((response) => {
      if (response.body) {
        response.body = this.deserialize(response.body);
      }
      return response;
    });
  }
}

module.exports = SerdeMiddleware;

// Mock HTTP client implementation
function createMockHttpClient() {
  const middlewares = [];

  function addMiddleware(middleware) {
    middlewares.push(middleware);
  }

  function send(request) {
    return middlewares.reduce(
      (promise, middleware) => promise.then((req) => middleware(req, mockHttpCall)),
      Promise.resolve(request)
    );
  }

  return { addMiddleware, send };
}

function mockHttpCall(request) {
  return Promise.resolve({
    statusCode: 200,
    body: '{"message":"ok"}'
  });
}

// Usage example
const httpClient = createMockHttpClient();
const serdeMiddleware = new SerdeMiddleware();
httpClient.addMiddleware((req, next) => serdeMiddleware.applyMiddleware(req, next));

httpClient.send({ body: { data: 'test' } }).then((response) => {
  console.log(response.body); // Output: { message: 'ok' }
});
