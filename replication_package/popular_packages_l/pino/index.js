// pino.js - A basic implementation of Pino logging

const os = require('os');

function createLogger() {
  // Base logger object with default properties
  const baseLogger = {
    level: 30, // Info level
    pid: process.pid,
    hostname: os.hostname(),
  };

  // Basic log function
  function log(level, message, additionalProps = {}) {
    const logObject = {
      ...baseLogger,
      level,
      time: Date.now(),
      msg: message,
      ...additionalProps,
    };
    console.log(JSON.stringify(logObject));
  }

  // API to log info level messages
  function info(message) {
    log(30, message);
  }

  // Method to generate child loggers
  function child(childProps) {
    return createChildLogger(childProps);
  }

  // Factory function to create child logger with additional properties
  function createChildLogger(childProps) {
    return {
      info: (message) => log(30, message, childProps),
    };
  }

  return {
    info,
    child,
  };
}

// Usage example
const logger = createLogger();
logger.info('hello world');

const child = logger.child({ a: 'property' });
child.info('hello child!');

// Exporting createLogger for external use
module.exports = createLogger;
