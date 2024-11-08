// consola/index.js

class Consola {
  constructor(options = {}) {
    this.level = options.level ?? 3;  // Sets the logging level, default is 3
    this.reporters = options.reporters || [new SimpleReporter()];  // Array of reporter objects
    this.paused = false;  // Indicator to pause logging
    this.mockedTypes = {};  // Storage for mocked logging methods
  }

  log(logObject) {
    if (this.paused || this.level < logObject.level) return;  // Skip if paused or log level too low
    this.reporters.forEach(reporter => reporter.log(logObject));  // Send log object to all reporters
  }

  info(message) { this.log({ level: 3, type: 'info', args: [message] }); }
  start(message) { this.log({ level: 3, type: 'start', args: [message] }); }
  warn(message) { this.log({ level: 1, type: 'warn', args: [message] }); }
  success(message) { this.log({ level: 3, type: 'success', args: [message] }); }
  error(error) { this.log({ level: 0, type: 'error', args: [error] }); }
  box(message) { this.log({ level: 2, type: 'box', args: [message] }); }

  async prompt(message, options) {
    console.log(`${message} [y/n]:`);  // Simple simulation of a prompt
    return true;  // Always returns true currently, should integrate real logic with a library
  }

  wrapConsole() {
    this.originalConsoleMethods = {};
    ['log', 'info', 'warn', 'error'].forEach(key => {
      this.originalConsoleMethods[key] = console[key];
      console[key] = (...args) => this[key](args.join(' '));  // Redirect console methods to this class
    });
  }

  restoreConsole() {
    Object.keys(this.originalConsoleMethods).forEach(key => {
      console[key] = this.originalConsoleMethods[key];  // Restore original console methods
    });
  }

  pauseLogs() { this.paused = true; }
  resumeLogs() { this.paused = false; }

  mockTypes(callback) {
    ['info', 'start', 'warn', 'success', 'error', 'box', 'log'].forEach(type => {
      const mockFn = callback(type, this[type]);
      this.mockedTypes[type] = mockFn;  // Store mocked function
      this[type] = mockFn || this[type];  // Use mocked function if provided
    });
  }
}

class SimpleReporter {
  log(logObj) {
    const { type, args } = logObj;
    console[type](...args);  // Log messages to the console using appropriate type
  }
}

function createConsola(options) {
  return new Consola(options);  // Helps create a new Consola instance
}

const consola = new Consola();  // Default Consola instance

module.exports = { consola, createConsola };  // Export the default instance and factory function
