'use strict';

class ConsoleLogger {
  log(type, args) {
    if (console && console[type]) console[type](...args);
  }
}

class Logger {
  constructor(logger = new ConsoleLogger(), options = {}) {
    this.prefix = options.prefix || 'i18next:';
    this.logger = logger;
    this.options = options;
    this.debug = options.debug;
  }

  _forward(args, level, prefix = '', debugOnly = false) {
    if (debugOnly && !this.debug) return;
    if (typeof args[0] === 'string') args[0] = `${prefix}${this.prefix} ${args[0]}`;
    this.logger.log(level, args);
  }

  log(...args) { this._forward(args, 'log', '', true); }
  warn(...args) { this._forward(args, 'warn', '', true); }
  error(...args) { this._forward(args, 'error'); }
  deprecate(...args) { this._forward(args, 'warn', 'WARNING DEPRECATED: ', true); }
}

class EventEmitter {
  constructor() {
    this.observers = {};
  }

  on(events, listener) {
    events.split(' ').forEach(event => {
      if (!this.observers[event]) this.observers[event] = new Set();
      this.observers[event].add(listener);
    });
    return this;
  }

  off(event, listener) {
    if (!this.observers[event]) return;
    this.observers[event].delete(listener);
  }

  emit(event, ...args) {
    if (this.observers[event]) {
      this.observers[event].forEach(listener => listener(...args));
    }
    if (this.observers['*']) {
      this.observers['*'].forEach(listener => listener(event, ...args));
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

// Utility helpers
const makeString = obj => obj == null ? '' : String(obj);
const regexEscape = str => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

// Simplified path management and object utilities
const getLastOfPath = (obj, path) => {
  const cleanKey = key => key.replace(/###/g, '.');
  const stack = typeof path === 'string' ? path.split('.') : path;
  while (stack.length > 1) {
    if (typeof obj !== 'object' || obj === null) return {};
    const key = cleanKey(stack.shift());
    if (!obj[key]) obj[key] = {};
    obj = obj[key];
  }
  const key = cleanKey(stack.shift());
  return { obj, k: key };
};

const setPath = (obj, path, value) => {
  const { obj: o, k } = getLastOfPath(obj, path);
  o[k] = value;
};

const getPath = (obj, path) => {
  const { obj: o, k } = getLastOfPath(obj, path);
  return o ? o[k] : undefined;
};

class ResourceStore {
  constructor(data = {}, options = {}) {
    this.data = data;
    this.options = { ns: ['translation'], defaultNS: 'translation', ...options };
  }

  addResource(lng, ns, key, value) {
    const path = [lng, ns].concat(this.options.keySeparator ? key.split(this.options.keySeparator) : key);
    setPath(this.data, path, value);
  }

  getResource(lng, ns, key) {
    const path = [lng, ns].concat(this.options.keySeparator ? key.split(this.options.keySeparator) : key);
    const res = getPath(this.data, path);
    if (res) return res;
    const resolvePath = typeof key === 'string' ? key.split(this.options.keySeparator || '.') : key;
    let current = this.data[lng] && this.data[lng][ns];
    for (let part of resolvePath) {
      if (current && typeof current === 'object' && current.hasOwnProperty(part)) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
}

class I18n extends EventEmitter {
  constructor(options = {}, callback) {
    super();
    this.options = { ...this.defaults, ...options };
    this.logger = new Logger();
    this.store = new ResourceStore(options.resources, options);
    this.language = this.options.lng || 'en';

    if (callback) {
      this.init(callback);
    }
  }

  // Default initialization options
  get defaults() {
    return {
      debug: false,
      fallbackLng: 'dev',
      ns: ['translation'],
      defaultNS: 'translation',
      keySeparator: '.',
      initImmediate: true,
      detectLngQS: 'lng',
      fallbackLng: 'en'
    };
  }

  init(callback) {
    this.emit('initialized', this.options);
    callback(null, this.t.bind(this));
  }

  t(key, opts) {
    const { lng, ns = this.options.defaultNS } = opts || {};
    const language = lng || this.language;
    return this.store.getResource(language, ns, key) || key;
  }
}

module.exports = new I18n();
