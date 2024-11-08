const { MiddlewareStack, HttpRequest } = require("@aws-sdk/types");

class UserAgentMiddleware {
  // Constructor to set up the custom User-Agent string
  constructor(userAgentString) {
    this.userAgentString = userAgentString;
  }

  // Middleware registration function
  applyMiddleware(stack) {
    stack.add(
      // Middleware function to handle each request
      (next, context) => async (args) => {
        // Verify the input request is an HttpRequest instance
        if (!HttpRequest.isInstance(args.request)) {
          return next(args); // If not, pass the control to the next middleware
        }

        const request = args.request;
        // Add or overwrite the 'User-Agent' header in the request
        request.headers = {
          ...request.headers,
          'User-Agent': this.userAgentString,
        };

        // Move to the next middleware with the modified request
        return next({ ...args, request });
      },
      {
        step: 'build', // Define when this middleware should run
        name: 'UserAgentMiddleware', // Name the middleware
        override: true, // Allow override in case of conflicts
      }
    );
  }
}

// Usage Example
const stack = new MiddlewareStack();
const customUserAgentMiddleware = new UserAgentMiddleware("Custom/UserAgent");
customUserAgentMiddleware.applyMiddleware(stack);

async function execute() {
  const request = new HttpRequest({
    hostname: "example.com",
    method: "GET",
    headers: {},
  });

  // Resolve the middleware stack to get a usable handler
  const handler = stack.resolve((next) => (args) => {
    // Log the final User-Agent header from the processed request
    console.log("Final User-Agent:", args.request.headers["User-Agent"]);
    return Promise.resolve({ response: {} }); // Return a placeholder response
  }, {});

  // Execute the handler with the setup request
  await handler({ request });
}

execute();

module.exports = UserAgentMiddleware;
