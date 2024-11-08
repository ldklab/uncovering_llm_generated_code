const { MiddlewareStack, HttpRequest } = require("@aws-sdk/types");

class UserAgentMiddleware {
  constructor(userAgentString) {
    this.userAgentString = userAgentString;
  }

  applyMiddleware(stack) {
    stack.add(
      async (next, context) => async (args) => {
        if (!HttpRequest.isInstance(args.request)) {
          return await next(args);
        }

        const request = args.request;
        request.headers = {
          ...request.headers,
          'User-Agent': this.userAgentString,
        };

        return await next({ ...args, request });
      },
      {
        step: 'build',
        name: 'UserAgentMiddleware',
        override: true,
      }
    );
  }
}

// Usage Example
const stack = new MiddlewareStack();
const customUserAgentMiddleware = new UserAgentMiddleware("Custom/UserAgent");
customUserAgentMiddleware.applyMiddleware(stack);

async function executeRequest() {
  const request = new HttpRequest({
    hostname: "example.com",
    method: "GET",
    headers: {},
  });

  const handler = stack.resolve((next) => async (args) => {
    console.log("Final User-Agent:", args.request.headers["User-Agent"]);
    return Promise.resolve({ response: {} });
  }, {});

  await handler({ request });
}

executeRequest();

module.exports = UserAgentMiddleware;
