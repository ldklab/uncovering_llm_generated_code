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

// Example of HTTP request and response handling
function mockHttpClient() {
  const middlewares = [];

  return {
    addMiddleware(middleware) {
      middlewares.push(middleware);
    },
    send(request) {
      let promiseChain = Promise.resolve(request);

      middlewares.forEach(middleware => {
        promiseChain = promiseChain.then(req => middleware(req, mockHttpCall));
      });

      return promiseChain.then(response => response);
    }
  };
}

function mockHttpCall(request) {
  return Promise.resolve({
    statusCode: 200,
    body: '{"message":"ok"}' // Mock response
  });
}

// Example usage
const httpClient = mockHttpClient();
httpClient.addMiddleware((req, next) => new SerdeMiddleware().applyMiddleware(req, next));

httpClient.send({ body: { data: 'test' } }).then(response => {
  console.log(response.body); // should print: { message: 'ok' }
});