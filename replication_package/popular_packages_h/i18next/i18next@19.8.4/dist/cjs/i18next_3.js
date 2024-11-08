'use strict';

const { EventEmitter } = require('events');
const cloneDeep = require('lodash/cloneDeep');

class Logger {
  constructor(prefix = 'i18next:') {
    this.prefix = prefix;
    this.debug = false;
  }

  setDebug(debug) {
    this.debug = debug;
  }

  log(...args) {
    this.output('log', args);
  }

  warn(...args) {
    this.output('warn', args);
  }

  error(...args) {
    this.output('error', args);
  }

  output(type, args) {
    if (console && console[type]) {
      const message = typeof args[0] === 'string' 
        ? `${this.prefix} ${args[0]}` 
        : args;
      console[type](message, ...args.slice(1));
    }
  }
}

class SimpleEventEmitter {
  constructor() {
    this.observers = {};
  }

  on(events, listener) {
    events.split(' ').forEach(event => {
      this.observers[event] = this.observers[event] || [];
      this.observers[event].push(listener);
    });
    return this;
  }

  off(event, listener) {
    if (!this.observers[event]) return;
    if (!listener) {
      delete this.observers[event];
      return;
    }
    this.observers[event] = this.observers[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (this.observers[event]) {
      this.observers[event].forEach(observer => observer(...args));
    }
    if (this.observers['*']) {
      this.observers['*'].forEach(observer => observer(event, ...args));
    }
  }
}

class ResourceStore extends SimpleEventEmitter {
  constructor(data = {}) {
    super();
    this.data = data;
    this.options = { ns: ['translation'], defaultNS: 'translation' };
  }
  
  addResource(lng, ns, key, value) {
    const path = [lng, ns, ...key.split('.')];
    let current = this.data;
    path.forEach((part, index) => {
      if (index === path.length - 1) {
        current[part] = value;
      } else {
        current = current[part] = current[part] || {};
      }
    });
    this.emit('added', lng, ns, key, value);
  }

  getResource(lng, ns, key) {
    const path = [lng, ns, ...key.split('.')];
    let current = this.data;
    for (let segment of path) {
      if (!(segment in current)) return undefined;
      current = current[segment];
    }
    return current;
  }
}

class I18n {
  constructor(options = {}) {
    this.options = options;
    this.logger = new Logger(this.options.loggerPrefix);
    this.resources = new ResourceStore(this.options.resources);
    this.emitter = new SimpleEventEmitter();
  }

  init(callback) {
    if (typeof callback === 'function') callback(null, this.t.bind(this));
  }

  t(key, options = {}) {
    const lang = options.lng || this.options.lng || 'en';
    const ns = options.ns || this.options.defaultNS || 'translation';
    const res = this.resources.getResource(lang, ns, key);
    return res || key;
  }

  loadResources(lng, ns, callback) {
    // Simulated resource loading
    setTimeout(() => {
      this.resources.addResource(lng, ns, 'welcome', 'Welcome');
      callback();
    }, 100);
  }
}

const i18next = new I18n({
  resources: {
    en: { translation: { greeting: 'Hello!' } }
  },
  loggerPrefix: 'i18n:'
});

module.exports = i18next;
