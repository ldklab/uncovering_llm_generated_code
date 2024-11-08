// index.js
const { createLogger, format, transports, config } = require('winston');

const logger = createLogger({
  levels: config.npm.levels,
  level: 'info',
  format: format.combine(
    format.label({ label: 'my-app' }),
    format.timestamp(),
    format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
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

// Add a custom transport for demonstration
class CustomTransport extends transports.Stream {
  constructor(opts) {
    super(opts);
    this.stream = process.stdout; // Just logging to stdout for this example
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    this.stream.write(`${info.timestamp} ${info.level}: ${info.message}\n`);
    callback();
  }
}

// Usage example
const customTransportLogger = createLogger({
  transports: [
    new CustomTransport(),
    new transports.File({ filename: 'custom.log' })
  ]
});

logger.info('This is an info message');
logger.error('This is an error message');
customTransportLogger.info('Custom transport logging');

// Export logger for use in other modules/files
module.exports = { logger, customTransportLogger };
