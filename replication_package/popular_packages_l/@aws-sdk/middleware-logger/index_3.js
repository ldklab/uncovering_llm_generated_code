// index.js

class LoggerMiddleware {
  constructor(logger = console) {
    this.logger = logger;
  }

  applyMiddlewareToStack(stack) {
    stack.add(this.loggerMiddleware.bind(this), {
      step: 'initialize',
      tags: ['LOGGER_MIDDLEWARE'],
      name: 'loggerMiddleware',
      priority: 'high',
    });
  }

  async loggerMiddleware(next, context) {
    return async (args) => {
      this.logRequest(args, context);
      try {
        const result = await next(args);
        this.logResponse(result, context);
        return result;
      } catch (err) {
        this.logError(err, context);
        throw err;
      }
    };
  }

  logRequest(args, context) {
    this.logger.info(`Request: ${JSON.stringify(args)}`, { context });
  }

  logResponse(result, context) {
    this.logger.info(`Response: ${JSON.stringify(result)}`, { context });
  }

  logError(error, context) {
    this.logger.error(`Error: ${error}`, { context });
  }
}

function getLoggerMiddleware(logger) {
  const loggerMiddleware = new LoggerMiddleware(logger);
  return {
    applyToStack: loggerMiddleware.applyMiddlewareToStack.bind(loggerMiddleware),
  };
}

module.exports = { getLoggerMiddleware };

// Usage Example:
// const { getLoggerMiddleware } = require('@aws-sdk/middleware-logger');
// const { Client } = require('some-aws-sdk-client');

// const client = new Client({
//   region: 'us-west-2',
// });

// client.middlewareStack.use(getLoggerMiddleware(console));
