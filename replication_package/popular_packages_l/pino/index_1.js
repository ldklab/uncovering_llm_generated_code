// pino.js - A basic implementation of Pino logging

const os = require('os');

// Function to create a base logger with default properties
function createLogger() {
  const baseLogger = {
    level: 30, // Default log level set to 'info'
    pid: process.pid, // Process ID
    hostname: os.hostname(), // Host machine name
  };

  // Function to perform logging
  function log(level, message, additionalProps = {}) {
    const logObject = {
      ...baseLogger,
      level,
      time: Date.now(), // Current timestamp
      msg: message,
      ...additionalProps,
    };
    console.log(JSON.stringify(logObject)); // Print log as JSON to the console
  }

  // Method to log 'info' level messages
  function info(message) {
    log(30, message);
  }

  // Method to create child loggers with additional properties
  function child(childProps) {
    return createChildLogger(childProps);
  }

  // Function to create child logger inheriting from base logger
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

// Example usage of the logger
const logger = createLogger();
logger.info('hello world');

const childLogger = logger.child({ a: 'property' });
childLogger.info('hello child!');

// Export the 'createLogger' function for use in other modules
module.exports = createLogger;
