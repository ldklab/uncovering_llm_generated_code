// index.js
const { createLogger, format, transports, config } = require('winston');

// Create a generic logger with winston
const logger = createLogger({
  levels: config.npm.levels,  // Define severity levels
  level: 'info',              // Default log level
  format: format.combine(
    format.label({ label: 'my-app' }),        // Label each log message
    format.timestamp(),                       // Add timestamp
    format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;  // Define log message format
    })
  ),
  transports: [
    new transports.Console(),                      // Output logs to the console
    new transports.File({ filename: 'error.log', level: 'error' }),  // Log error levels to file
    new transports.File({ filename: 'combined.log' })  // Log all levels to a combined file
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })  // Handle uncaught exceptions
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'rejections.log' })  // Handle unhandled promise rejections
  ],
  exitOnError: false  // Prevent exit on error
});

// Custom transport class to demonstrate additional logging methods
class CustomTransport extends transports.Stream {
  constructor(opts) {
    super(opts);
    this.stream = process.stdout;  // Use standard output stream for logging
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));  // Async operation for logging
    this.stream.write(`${info.timestamp} ${info.level}: ${info.message}\n`);  // Write output
    callback();  // Complete the log
  }
}

// Custom logger with the custom transport
const customTransportLogger = createLogger({
  transports: [
    new CustomTransport(),                   // Use the custom transport
    new transports.File({ filename: 'custom.log' })  // Additionally log to a file
  ]
});

// Log messages with different loggers
logger.info('This is an info message');
logger.error('This is an error message');
customTransportLogger.info('Custom transport logging');

// Export loggers for use in other parts of the application
module.exports = { logger, customTransportLogger };
