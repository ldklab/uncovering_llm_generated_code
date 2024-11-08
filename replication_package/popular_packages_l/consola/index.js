markdown
# consola/index.js

class Consola {
  constructor(options = {}) {
    this.level = options.level ?? 3;
    // Additional default settings can go here
    this.reporters = options.reporters || [new SimpleReporter()];
    this.paused = false;
    this.mockedTypes = {};
  }

  log(logObject) {
    if (this.paused || this.level < logObject.level) return;
    for (const reporter of this.reporters) {
      reporter.log(logObject);
    }
  }

  info(message) {
    this.log({ level: 3, type: 'info', args: [message] });
  }
  
  start(message) {
    this.log({ level: 3, type: 'start', args: [message] });
  }

  warn(message) {
    this.log({ level: 1, type: 'warn', args: [message] });
  }

  success(message) {
    this.log({ level: 3, type: 'success', args: [message] });
  }

  error(error) {
    this.log({ level: 0, type: 'error', args: [error] });
  }

  box(message) {
    this.log({ level: 2, type: 'box', args: [message] });
  }

  async prompt(message, options) {
    // Simplified prompt logic here
    // This should be a Call to an interactive CLI library for real prompts
    console.log(`${message} [y/n]:`);
    return true; // Dummy return
  }

  wrapConsole() {
    this.originalConsoleMethods = {};
    for (const key of ['log', 'info', 'warn', 'error']) {
      this.originalConsoleMethods[key] = console[key];
      console[key] = (...args) => this[key](args.join(' '));
    }
  }

  restoreConsole() {
    for (const key of Object.keys(this.originalConsoleMethods)) {
      console[key] = this.originalConsoleMethods[key];
    }
  }

  pauseLogs() {
    this.paused = true;
  }

  resumeLogs() {
    this.paused = false;
  }

  mockTypes(callback) {
    for (const type of ['info', 'start', 'warn', 'success', 'error', 'box', 'log']) {
      const mockFn = callback(type, this[type]);
      this.mockedTypes[type] = mockFn;
      this[type] = mockFn || this[type];
    }
  }
  
  // Additional methods can be added based on the README
}

class SimpleReporter {
  log(logObj) {
    const { type, args } = logObj;
    console[type](...args);
  }
}

function createConsola(options) {
  return new Consola(options);
}

const consola = new Consola();

module.exports = { consola, createConsola };
