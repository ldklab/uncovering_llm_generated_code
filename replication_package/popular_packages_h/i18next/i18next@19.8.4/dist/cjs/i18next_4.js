'use strict';

const { EventEmitter } = require('events');
const _typeof = require('@babel/runtime/helpers/typeof').default;
const _objectSpread = require('@babel/runtime/helpers/objectSpread').default;
const _classCallCheck = require('@babel/runtime/helpers/classCallCheck').default;
const _createClass = require('@babel/runtime/helpers/createClass').default;
const _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn').default;
const _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf').default;
const _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized').default;
const _inherits = require('@babel/runtime/helpers/inherits').default;

const consoleLogger = {
  type: 'logger',
  log(args) {
    this.output('log', args);
  },
  warn(args) {
    this.output('warn', args);
  },
  error(args) {
    this.output('error', args);
  },
  output(type, args) {
    if (console && console[type]) console[type].apply(console, args);
  }
};

class Logger {
  constructor(concreteLogger, options = {}) {
    _classCallCheck(this, Logger);
    this.init(concreteLogger, options);
  }

  init(concreteLogger, options = {}) {
    this.prefix = options.prefix || 'i18next:';
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug;
  }

  setDebug(bool) {
    this.debug = bool;
  }

  log(...args) {
    return this.forward(args, 'log', '', true);
  }

  warn(...args) {
    return this.forward(args, 'warn', '', true);
  }

  error(...args) {
    return this.forward(args, 'error', '');
  }

  deprecate(...args) {
    return this.forward(args, 'warn', 'WARNING DEPRECATED: ', true);
  }

  forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return null;
    if (typeof args[0] === 'string') args[0] = `${prefix}${this.prefix} ${args[0]}`;
    return this.logger[lvl](args);
  }

  create(moduleName) {
    return new Logger(this.logger, _objectSpread({ prefix: `${this.prefix}:${moduleName}:` }, this.options));
  }
}

class CustomEventEmitter extends EventEmitter {
  constructor() {
    super();
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
      [...this.observers[event]].forEach(observer => observer(...args));
    }
    if (this.observers['*']) {
      [...this.observers['*']].forEach(observer => observer(event, ...args));
    }
  }
}

const defer = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

const makeString = obj => obj == null ? '' : '' + obj;

const copy = (a, s, t) => {
  a.forEach(m => {
    if (s[m]) t[m] = s[m];
  });
};

