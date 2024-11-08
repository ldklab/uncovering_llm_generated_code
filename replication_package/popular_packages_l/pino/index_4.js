const os = require('os');

function createLogger() {
  const baseLogger = {
    level: 30,
    pid: process.pid,
    hostname: os.hostname(),
  };

  function log(level, message, additionalProps = {}) {
    const logEntry = {
      ...baseLogger,
      level,
      time: Date.now(),
      msg: message,
      ...additionalProps,
    };
    console.log(JSON.stringify(logEntry));
  }

  function info(message) {
    log(30, message);
  }

  function child(childProps) {
    return createChildLogger(childProps);
  }

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

const logger = createLogger();
logger.info('hello world');

const child = logger.child({ a: 'property' });
child.info('hello child!');

module.exports = createLogger;
