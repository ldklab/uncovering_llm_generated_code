'use strict';

const consoleLogger = {
  type: 'logger',
  log(args) { this.output('log', args); },
  warn(args) { this.output('warn', args); },
  error(args) { this.output('error', args); },
  output(type, args) {
    if (console && console[type]) console[type].apply(console, args);
  }
};

class Logger {
  constructor(concreteLogger, options = {}) {
    this.init(concreteLogger, options);
  }
  init(concreteLogger, { prefix = 'i18next:', debug } = {}) {
    this.prefix = prefix;
    this.logger = concreteLogger || consoleLogger;
    this.debug = debug;
  }
  log(...args) { return this.forward(args, 'log', '', true); }
  warn(...args) { return this.forward(args, 'warn', '', true); }
  error(...args) { return this.forward(args, 'error', ''); }
  deprecate(...args) { return this.forward(args, 'warn', 'WARNING DEPRECATED: ', true); }
  forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return null;
    if (typeof args[0] === 'string') args[0] = `${prefix}${this.prefix} ${args[0]}`;
    return this.logger[lvl](args);
  }
  create(moduleName) {
    return new Logger(this.logger, { prefix: `${this.prefix}:${moduleName}:`, ...this.options });
  }
  clone(options) {
    return new Logger(this.logger, { ...this.options, ...options });
  }
}

class EventEmitter {
  constructor() { this.observers = {}; }
  on(events, listener) {
    events.split(' ').forEach(event => {
      if (!this.observers[event]) this.observers[event] = new Map();
      const numListeners = this.observers[event].get(listener) || 0;
      this.observers[event].set(listener, numListeners + 1);
    });
    return this;
  }
  off(event, listener) {
    if (!this.observers[event]) return;
    if (!listener) {
      delete this.observers[event];
      return;
    }
    this.observers[event].delete(listener);
  }
  emit(event, ...args) {
    if (this.observers[event]) {
      Array.from(this.observers[event].entries()).forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer(...args);
        }
      });
    }
    if (this.observers['*']) {
      Array.from(this.observers['*'].entries()).forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer.apply(observer, [event, ...args]);
        }
      });
    }
  }
}

const defer = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

const escape = str => typeof str === 'string' ? str.replace(/[&<>"'/]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' })[s]) : str;

// Basic functions for handling object paths and traversal (simplified for brevity)
// The following functions assume a simple traversal technique and manipulation of object/array paths

const getLastOfPath = (object, path, Empty) => {
  const stack = typeof path !== 'string' ? path : path.split('.');
  return stack.reduce((acc, key) => {
    if (!acc || typeof acc !== 'object') return {};
    const cleanedKey = key.replace(/###/g, '.');
    return { obj: acc, k: cleanedKey };
  }, object);
};

class ResourceStore extends EventEmitter {
  constructor(data = {}, options = { ns: ['translation'], defaultNS: 'translation' }) {
    super();
    this.data = data;
    this.options = options;
  }
  addResource(lng, ns, key, value, options = { silent: false }) {
    const path = lng.split('.');
    if (path.length > 1) {
      value = ns;
      ns = path[1];
    }
    this.data[lng] = this.data[lng] || {};
    this.data[lng][ns] = this.data[lng][ns] || {};
    this.data[lng][ns][key] = value;
    if (!options.silent) this.emit('added', lng, ns, key, value);
  }
  getResource(lng, ns, key) {
    return this.data[lng] && this.data[lng][ns] && this.data[lng][ns][key];
  }
}

const baseLogger = new Logger();

class Translator extends EventEmitter {
  constructor(services, options = {}) {
    super();
    this.services = services;
    this.options = options;
    this.logger = baseLogger.create('translator');
  }
  changeLanguage(lng) {
    if (lng) this.language = lng;
  }
  translate(key, options) {
    const path = `${options.ns}:${key}`;
    const translation = this.services.resourceStore.getResource(this.language, options.ns, key) || key;
    return translation;
  }
}

class I18n extends EventEmitter {
  constructor(options = {}, callback) {
    super();
    this.options = options;
    this.services = {};
    this.logger = baseLogger;
    this.init(callback);
  }
  init(callback = () => {}) {
    this.services.resourceStore = new ResourceStore(this.options.resources);
    this.translator = new Translator(this.services, this.options);
    this.language = this.options.lng || 'en';
    callback();
  }
  t(key, options = {}) {
    return this.translator.translate(key, options);
  }
}

module.exports = new I18n();
