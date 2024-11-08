// pino.js - A basic implementation of Pino logging

const os = require('os');

// Function to create a new logger
function createLogger() {
  // Define the base logger attributes
  const baseLogger = {
    level: 30, // Represents 'info' level
    pid: process.pid, // Current process ID
    hostname: os.hostname() // Current machine hostname
  };

  // Core log function
  function log(level, message, additionalProps = {}) {
    // Constructing the log object
    const logObject = {
      ...baseLogger,
      level,
      time: Date.now(), // Log timestamp
      msg: message, // Log message
      ...additionalProps
    };
    // Output the log in JSON format
    console.log(JSON.stringify(logObject));
  }

  // Public method to log 'info' level messages
  function info(message) {
    log(30, message);
  }

  // Method to create a child logger with additional properties
  function child(childProps) {
    return createChildLogger(childProps);
  }

  // Function to create and return a new child logger
  function createChildLogger(childProps) {
    return {
      info: (message) => log(30, message, childProps) // Child logger can log 'info' messages
    };
  }

  return {
    info,
    child
  };
}

// Example showing how to use the logger
const logger = createLogger();
logger.info('hello world'); // Log a simple message

const child = logger.child({ a: 'property' }); // Create a child logger with additional property
child.info('hello child!'); // Log a message using the child logger

// Export the createLogger function for external usage
module.exports = createLogger;
