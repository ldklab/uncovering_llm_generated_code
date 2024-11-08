// index.js

class Logger {
  constructor(output = console) {
    this.output = output;
  }

  attachTo(stack) {
    stack.add(this.middleware.bind(this), {
      step: 'initialize',
      tags: ['LOGGER_MIDDLEWARE'],
      name: 'loggerMiddleware',
      priority: 'high',
    });
  }

  async middleware(next, context) {
    return async (args) => {
      this.logRequest(args, context);
      try {
        const response = await next(args);
        this.logResponse(response, context);
        return response;
      } catch (error) {
        this.logError(error, context);
        throw error;
      }
    };
  }

  logRequest(args, context) {
    this.output.info(`Request: ${JSON.stringify(args)}`, { context });
  }

  logResponse(response, context) {
    this.output.info(`Response: ${JSON.stringify(response)}`, { context });
  }

  logError(error, context) {
    this.output.error(`Error: ${error}`, { context });
  }
}

function createLoggerMiddleware(output) {
  const logger = new Logger(output);
  return {
    applyToStack: logger.attachTo.bind(logger),
  };
}

module.exports = { createLoggerMiddleware };

// Usage Example:
// const { createLoggerMiddleware } = require('@aws-sdk/middleware-logger');
// const { Client } = require('some-aws-sdk-client');

// const client = new Client({
//   region: 'us-west-2',
// });

// client.middlewareStack.use(createLoggerMiddleware(console));
