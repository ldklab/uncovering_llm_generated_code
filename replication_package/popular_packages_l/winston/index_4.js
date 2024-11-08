const { createLogger, format, transports } = require('winston');

// Configure primary logger
const logger = createLogger({
  levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 },
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

// Define custom transport
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

// Configure custom transport logger
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

// Export loggers
module.exports = { logger, customTransportLogger };
