// pino.js - A basic implementation of a logger similar to Pino

const os = require('os');

function createLogger() {
  const baseLogger = {
    level: 30, // Default info level
    pid: process.pid,
    hostname: os.hostname(),
  };

  function log(level, message, extraProps = {}) {
    const logEntry = {
      ...baseLogger,
      level,
      time: Date.now(),
      msg: message,
      ...extraProps,
    };
    console.log(JSON.stringify(logEntry));
  }

  function info(message) {
    log(30, message);
  }

  function child(extendedProps) {
    return {
      info: (message) => log(30, message, extendedProps),
    };
  }

  return { info, child };
}

// Usage example
const logger = createLogger();
logger.info('hello world');

const childLogger = logger.child({ a: 'property' });
childLogger.info('hello child!');

// Export the createLogger function for external usage
module.exports = createLogger;
