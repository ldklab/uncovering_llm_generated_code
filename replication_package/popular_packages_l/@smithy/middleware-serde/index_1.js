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

// Usage example
function mockHttpClient() {
  const middlewares = [];

  return {
    addMiddleware(middleware) {
      middlewares.push(middleware);
    },
    send(request) {
      return middlewares.reduce(
        (chain, middleware) => chain.then(req => middleware(req, mockHttpCall)),
        Promise.resolve(request)
      ).then(response => response);
    }
  };
}

function mockHttpCall(request) {
  return Promise.resolve({
    statusCode: 200,
    body: '{"message":"ok"}'
  });
}

// Example usage
const httpClient = mockHttpClient();
httpClient.addMiddleware((req, next) => new SerdeMiddleware().applyMiddleware(req, next));

httpClient.send({ body: { data: 'test' } }).then(response => {
  console.log(response.body); // should print: { message: 'ok' }
});