const getLastOfPath = (object, path, Empty) => {
  const stack = typeof path !== 'string' ? [].concat(path) : path.split('.');
  while (stack.length > 1) {
    if (!object || typeof object === 'string') return {};
    const key = stack.shift().replace(/###/g, '.');
    if (!object[key] && Empty) object[key] = new Empty();
    object = object[key];
  }
  if (!object || typeof object === 'string') return {};
  return { obj: object, k: stack.shift().replace(/###/g, '.') };
};

const setPath = (object, path, newValue) => {
  const { obj, k } = getLastOfPath(object, path, Object);
  obj[k] = newValue;
};

const regexEscape = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

const escape = data => typeof data === 'string' ? data.replace(/[&<>"'\/]/g, s => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}[s])) : data;

class ResourceStore extends CustomEventEmitter {
  constructor(data, options = { ns: ['translation'], defaultNS: 'translation' }) {
    super();
    this.data = data || {};
    this.options = options;
    if (isIE10) {
      CustomEventEmitter.call(_assertThisInitialized(this));
    }
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = '.';
    }
  }

  addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  }

  removeNamespaces(ns) {
    const index = this.options.ns.indexOf(ns);
    if (index > -1) {
      this.options.ns.splice(index, 1);
    }
  }

  getResource(lng, ns, key, options = {}) {
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    let path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
    return getPath(this.data, path);
  }

  addResource(lng, ns, key, value, options = { silent: false }) {
    let path = [lng, ns];
    if (key) path = path.concat(this.options.keySeparator ? key.split(this.options.keySeparator) : key);
    this.addNamespaces(ns);
    setPath(this.data, path, value);
    if (!options.silent) this.emit('added', lng, ns, key, value);
  }
}

class Translator extends CustomEventEmitter {
  constructor(services, options = {}) {
    super();
    this.services = services;
    this.options = options;
    if (isIE10) {
      CustomEventEmitter.call(_assertThisInitialized(this));
    }
    copy(['resourceStore', 'languageUtils', 'pluralResolver', 'interpolator', 'backendConnector', 'i18nFormat', 'utils'], services, _assertThisInitialized(this));
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = '.';
    }
    this.logger = baseLogger.create('translator');
  }

  changeLanguage(lng) {
    if (lng) this.language = lng;
  }

  exists(key, options = { interpolation: {} }) {
    return this.resolve(key, options).res !== undefined;
  }

  translate(keys, options = {}, lastKey) {
    if (_typeof(options) !== 'object' && this.options.overloadTranslationOptionHandler) {
      options = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (!options) options = {};
    if (keys === undefined || keys === null) return '';
    if (!Array.isArray(keys)) keys = [String(keys)];

    const { key, namespaces } = this.extractFromKey(keys[keys.length - 1], options);
    const namespace = namespaces[namespaces.length - 1];
    const lng = options.lng || this.language;
    const appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;

    if (lng && lng.toLowerCase() === 'cimode') {
      return appendNamespaceToCIMode ? `${namespace}:${key}` : key;
    }

    const resolved = this.resolve(keys, options);
    let res = resolved && resolved.res;
    const resUsedKey = resolved && resolved.usedKey || key;
    
    if (!this.isValidLookup(res)) {
      res = key;
    }
    return res;
  }

  resolve(keys, options = {}) {
    const found = undefined;
    let usedKey, exactUsedKey, usedLng, usedNS;
    if (typeof keys === 'string') keys = [keys];
    keys.forEach(k => {
      if (this.isValidLookup(found)) return;
      const extracted = this.extractFromKey(k, options);
      const key = extracted.key;
      usedKey = key;
      const namespaces = extracted.namespaces;
      if (!options.lngs) options.lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);

      namespaces.forEach(ns => {
        if (this.isValidLookup(found)) return;
        usedNS = ns;
      });
    });
    return { res: found, usedKey: usedKey, exactUsedKey: exactUsedKey, usedLng: usedLng, usedNS: usedNS };
  }

  isValidLookup(res) {
    return res !== undefined && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === '');
  }
}

class LanguageUtil {
  constructor(options) {
    this.options = options;
    this.whitelist = this.options.supportedLngs || false;
    this.supportedLngs = this.options.supportedLngs || false;
    this.logger = baseLogger.create('languageUtils');
  }
}

class Connector extends CustomEventEmitter {
  constructor(backend, store, services, options = {}) {
    super();
    this.backend = backend;
    this.store = store;
    this.services = services;
    this.languageUtils = services.languageUtils;
    this.options = options;
    this.logger = baseLogger.create('backendConnector');
    this.state = {};
    this.queue = [];
    if (this.backend && this.backend.init) {
      this.backend.init(services, options.backend, options);
    }
  }

  queueLoad(languages, namespaces, options, callback) {
    const toLoad = [];
    const pending = [];
    languages.forEach(lng => {
      namespaces.forEach(ns => {
        const name = `${lng}|${ns}`;
        if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
          this.state[name] = 2;
        } else if (this.state[name] < 0) {
        } else if (this.state[name] === 1) {
          if (pending.indexOf(name) < 0) pending.push(name);
        } else {
          this.state[name] = 1;
          if (pending.indexOf(name) < 0) pending.push(name);
          if (toLoad.indexOf(name) < 0) toLoad.push(name);
        }
      });
    });

    if (toLoad.length || pending.length) {
      this.queue.push({
        pending: pending,
        callback: callback
      });
    }

    return { toLoad, pending };
  }

  loaded(name, err, data) {
    const [lng, ns] = name.split('|');
    if (err) this.emit('failedLoading', lng, ns, err);
    if (data) {
      this.store.addResourceBundle(lng, ns, data);
    }
    this.state[name] = err ? -1 : 2;
    const loaded = {};
    this.queue.forEach(q => {
      remove(q.pending, name);
      if (q.pending.length === 0 && !q.done) {
        Object.assign(loaded, q.loaded);
        q.done = true;
        q.callback(q.errors.length ? q.errors : undefined);
      }
    });
    this.emit('loaded', loaded);
    this.queue = this.queue.filter(q => !q.done);
  }

  read(lng, ns, fcName, tried = 0, wait = 350, callback) {
    if (!lng.length) return callback(null, {});
    return this.backend[fcName](lng, ns, (err, data) => {
      if (err && data && tried < 5) {
        setTimeout(() => {
          this.read(lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    });
  }

  prepareLoading(languages, namespaces, options = {}, callback) {
    if (!this.backend) {
      this.logger.warn('No backend was added, will not load resources.');
      return callback && callback();
    }
    if (typeof languages === 'string') languages = this.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];
    const toLoad = this.queueLoad(languages, namespaces, options, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length) callback();
      return null;
    }
    toLoad.toLoad.forEach(name => {
      this.loadOne(name);
    });
  }

  loadOne(name) {
    const [lng, ns] = name.split('|');
    this.read(lng, ns, 'read', undefined, undefined, (err, data) => {
      if (err) this.logger.warn(`loading namespace ${ns} for language ${lng} failed`, err);
      if (!err && data) this.logger.log(`loaded namespace ${ns} for language ${lng}`, data);
      this.loaded(name, err, data);
    });
  }
}

const i18next = new (class extends EventEmitter {
  constructor() {
    super();
    this.options = transformOptions(get());
    this.modules = { external: [] };
    this.logger = baseLogger;
    this.services = {};
  }

  init(options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    this.options = _objectSpread({}, get(), this.options, transformOptions(options));
    this.format = this.options.interpolation.format;

    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(new this.modules.logger(), this.options);
      } else {
        baseLogger.init(null, this.options);
      }
      const lu = new LanguageUtil(this.options);
      this.store = new ResourceStore(this.options.resources, this.options);
      const s = this.services;
      s.logger = baseLogger;
      s.resourceStore = this.store;
      s.languageUtils = lu;
      s.pluralResolver = new PluralResolver(lu, {
        prepend: this.options.pluralSeparator,
        compatibilityJSON: this.options.compatibilityJSON
      });
      s.interpolator = new Interpolator(this.options);
      s.utils = { hasLoadedNamespace: this.hasLoadedNamespace.bind(this) };
      s.backendConnector = new Connector(
        new this.modules.backend(),
        s.resourceStore,
        s,
        this.options
      );
      this.translator = new Translator(s, this.options);
      this.translator.on('*', (event, ...args) => {
        this.emit(event, ...args);
      });
      this.modules.external.forEach(m => {
        if (m.init) m.init(this);
      });
    }
    this.load(this.options.lng, callback);

    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1);
    });
  }

  use(module) {
    if (!module) throw new Error('You are passing an undefined module! Please check the object you are passing to i18next.use()');
    if (!module.type) throw new Error('You are passing a wrong module! Please check the object you are passing to i18next.use()');
    if (module.type === 'backend') this.modules.backend = module;
    if (module.type === 'logger' || (module.log && module.warn && module.error)) this.modules.logger = module;
    if (module.type === 'languageDetector') this.modules.languageDetector = module;
    this.modules.external.push(module);
    return this;
  }

  load(lng, callback) {
    const languageUtils = this.services.languageUtils;
    const lu = languageUtils.toResolveHierarchy(lng || this.language);
    this.modules.backendConnector.load(lu, this.options.ns, (err) => {
      if (callback) callback(err);
    });
  }

  t(...args) {
    return this.translator.translate(...args);
  }

  hasLoadedNamespace(ns, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('i18next not initialized', this.languages);
      return false;
    }

    const loadNotPending = (l, n) => {
      const loadState = this.services.backendConnector.state[`${l}|${n}`];
      return loadState === -1 || loadState === 2;
    };

    if (options.precheck) {
      const preResult = options.precheck(this, loadNotPending);
      if (preResult !== undefined) return preResult;
    }

    if (this.hasResourceBundle(this.languages[0], ns)) return true;
    return false;
  }
})();

module.exports = i18next;
