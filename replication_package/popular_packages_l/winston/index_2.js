// index.js
const { createLogger, format, transports, config } = require('winston');

// Create a logger with multiple transports and handlers for errors and rejections
const logger = createLogger({
  levels: config.npm.levels,
  level: 'info',
  format: format.combine(
    format.label({ label: 'my-app' }),
    format.timestamp(),
    format.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'rejections.log' })
  ],
  exitOnError: false
});

// Define a custom transport that logs to stdout
class CustomTransport extends transports.Stream {
  constructor(opts) {
    super(opts);
    this.stream = process.stdout;
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    this.stream.write(`${info.timestamp} ${info.level}: ${info.message}\n`);
    callback();
  }
}

// Create a logger using the custom transport
const customTransportLogger = createLogger({
  transports: [
    new CustomTransport(),
    new transports.File({ filename: 'custom.log' })
  ]
});

// Log messages for demonstration
logger.info('This is an info message');
logger.error('This is an error message');
customTransportLogger.info('Custom transport logging');

// Export loggers for external usage
module.exports = { logger, customTransportLogger };
