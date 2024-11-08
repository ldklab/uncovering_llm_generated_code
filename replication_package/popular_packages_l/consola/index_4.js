class Consola {
  constructor(options = {}) {
    this.level = options.level || 3;
    this.reporters = options.reporters || [new SimpleReporter()];
    this.paused = false;
    this.mockedTypes = {};
  }

  log(logObject) {
    if (this.paused || this.level < logObject.level) return;
    this.reporters.forEach(reporter => reporter.log(logObject));
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

  async prompt(message) {
    console.log(`${message} [y/n]:`);
    return true;
  }

  wrapConsole() {
    this.originalConsoleMethods = {};
    ['log', 'info', 'warn', 'error'].forEach(key => {
      this.originalConsoleMethods[key] = console[key];
      console[key] = (...args) => this[key](args.join(' '));
    });
  }

  restoreConsole() {
    Object.keys(this.originalConsoleMethods).forEach(key => {
      console[key] = this.originalConsoleMethods[key];
    });
  }

  pauseLogs() {
    this.paused = true;
  }

  resumeLogs() {
    this.paused = false;
  }

  mockTypes(callback) {
    ['info', 'start', 'warn', 'success', 'error', 'box', 'log'].forEach(type => {
      const mockFn = callback(type, this[type]);
      this.mockedTypes[type] = mockFn;
      this[type] = mockFn || this[type];
    });
  }
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
