'use strict';

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
  log: function (args) { this.output('log', args); },
  warn: function (args) { this.output('warn', args); },
  error: function (args) { this.output('error', args); },
  output: function (type, args) {
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
    return new Logger(this.logger, _objectSpread({}, {
      prefix: `${this.prefix}:${moduleName}:`
    }, this.options));
  }
}

const baseLogger = new Logger();

class EventEmitter {
  constructor() {
    _classCallCheck(this, EventEmitter);
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
      const cloned = [...this.observers[event]];
      cloned.forEach(observer => {
        observer(...args);
      });
    }
    if (this.observers['*']) {
      const cloned = [...this.observers['*']];
      cloned.forEach(observer => {
        observer(observer, event, ...args);
      });
    }
  }
}

function defer() {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
}

function makeString(object) {
  return object == null ? '' : `${object}`;
}

function copy(a, s, t) {
  a.forEach(m => {
    if (s[m]) t[m] = s[m];
  });
}

function getLastOfPath(object, path, Empty) {
  function cleanKey(key) {
    return key && key.includes('###') ? key.replace(/###/g, '.') : key;
  }
  function canNotTraverseDeeper() {
    return !object || typeof object === 'string';
  }
  const stack = typeof path !== 'string' ? [...path] : path.split('.');
  while (stack.length > 1) {
    if (canNotTraverseDeeper()) return {};
    const key = cleanKey(stack.shift());
    if (!object[key] && Empty) object[key] = new Empty();
    object = object[key];
  }
  if (canNotTraverseDeeper()) return {};
  return { obj: object, k: cleanKey(stack.shift()) };
}

function setPath(object, path, newValue) {
  const { obj, k } = getLastOfPath(object, path, Object);
  obj[k] = newValue;
}

function pushPath(object, path, newValue, concat) {
  const { obj, k } = getLastOfPath(object, path, Object);
  obj[k] = obj[k] || [];
  if (concat) obj[k] = obj[k].concat(newValue);
  if (!concat) obj[k].push(newValue);
}

function getPath(object, path) {
  const { obj, k } = getLastOfPath(object, path);
  return obj ? obj[k] : undefined;
}

function getPathWithDefaults(data, defaultData, key) {
  const value = getPath(data, key);
  return value !== undefined ? value : getPath(defaultData, key);
}

function deepExtend(target, source, overwrite) {
  for (const prop in source) {
    if (prop !== '__proto__' && prop !== 'constructor') {
      if (prop in target) {
        if (typeof target[prop] === 'string' || target[prop] instanceof String || 
            typeof source[prop] === 'string' || source[prop] instanceof String) {
          if (overwrite) target[prop] = source[prop];
        } else {
          deepExtend(target[prop], source[prop], overwrite);
        }
      } else {
        target[prop] = source[prop];
      }
    }
  }
  return target;
}

function regexEscape(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

const _entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

function escape(data) {
  if (typeof data === 'string') {
    return data.replace(/[&<>"'/]/g, s => _entityMap[s]);
  }
  return data;
}

const isIE10 = typeof window !== 'undefined' &&
  window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf('MSIE') > -1;

class ResourceStore extends EventEmitter {
  constructor(data, options = { ns: ['translation'], defaultNS: 'translation' }) {
    super();
    _classCallCheck(this, ResourceStore);
    if (isIE10) {
      EventEmitter.call(this);
    }
    this.data = data || {};
    this.options = options;
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
    if (key && typeof key !== 'string') path = path.concat(key);
    if (key && typeof key === 'string') path = path.concat(keySeparator ? key.split(keySeparator) : key);
    if (lng.includes('.')) {
      path = lng.split('.');
    }
    return getPath(this.data, path);
  }

  addResource(lng, ns, key, value, options = { silent: false }) {
    const keySeparator = this.options.keySeparator === undefined ? '.' : this.options.keySeparator;
    let path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
    if (lng.includes('.')) {
      path = lng.split('.');
      value = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    setPath(this.data, path, value);
    if (!options.silent) this.emit('added', lng, ns, key, value);
  }

  addResources(lng, ns, resources, options = { silent: false }) {
    for (const m in resources) {
      if (typeof resources[m] === 'string' || Object.prototype.toString.apply(resources[m]) === '[object Array]') {
        this.addResource(lng, ns, m, resources[m], { silent: true });
      }
    }
    if (!options.silent) this.emit('added', lng, ns, resources);
  }

  addResourceBundle(lng, ns, resources, deep, overwrite, options = { silent: false }) {
    let path = [lng, ns];
    if (lng.includes('.')) {
      path = lng.split('.');
      deep = resources;
      resources = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    let pack = getPath(this.data, path) || {};
    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = _objectSpread({}, pack, resources);
    }
    setPath(this.data, path, pack);
    if (!options.silent) this.emit('added', lng, ns, resources);
  }

  removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);
    this.emit('removed', lng, ns);
  }

  hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== undefined;
  }

  getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS;
    if (this.options.compatibilityAPI === 'v1') return _objectSpread({}, this.getResource(lng, ns));
    return this.getResource(lng, ns);
  }

  getDataByLanguage(lng) {
    return this.data[lng];
  }

  toJSON() {
    return this.data;
  }
}

const postProcessor = {
  processors: {},
  addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle(processors, value, key, options, translator) {
    processors.forEach(processor => {
      if (this.processors[processor]) value = this.processors[processor].process(value, key, options, translator);
    });
    return value;
  }
};

const checkedLoadedFor = {};

class Translator extends EventEmitter {
  constructor(services, options = {}) {
    super();
    _classCallCheck(this, Translator);
    if (isIE10) {
      EventEmitter.call(this);
    }
    copy(['resourceStore', 'languageUtils', 'pluralResolver', 'interpolator', 'backendConnector', 'i18nFormat', 'utils'], services, this);
    this.options = options;
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = '.';
    }
    this.logger = baseLogger.create('translator');
  }

  changeLanguage(lng) {
    if (lng) this.language = lng;
  }

  exists(key, options = { interpolation: {} }) {
    const resolved = this.resolve(key, options);
    return resolved && resolved.res !== undefined;
  }

  extractFromKey(key, options) {
    let nsSeparator = options.nsSeparator !== undefined ? options.nsSeparator : this.options.nsSeparator;
    if (nsSeparator === undefined) nsSeparator = ':';
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    let namespaces = options.ns || this.options.defaultNS;

    if (nsSeparator && key.includes(nsSeparator)) {
      const m = key.match(this.interpolator.nestingRegexp);
      if (m && m.length > 0) {
        return { key, namespaces };
      }
      const parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || (nsSeparator === keySeparator && this.options.ns.includes(parts[0]))) namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    if (typeof namespaces === 'string') namespaces = [namespaces];
    return { key, namespaces };
  }

  translate(keys, options, lastKey) {
    if (_typeof(options) !== 'object' && this.options.overloadTranslationOptionHandler) {
      options = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (!options) options = {};
    if (keys === undefined || keys === null) return '';
    if (!Array.isArray(keys)) keys = [String(keys)];
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;

    const { key, namespaces } = this.extractFromKey(keys[keys.length - 1], options);
    const namespace = namespaces[namespaces.length - 1];
    const lng = options.lng || this.language;
    const appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;

    if (lng && lng.toLowerCase() === 'cimode') {
      if (appendNamespaceToCIMode) {
        const nsSeparator = options.nsSeparator || this.options.nsSeparator;
        return namespace + nsSeparator + key;
      }
      return key;
    }

    const resolved = this.resolve(keys, options);
    const res = resolved && resolved.res;
    const resUsedKey = (resolved && resolved.usedKey) || key;
    const resExactUsedKey = (resolved && resolved.exactUsedKey) || key;
    const resType = Object.prototype.toString.apply(res);
    const noObject = ['[object Number]', '[object Function]', '[object RegExp]'];
    const joinArrays = options.joinArrays !== undefined ? options.joinArrays : this.options.joinArrays;
    const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
    const handleAsObject = typeof res !== 'string' && typeof res !== 'boolean' && typeof res !== 'number';

    if (handleAsObjectInI18nFormat && res && handleAsObject && noObject.indexOf(resType) < 0 &&
        !(typeof joinArrays === 'string' && resType === '[object Array]')) {
      if (!options.returnObjects && !this.options.returnObjects) {
        this.logger.warn('accessing an object - but returnObjects options is not enabled!');
        return this.options.returnedObjectHandler ?
          this.options.returnedObjectHandler(resUsedKey, res, options) :
          `key '${key} (${this.language})' returned an object instead of string.`;
      }

      if (keySeparator) {
        const resTypeIsArray = resType === '[object Array]';
        const copy = resTypeIsArray ? [] : {};
        const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;

        for (const m in res) {
          if (Object.prototype.hasOwnProperty.call(res, m)) {
            const deepKey = `${newKeyToUse}${keySeparator}${m}`;
            copy[m] = this.translate(deepKey, _objectSpread({}, options, {
              joinArrays: false,
              ns: namespaces
            }));
            if (copy[m] === deepKey) copy[m] = res[m];
          }
        }
        res = copy;
      }
    } else if (handleAsObjectInI18nFormat && typeof joinArrays === 'string' && resType === '[object Array]') {
      res = res.join(joinArrays);
      if (res) res = this.extendTranslation(res, keys, options, lastKey);
    } else {
      let usedDefault = false;
      let usedKey = false;

      if (!this.isValidLookup(res) && options.defaultValue !== undefined) {
        usedDefault = true;
        if (options.count !== undefined) {
          const suffix = this.pluralResolver.getSuffix(lng, options.count);
          res = options[`defaultValue${suffix}`];
        }
        if (!res) res = options.defaultValue;
      }

      if (!this.isValidLookup(res)) {
        usedKey = true;
        res = key;
      }

      const updateMissing = options.defaultValue && options.defaultValue !== res && this.options.updateMissing;

      if (usedKey || usedDefault || updateMissing) {
        this.logger.log(updateMissing ? 'updateKey' : 'missingKey', lng, namespace, key, updateMissing ? options.defaultValue : res);

        if (keySeparator) {
          const fk = this.resolve(key, _objectSpread({}, options, { keySeparator: false }));
          if (fk && fk.res) this.logger.warn('Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.');
        }

        const lngs = [];
        const fallbackLngs = this.languageUtils.getFallbackCodes(
          this.options.fallbackLng,
          options.lng || this.language
        );

        if (this.options.saveMissingTo === 'fallback' && fallbackLngs && fallbackLngs[0]) {
          for (let i = 0; i < fallbackLngs.length; i++) {
            lngs.push(fallbackLngs[i]);
          }
        } else if (this.options.saveMissingTo === 'all') {
          lngs.push(...this.languageUtils.toResolveHierarchy(options.lng || this.language));
        } else {
          lngs.push(options.lng || this.language);
        }

        const send = (l, k) => {
          if (this.options.missingKeyHandler) {
            this.options.missingKeyHandler(l, namespace, k, updateMissing ? options.defaultValue : res, updateMissing, options);
          } else if (this.backendConnector && this.backendConnector.saveMissing) {
            this.backendConnector.saveMissing(l, namespace, k, updateMissing ? options.defaultValue : res, updateMissing, options);
          }

          this.emit('missingKey', l, namespace, k, res);
        };

        if (this.options.saveMissing) {
          const needsPluralHandling = options.count !== undefined && typeof options.count !== 'string';
          if (this.options.saveMissingPlurals && needsPluralHandling) {
            lngs.forEach(l => {
              const plurals = this.pluralResolver.getPluralFormsOfKey(l, key);
              plurals.forEach(p => send([l], p));
            });
          } else {
            send(lngs, key);
          }
        }
      }

      res = this.extendTranslation(res, keys, options, resolved, lastKey);
      if (usedKey && res === key && this.options.appendNamespaceToMissingKey) res = `${namespace}:${key}`;
      if (usedKey && this.options.parseMissingKeyHandler) res = this.options.parseMissingKeyHandler(res);
    }

    return res;
  }

  extendTranslation(res, key, options, resolved, lastKey) {
    if (this.i18nFormat && this.i18nFormat.parse) {
      res = this.i18nFormat.parse(res, options, resolved.usedLng, resolved.usedNS, resolved.usedKey, { resolved });
    } else if (!options.skipInterpolation) {
      if (options.interpolation) this.interpolator.init(_objectSpread({}, options, {
        interpolation: _objectSpread({}, this.options.interpolation, options.interpolation)
      }));
      const skipOnVariables = options.interpolation && options.interpolation.skipOnVariables || this.options.interpolation.skipOnVariables;
      let nestBef;

      if (skipOnVariables) {
        const nb = res.match(this.interpolator.nestingRegexp);
        nestBef = nb && nb.length;
      }

      let data = options.replace && typeof options.replace !== 'string' ? options.replace : options;
      if (this.options.interpolation.defaultVariables) data = _objectSpread({}, this.options.interpolation.defaultVariables, data);
      res = this.interpolator.interpolate(res, data, options.lng || this.language, options);

      if (skipOnVariables) {
        const na = res.match(this.interpolator.nestingRegexp);
        const nestAft = na && na.length;
        if (nestBef < nestAft) options.nest = false;
      }

      if (options.nest !== false) res = this.interpolator.nest(res, (...args) => {
        if (lastKey && lastKey[0] === args[0] && !options.context) {
          this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
          return null;
        }
        return this.translate(...args, key);
      }, options);
      if (options.interpolation) this.interpolator.reset();
    }

    const postProcess = options.postProcess || this.options.postProcess;
    const postProcessorNames = typeof postProcess === 'string' ? [postProcess] : postProcess;

    if (res !== undefined && res !== null && postProcessorNames && postProcessorNames.length && options.applyPostProcessor !== false) {
      res = postProcessor.handle(
        postProcessorNames,
        res,
        key,
        this.options && this.options.postProcessPassResolved ? _objectSpread({ i18nResolved: resolved }, options) : options,
        this
      );
    }

    return res;
  }

  resolve(keys, options = {}) {
    let found;
    let usedKey;
    let exactUsedKey;
    let usedLng;
    let usedNS;
    if (typeof keys === 'string') keys = [keys];
    keys.forEach(k => {
      if (this.isValidLookup(found)) return;

      const extracted = this.extractFromKey(k, options);

      const key = extracted.key;
      usedKey = key;
      let namespaces = extracted.namespaces;
      if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
      const needsPluralHandling = options.count !== undefined && typeof options.count !== 'string';
      const needsContextHandling = options.context !== undefined && typeof options.context === 'string' && options.context !== '';
      const codes = options.lngs ?
        options.lngs :
        this.languageUtils.toResolveHierarchy(options.lng || this.language, options.fallbackLng);
      namespaces.forEach(ns => {
        if (this.isValidLookup(found)) return;
        usedNS = ns;

        if (!checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils && this.utils.hasLoadedNamespace && !this.utils.hasLoadedNamespace(usedNS)) {
          checkedLoadedFor[`${codes[0]}-${ns}`] = true;
          this.logger.warn(
            `key "${usedKey}" for languages "${codes.join(', ')}" won't get resolved as namespace "${usedNS}" was not yet loaded`,
            'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!'
          );
        }

        codes.forEach(code => {
          if (this.isValidLookup(found)) return;
          usedLng = code;
          let finalKey = key;
          const finalKeys = [finalKey];

          if (this.i18nFormat && this.i18nFormat.addLookupKeys) {
            this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, options);
          } else {
            let pluralSuffix;
            if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, options.count);
            if (needsPluralHandling && needsContextHandling) finalKeys.push(finalKey + pluralSuffix);
            if (needsContextHandling) finalKeys.push(finalKey += `${this.options.contextSeparator}${options.context}`);
            if (needsPluralHandling) finalKeys.push(finalKey += pluralSuffix);
          }

          let possibleKey;

          while (possibleKey = finalKeys.pop()) {
            if (!this.isValidLookup(found)) {
              exactUsedKey = possibleKey;
              found = this.getResource(code, ns, possibleKey, options);
            }
          }
        });
      });
    });
    return { res: found, usedKey, exactUsedKey, usedLng, usedNS };
  }

  isValidLookup(res) {
    return res !== undefined && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === '');
  }

  getResource(code, ns, key, options = {}) {
    if (this.i18nFormat && this.i18nFormat.getResource) return this.i18nFormat.getResource(code, ns, key, options);
    return this.resourceStore.getResource(code, ns, key, options);
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class LanguageUtil {
  constructor(options) {
    _classCallCheck(this, LanguageUtil);
    this.options = options;
    this.whitelist = this.options.supportedLngs || false;
    this.supportedLngs = this.options.supportedLngs || false;
    this.logger = baseLogger.create('languageUtils');
  }

  getScriptPartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return null;
    const part = code.split('-');
    if (part.length === 2) return null;
    part.pop();
    if (part[part.length - 1].toLowerCase() === 'x') return null;
    return this.formatLanguageCode(part.join('-'));
  }

  getLanguagePartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return code;
    const part = code.split('-');
    return this.formatLanguageCode(part[0]);
  }

  formatLanguageCode(code) {
    if (typeof code === 'string' && code.includes('-')) {
      const specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab'];
      const part = code.split('-');
      if (this.options.lowerCaseLng) {
        return part.map(part => part.toLowerCase()).join('-');
      } else if (part.length === 2) {
        part[0] = part[0].toLowerCase();
        part[1] = part[1].toUpperCase();
        if (specialCases.includes(part[1].toLowerCase())) part[1] = capitalize(part[1].toLowerCase());
      } else if (part.length === 3) {
        part[0] = part[0].toLowerCase();
        if (part[1].length === 2) part[1] = part[1].toUpperCase();
        if (part[0] !== 'sgn' && part[2].length === 2) part[2] = part[2].toUpperCase();
        if (specialCases.includes(part[1].toLowerCase())) part[1] = capitalize(part[1].toLowerCase());
        if (specialCases.includes(part[2].toLowerCase())) part[2] = capitalize(part[2].toLowerCase());
      }
      return part.join('-');
    }
    return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
  }

  isWhitelisted(code) {
    this.logger.deprecate('languageUtils.isWhitelisted', 'function "isWhitelisted" will be renamed to "isSupportedCode" in the next major - please make sure to rename it\'s usage asap.');
    return this.isSupportedCode(code);
  }

  isSupportedCode(code) {
    if (this.options.load === 'languageOnly' || this.options.nonExplicitSupportedLngs) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.includes(code);
  }

  getBestMatchFromCodes(codes) {
    if (!codes) return null;
    let found;
    codes.forEach(code => {
      if (found) return;
      const cleanedLng = this.formatLanguageCode(code);
      if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
    });
    if (!found && this.options.supportedLngs) {
      codes.forEach(code => {
        if (found) return;
        const lngOnly = this.getLanguagePartFromCode(code);
        if (this.isSupportedCode(lngOnly)) {
          found = lngOnly;
          return;
        }
        found = this.options.supportedLngs.find(supportedLng => supportedLng.startsWith(lngOnly));
      });
    }
    if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
    return found;
  }

  getFallbackCodes(fallbacks, code) {
    if (!fallbacks) return [];
    if (typeof fallbacks === 'function') fallbacks = fallbacks(code);
    if (typeof fallbacks === 'string') fallbacks = [fallbacks];
    if (Object.prototype.toString.apply(fallbacks) === '[object Array]') return fallbacks;
    if (!code) return fallbacks["default"] || [];
    let found = fallbacks[code];
    if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found) found = fallbacks[this.formatLanguageCode(code)];
    if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
    if (!found) found = fallbacks["default"];
    return found || [];
  }

  toResolveHierarchy(code, fallbackCode) {
    const fallbackCodes = this.getFallbackCodes(fallbackCode || this.options.fallbackLng || [], code);
    const codes = [];

    const addCode = c => {
      if (!c) return;
      if (this.isSupportedCode(c)) {
        codes.push(c);
      } else {
        this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
      }
    };

    if (typeof code === 'string' && code.includes('-')) {
      if (this.options.load !== 'languageOnly') addCode(this.formatLanguageCode(code));
      if (this.options.load !== 'languageOnly' && this.options.load !== 'currentOnly') addCode(this.getScriptPartFromCode(code));
      if (this.options.load !== 'currentOnly') addCode(this.getLanguagePartFromCode(code));
    } else if (typeof code === 'string') {
      addCode(this.formatLanguageCode(code));
    }

    fallbackCodes.forEach(fc => {
      if (!codes.includes(fc)) addCode(this.formatLanguageCode(fc));
    });
    return codes;
  }
}

const sets = [
  { lngs: ['ach', 'ak', 'am', 'arn', 'br', 'fil', 'gun', 'ln', 'mfe', 'mg', 'mi', 'oc', 'pt', 'pt-BR', 'tg', 'ti', 'tr', 'uz', 'wa'], nr: [1, 2], fc: 1 },
  { lngs: ['af', 'an', 'ast', 'az', 'bg', 'bn', 'ca', 'da', 'de', 'dev', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fi', 'fo', 'fur', 'fy', 'gl', 'gu', 'ha', 'hi', 'hu', 'hy', 'ia', 'it', 'kn', 'ku', 'lb', 'mai', 'ml', 'mn', 'mr', 'nah', 'nap', 'nb', 'ne', 'nl', 'nn', 'no', 'nso', 'pa', 'pap', 'pms', 'ps', 'pt-PT', 'rm', 'sco', 'se', 'si', 'so', 'son', 'sq', 'sv', 'sw', 'ta', 'te', 'tk', 'ur', 'yo'], nr: [1, 2], fc: 2 },
  { lngs: ['ay', 'bo', 'cgg', 'fa', 'ht', 'id', 'ja', 'jbo', 'ka', 'kk', 'km', 'ko', 'ky', 'lo', 'ms', 'sah', 'su', 'th', 'tt', 'ug', 'vi', 'wo', 'zh'], nr: [1], fc: 3 },
  { lngs: ['be', 'bs', 'cnr', 'dz', 'hr', 'ru', 'sr', 'uk'], nr: [1, 2, 5], fc: 4 },
  { lngs: ['ar'], nr: [0, 1, 2, 3, 11, 100], fc: 5 },
  { lngs: ['cs', 'sk'], nr: [1, 2, 5], fc: 6 },
  { lngs: ['csb', 'pl'], nr: [1, 2, 5], fc: 7 },
  { lngs: ['cy'], nr: [1, 2, 3, 8], fc: 8 },
  { lngs: ['fr'], nr: [1, 2], fc: 9 },
  { lngs: ['ga'], nr: [1, 2, 3, 7, 11], fc: 10 },
  { lngs: ['gd'], nr: [1, 2, 3, 20], fc: 11 },
  { lngs: ['is'], nr: [1, 2], fc: 12 },
  { lngs: ['jv'], nr: [0, 1], fc: 13 },
  { lngs: ['kw'], nr: [1, 2, 3, 4], fc: 14 },
  { lngs: ['lt'], nr: [1, 2, 10], fc: 15 },
  { lngs: ['lv'], nr: [1, 2, 0], fc: 16 },
  { lngs: ['mk'], nr: [1, 2], fc: 17 },
  { lngs: ['mnk'], nr: [0, 1, 2], fc: 18 },
  { lngs: ['mt'], nr: [1, 2, 11, 20], fc: 19 },
  { lngs: ['or'], nr: [2, 1], fc: 2 },
  { lngs: ['ro'], nr: [1, 2, 20], fc: 20 },
  { lngs: ['sl'], nr: [5, 1, 2, 3], fc: 21 },
  { lngs: ['he', 'iw'], nr: [1, 2, 20, 21], fc: 22 }
];

const _rulesPluralsTypes = {
  1: function (n) {
    return Number(n > 1);
  },
  2: function (n) {
    return Number(n !== 1);
  },
  3: function (n) {
    return 0;
  },
  4: function (n) {
    return Number(n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  5: function (n) {
    return Number(n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
  },
  6: function (n) {
    return Number(n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2);
  },
  7: function (n) {
    return Number(n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  8: function (n) {
    return Number(n === 1 ? 0 : n === 2 ? 1 : n !== 8 && n !== 11 ? 2 : 3);
  },
  9: function (n) {
    return Number(n >= 2);
  },
  10: function (n) {
    return Number(n === 1 ? 0 : n === 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
  },
  11: function (n) {
    return Number(n === 1 || n === 11 ? 0 : n === 2 || n === 12 ? 1 : n > 2 && n < 20 ? 2 : 3);
  },
  12: function (n) {
    return Number(n % 10 !== 1 || n % 100 === 11);
  },
  13: function (n) {
    return Number(n !== 0);
  },
  14: function (n) {
    return Number(n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : 3);
  },
  15: function (n) {
    return Number(n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  16: function (n) {
    return Number(n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2);
  },
  17: function (n) {
    return Number(n === 1 || n % 10 === 1 && n % 100 !== 11 ? 0 : 1);
  },
  18: function (n) {
    return Number(n === 0 ? 0 : n === 1 ? 1 : 2);
  },
  19: function (n) {
    return Number(n === 1 ? 0 : n === 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3);
  },
  20: function (n) {
    return Number(n === 1 ? 0 : n === 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2);
  },
  21: function (n) {
    return Number(n % 100 === 1 ? 1 : n % 100 === 2 ? 2 : n % 100 === 3 || n % 100 === 4 ? 3 : 0);
  },
  22: function (n) {
    return Number(n === 1 ? 0 : n === 2 ? 1 : (n < 0 || n > 10) && n % 10 === 0 ? 2 : 3);
  }
};

function createRules() {
  const rules = {};
  sets.forEach(set => {
    set.lngs.forEach(l => {
      rules[l] = {
        numbers: set.nr,
        plurals: _rulesPluralsTypes[set.fc]
      };
    });
  });
  return rules;
}

class PluralResolver {
  constructor(languageUtils, options = {}) {
    _classCallCheck(this, PluralResolver);
    this.languageUtils = languageUtils;
    this.options = options;
    this.logger = baseLogger.create('pluralResolver');
    this.rules = createRules();
  }

  addRule(lng, obj) {
    this.rules[lng] = obj;
  }

  getRule(code) {
    return this.rules[code] || this.rules[this.languageUtils.getLanguagePartFromCode(code)];
  }

  needsPlural(code) {
    const rule = this.getRule(code);
    return rule && rule.numbers.length > 1;
  }

  getPluralFormsOfKey(code, key) {
    const ret = [];
    const rule = this.getRule(code);
    if (!rule) return ret;
    rule.numbers.forEach(n => {
      const suffix = this.getSuffix(code, n);
      ret.push(`${key}${suffix}`);
    });
    return ret;
  }

  getSuffix(code, count) {
    const rule = this.getRule(code);

    if (rule) {
      let idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
      let suffix = rule.numbers[idx];

      if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
        if (suffix === 2) {
          suffix = 'plural';
        } else if (suffix === 1) {
          suffix = '';
        }
      }

      const returnSuffix = () => {
        return this.options.prepend && suffix.toString() ? this.options.prepend + suffix.toString() : suffix.toString();
      };

      if (this.options.compatibilityJSON === 'v1') {
        if (suffix === 1) return '';
        if (typeof suffix === 'number') return `_plural_${suffix.toString()}`;
        return returnSuffix();
      } else if (this.options.compatibilityJSON === 'v2') {
        return returnSuffix();
      } else if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
        return returnSuffix();
      }

      return this.options.prepend && idx.toString() ? this.options.prepend + idx.toString() : idx.toString();
    }

    this.logger.warn(`no plural rule found for: ${code}`);
    return '';
  }
}

class Interpolator {
  constructor(options = {}) {
    _classCallCheck(this, Interpolator);
    this.logger = baseLogger.create('interpolator');
    this.options = options;

    this.format = options.interpolation && options.interpolation.format || function (value) { return value; };
    this.init(options);
  }

  init(options = {}) {
    if (!options.interpolation) options.interpolation = { escapeValue: true };
    const iOpts = options.interpolation;
    this.escape = iOpts.escape !== undefined ? iOpts.escape : escape;
    this.escapeValue = iOpts.escapeValue !== undefined ? iOpts.escapeValue : true;
    this.useRawValueToEscape = iOpts.useRawValueToEscape !== undefined ? iOpts.useRawValueToEscape : false;
    this.prefix = iOpts.prefix ? regexEscape(iOpts.prefix) : iOpts.prefixEscaped || '{{';
    this.suffix = iOpts.suffix ? regexEscape(iOpts.suffix) : iOpts.suffixEscaped || '}}';
    this.formatSeparator = iOpts.formatSeparator || iOpts.formatSeparator || ',';
    this.unescapePrefix = iOpts.unescapeSuffix ? '' : iOpts.unescapePrefix || '-';
    this.unescapeSuffix = this.unescapePrefix ? '' : iOpts.unescapeSuffix || '';
    this.nestingPrefix = iOpts.nestingPrefix ? regexEscape(iOpts.nestingPrefix) : iOpts.nestingPrefixEscaped || regexEscape('$t(');
    this.nestingSuffix = iOpts.nestingSuffix ? regexEscape(iOpts.nestingSuffix) : iOpts.nestingSuffixEscaped || regexEscape(')');
    this.nestingOptionsSeparator = iOpts.nestingOptionsSeparator || iOpts.nestingOptionsSeparator || ',';
    this.maxReplaces = iOpts.maxReplaces || 1000;
    this.alwaysFormat = iOpts.alwaysFormat !== undefined ? iOpts.alwaysFormat : false;
    this.resetRegExp();
  }

  reset() {
    if (this.options) this.init(this.options);
  }

  resetRegExp() {
    const regexpStr = `${this.prefix}(.+?)${this.suffix}`;
    this.regexp = new RegExp(regexpStr, 'g');
    const regexpUnescapeStr = `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`;
    this.regexpUnescape = new RegExp(regexpUnescapeStr, 'g');
    const nestingRegexpStr = `${this.nestingPrefix}(.+?)${this.nestingSuffix}`;
    this.nestingRegexp = new RegExp(nestingRegexpStr, 'g');
  }

  interpolate(str, data, lng, options) {
    const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }

    const handleFormat = key => {
      if (key.indexOf(this.formatSeparator) < 0) {
        const path = getPathWithDefaults(data, defaultData, key);
        return this.alwaysFormat ? this.format(path, undefined, lng) : path;
      }
      const parts = key.split(this.formatSeparator);
      const k = parts.shift().trim();
      const f = parts.join(this.formatSeparator).trim();
      return this.format(getPathWithDefaults(data, defaultData, k), f, lng, options);
    };

    let replaces;
    let match;
    const missingInterpolationHandler = options && options.missingInterpolationHandler || this.options.missingInterpolationHandler;
    const skipOnVariables = options && options.interpolation && options.interpolation.skipOnVariables || this.options.interpolation.skipOnVariables;

    const todos = [
      {
        regex: this.regexpUnescape,
        safeValue: val => regexSafe(val)
      },
      {
        regex: this.regexp,
        safeValue: val => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
      }
    ];

    todos.forEach(todo => {
      replaces = 0;
      while (match = todo.regex.exec(str)) {
        const value = handleFormat.call(this, match[1].trim());

        if (value === undefined) {
          if (typeof missingInterpolationHandler === 'function') {
            const temp = missingInterpolationHandler(str, match, options);
            value = typeof temp === 'string' ? temp : '';
          } else if (skipOnVariables) {
            value = match[0];
            continue;
          } else {
            this.logger.warn(`missed to pass in variable ${match[1]} for interpolating ${str}`);
            value = '';
          }
        } else if (typeof value !== 'string' && !this.useRawValueToEscape) {
          value = makeString(value);
        }

        str = str.replace(match[0], todo.safeValue(value));
        todo.regex.lastIndex = 0;
        replaces++;

        if (replaces >= this.maxReplaces) {
          break;
        }
      }
    });

    return str;
  }

  nest(str, fc, options = {}) {
    let match;
    let value;

    const clonedOptions = _objectSpread({}, options);

    clonedOptions.applyPostProcessor = false;
    delete clonedOptions.defaultValue;

    function handleHasOptions(key, inheritedOptions) {
      const sep = this.nestingOptionsSeparator;
      if (key.indexOf(sep) < 0) return key;
      const c = key.split(new RegExp(`${sep}[ ]*{`));
      let optionsString = `{${c[1]}`;
      key = c[0];
      optionsString = this.interpolate(optionsString, clonedOptions);
      optionsString = optionsString.replace(/'/g, '"');

      try {
        clonedOptions = JSON.parse(optionsString);
        if (inheritedOptions) clonedOptions = _objectSpread({}, inheritedOptions, clonedOptions);
      } catch (e) {
        this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
        return `${key}${sep}${optionsString}`;
      }

      delete clonedOptions.defaultValue;
      return key;
    }

    while (match = this.nestingRegexp.exec(str)) {
      const formatters = [];
      let doReduce = false;

      if (match[0].includes(this.formatSeparator) && !/{.*}/.test(match[1])) {
        const r = match[1].split(this.formatSeparator).map(elem => elem.trim());
        match[1] = r.shift();
        formatters.push(...r);
        doReduce = true;
      }

      value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
      if (value && match[0] === str && typeof value !== 'string') return value;
      if (typeof value !== 'string') value = makeString(value);

      if (!value) {
        this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
        value = '';
      }

      if (doReduce) {
        value = formatters.reduce((v, f) => this.format(v, f, options.lng, options), value.trim());
      }

      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }

    return str;
  }
}

function remove(arr, what) {
  let found = arr.indexOf(what);
  while (found !== -1) {
    arr.splice(found, 1);
    found = arr.indexOf(what);
  }
}

class Connector extends EventEmitter {
  constructor(backend, store, services, options = {}) {
    super();
    _classCallCheck(this, Connector);
    if (isIE10) {
      EventEmitter.call(this);
    }

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
    const toLoadLanguages = [];
    const toLoadNamespaces = [];
    languages.forEach(lng => {
      let hasAllNamespaces = true;
      namespaces.forEach(ns => {
        const name = `${lng}|${ns}`;

        if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
          this.state[name] = 2;
        } else if (this.state[name] < 0) {} else if (this.state[name] === 1) {
          if (!pending.includes(name)) pending.push(name);
        } else {
          this.state[name] = 1;
          hasAllNamespaces = false;
          if (!pending.includes(name)) pending.push(name);
          if (!toLoad.includes(name)) toLoad.push(name);
          if (!toLoadNamespaces.includes(ns)) toLoadNamespaces.push(ns);
        }
      });
      if (!hasAllNamespaces) toLoadLanguages.push(lng);
    });

    if (toLoad.length || pending.length) {
      this.queue.push({
        pending,
        loaded: {},
        errors: [],
        callback
      });
    }

    return { toLoad, pending, toLoadLanguages, toLoadNamespaces };
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
      pushPath(q.loaded, [lng], ns);
      remove(q.pending, name);
      if (err) q.errors.push(err);

      if (q.pending.length === 0 && !q.done) {
        Object.keys(q.loaded).forEach(l => {
          if (!loaded[l]) loaded[l] = [];
          if (q.loaded[l].length) {
            q.loaded[l].forEach(ns => {
              if (!loaded[l].includes(ns)) loaded[l].push(ns);
            });
          }
        });
        q.done = true;
        if (q.errors.length) {
          q.callback(q.errors);
        } else {
          q.callback();
        }
      }
    });
    this.emit('loaded', loaded);
    this.queue = this.queue.filter(q => !q.done);
  }

  read(lng, ns, fcName, tried = 0, wait = 350, callback = undefined) {
    if (!lng.length) return callback(null, {});
    return this.backend[fcName](lng, ns, (err, data) => {
      if (err && data && tried < 5) {
        setTimeout(() => {
          this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    });
  }

  prepareLoading(languages, namespaces, options = {}, callback) {
    if (!this.backend) {
      this.logger.warn('No backend was added via i18next.use. Will not load resources.');
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

  load(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {}, callback);
  }

  reload(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, { reload: true }, callback);
  }

  loadOne(name, prefix = '') {
    const [lng, ns] = name.split('|');
    this.read(lng, ns, 'read', undefined, undefined, (err, data) => {
      if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
      if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
      this.loaded(name, err, data);
    });
  }

  saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}) {
    if (this.services.utils && this.services.utils.hasLoadedNamespace && !this.services.utils.hasLoadedNamespace(namespace)) {
      this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, 'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!');
      return;
    }
    if (key === undefined || key === null || key === '') return;
    if (this.backend && this.backend.create) {
      this.backend.create(languages, namespace, key, fallbackValue, null, _objectSpread({}, options, { isUpdate }));
    }
    if (!languages || !languages[0]) return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  }
}

function get() {
  return {
    debug: false,
    initImmediate: true,
    ns: ['translation'],
    defaultNS: ['translation'],
    fallbackLng: ['dev'],
    fallbackNS: false,
    whitelist: false,
    nonExplicitWhitelist: false,
    supportedLngs: false,
    nonExplicitSupportedLngs: false,
    load: 'all',
    preload: false,
    simplifyPluralSuffix: true,
    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_',
    partialBundledLanguages: false,
    saveMissing: false,
    updateMissing: false,
    saveMissingTo: 'fallback',
    saveMissingPlurals: true,
    missingKeyHandler: false,
    missingInterpolationHandler: false,
    postProcess: false,
    postProcessPassResolved: false,
    returnNull: true,
    returnEmptyString: true,
    returnObjects: false,
    joinArrays: false,
    returnedObjectHandler: false,
    parseMissingKeyHandler: false,
    appendNamespaceToMissingKey: false,
    appendNamespaceToCIMode: false,
    overloadTranslationOptionHandler: function handle(args) {
      const ret = {};
      if (_typeof(args[1]) === 'object') ret = args[1];
      if (typeof args[1] === 'string') ret.defaultValue = args[1];
      if (typeof args[2] === 'string') ret.tDescription = args[2];

      if (_typeof(args[2]) === 'object' || _typeof(args[3]) === 'object') {
        const options = args[3] || args[2];
        Object.keys(options).forEach(key => {
          ret[key] = options[key];
        });
      }
      return ret;
    },
    interpolation: {
      escapeValue: true,
      format: function format(value, _format, lng, options) { return value; },
      prefix: '{{',
      suffix: '}}',
      formatSeparator: ',',
      unescapePrefix: '-',
      nestingPrefix: '$t(',
      nestingSuffix: ')',
      nestingOptionsSeparator: ',',
      maxReplaces: 1000,
      skipOnVariables: false
    }
  };
}

function transformOptions(options) {
  if (typeof options.ns === 'string') options.ns = [options.ns];
  if (typeof options.fallbackLng === 'string') options.fallbackLng = [options.fallbackLng];
  if (typeof options.fallbackNS === 'string') options.fallbackNS = [options.fallbackNS];

  if (options.whitelist) {
    if (options.whitelist && options.whitelist.indexOf('cimode') < 0) {
      options.whitelist = options.whitelist.concat(['cimode']);
    }
    options.supportedLngs = options.whitelist;
  }

  if (options.nonExplicitWhitelist) {
    options.nonExplicitSupportedLngs = options.nonExplicitWhitelist;
  }

  if (options.supportedLngs && options.supportedLngs.indexOf('cimode') < 0) {
    options.supportedLngs = options.supportedLngs.concat(['cimode']);
  }
  return options;
}

function noop() {}

class I18n extends EventEmitter {
  constructor(options = {}, callback) {
    super();
    _classCallCheck(this, I18n);
    if (isIE10) {
      EventEmitter.call(this);
    }

    this.options = transformOptions(options);
    this.services = {};
    this.logger = baseLogger;
    this.modules = { external: [] };

    if (callback && !this.isInitialized && !options.isClone) {
      if (!this.options.initImmediate) {
        this.init(options, callback);
        return _possibleConstructorReturn(this, _assertThisInitialized(this));
      }
      setTimeout(() => {
        this.init(options, callback);
      }, 0);
    }
  }

  init(options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (options.whitelist && !options.supportedLngs) {
      this.logger.deprecate('whitelist', 'option "whitelist" will be renamed to "supportedLngs" in the next major - please make sure to rename this option asap.');
    }

    if (options.nonExplicitWhitelist && !options.nonExplicitSupportedLngs) {
      this.logger.deprecate('whitelist', 'options "nonExplicitWhitelist" will be renamed to "nonExplicitSupportedLngs" in the next major - please make sure to rename this option asap.');
    }

    this.options = _objectSpread({}, get(), this.options, transformOptions(options));
    this.format = this.options.interpolation.format;
    if (!callback) callback = noop;

    function createClassOnDemand(ClassOrObject) {
      if (!ClassOrObject) return null;
      if (typeof ClassOrObject === 'function') return new ClassOrObject();
      return ClassOrObject;
    }

    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
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
        compatibilityJSON: this.options.compatibilityJSON,
        simplifyPluralSuffix: this.options.simplifyPluralSuffix
      });
      s.interpolator = new Interpolator(this.options);
      s.utils = { hasLoadedNamespace: this.hasLoadedNamespace.bind(this) };
      s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      s.backendConnector.on('*', (...args) => {
        this.emit(...args);
      });

      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        s.languageDetector.init(s, this.options.detection, this.options);
      }

      if (this.modules.i18nFormat) {
        s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
        if (s.i18nFormat.init) s.i18nFormat.init(this);
      }
      this.translator = new Translator(this.services, this.options);
      this.translator.on('*', (...args) => {
        this.emit(...args);
      });
      this.modules.external.forEach(m => {
        if (m.init) m.init(this);
      });
    }

    if (!this.services.languageDetector && !this.options.lng) {
      this.logger.warn('init: no languageDetector is used and no lng is defined');
    }

    const storeApi = ['getResource', 'hasResourceBundle', 'getResourceBundle', 'getDataByLanguage'];
    storeApi.forEach(fcName => {
      this[fcName] = (...args) => this.store[fcName](...args);
    });

    const storeApiChained = ['addResource', 'addResources', 'addResourceBundle', 'removeResourceBundle'];
    storeApiChained.forEach(fcName => {
      this[fcName] = (...args) => {
        this.store[fcName](...args);
        return this;
      };
    });

    const deferred = defer();

    const load = () => {
      this.changeLanguage(this.options.lng, (err, t) => {
        this.isInitialized = true;
        if (!this.options.isClone) this.logger.log('initialized', this.options);
        this.emit('initialized', this.options);
        deferred.resolve(t);
        callback(err, t);
      });
    };

    if (this.options.resources || !this.options.initImmediate) {
      load();
    } else {
      setTimeout(load, 0);
    }

    return deferred;
  }

  loadResources(language, callback = noop) {
    const usedCallback = callback;
    const usedLng = typeof language === 'string' ? language : this.language;
    if (typeof language === 'function') callback = language;

    if (!this.options.resources || this.options.partialBundledLanguages) {
      if (usedLng && usedLng.toLowerCase() === 'cimode') return callback();
      const toLoad = [];
      const append = lng => {
        if (!lng) return;
        const lngs = this.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach(l => {
          if (!toLoad.includes(l)) toLoad.push(l);
        });
      };

      if (!usedLng) {
        const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        fallbacks.forEach(l => append(l));
      } else {
        append(usedLng);
      }

      if (this.options.preload) {
        this.options.preload.forEach(l => append(l));
      }

      this.services.backendConnector.load(toLoad, this.options.ns, usedCallback);
    } else {
      usedCallback(null);
    }
  }

  reloadResources(lngs, ns, callback = noop) {
    const deferred = defer();
    if (!lngs) lngs = this.languages;
    if (!ns) ns = this.options.ns;
    this.services.backendConnector.reload(lngs, ns, err => {
      deferred.resolve();
      callback(err);
    });
    return deferred;
  }

  use(module) {
    if (!module) throw new Error('You are passing an undefined module! Please check the object you are passing to i18next.use()');
    if (!module.type) throw new Error('You are passing a wrong module! Please check the object you are passing to i18next.use()');

    if (module.type === 'backend') {
      this.modules.backend = module;
    }
    if (module.type === 'logger' || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }
    if (module.type === 'languageDetector') {
      this.modules.languageDetector = module;
    }
    if (module.type === 'i18nFormat') {
      this.modules.i18nFormat = module;
    }
    if (module.type === 'postProcessor') {
      postProcessor.addPostProcessor(module);
    }
    if (module.type === '3rdParty') {
      this.modules.external.push(module);
    }
    return this;
  }

  changeLanguage(lng, callback) {
    this.isLanguageChangingTo = lng;
    const deferred = defer();
    this.emit('languageChanging', lng);

    const done = (err, l) => {
      if (l) {
        this.language = l;
        this.languages = this.services.languageUtils.toResolveHierarchy(l);
        this.translator.changeLanguage(l);
        this.isLanguageChangingTo = undefined;
        this.emit('languageChanged', l);
        this.logger.log('languageChanged', l);
      } else {
        this.isLanguageChangingTo = undefined;
      }
      deferred.resolve(() => this.t.apply(this, arguments));
      if (callback) callback(err, () => this.t.apply(this, arguments));
    };

    const setLng = lngs => {
      const l = typeof lngs === 'string' ? lngs : this.services.languageUtils.getBestMatchFromCodes(lngs);

      if (l) {
        if (!this.language) {
          this.language = l;
          this.languages = this.services.languageUtils.toResolveHierarchy(l);
        }
        if (!this.translator.language) this.translator.changeLanguage(l);
        if (this.services.languageDetector) this.services.languageDetector.cacheUserLanguage(l);
      }

      this.loadResources(l, err => done(err, l));
    };

    if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
      setLng(this.services.languageDetector.detect());
    } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
      this.services.languageDetector.detect(setLng);
    } else {
      setLng(lng);
    }

    return deferred;
  }

  getFixedT(lng, ns) {
    const fixedT = (key, opts, ...rest) => {
      let options;
      if (_typeof(opts) !== 'object') {
        options = this.options.overloadTranslationOptionHandler([key, opts, ...rest]);
      } else {
        options = _objectSpread({}, opts);
      }
      options.lng = options.lng || fixedT.lng;
      options.lngs = options.lngs || fixedT.lngs;
      options.ns = options.ns || fixedT.ns;
      return this.t(key, options);
    };

    if (typeof lng === 'string') {
      fixedT.lng = lng;
    } else {
      fixedT.lngs = lng;
    }
    fixedT.ns = ns;
    return fixedT;
  }

  t(...args) {
    return this.translator && this.translator.translate(...args);
  }

  exists(...args) {
    return this.translator && this.translator.exists(...args);
  }

  setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  }

  hasLoadedNamespace(ns, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('hasLoadedNamespace: i18next was not initialized', this.languages);
      return false;
    }
    if (!this.languages || !this.languages.length) {
      this.logger.warn('hasLoadedNamespace: i18n.languages were undefined or empty', this.languages);
      return false;
    }

    const lng = this.languages[0];
    const fallbackLng = this.options ? this.options.fallbackLng : false;
    const lastLng = this.languages[this.languages.length - 1];
    if (lng.toLowerCase() === 'cimode') return true;

    const loadNotPending = (l, n) => {
      const loadState = this.services.backendConnector.state[`${l}|${n}`];
      return loadState === -1 || loadState === 2;
    };

    if (options.precheck) {
      const preResult = options.precheck(this, loadNotPending);
      if (preResult !== undefined) return preResult;
    }

    if (this.hasResourceBundle(lng, ns)) return true;
    if (!this.services.backendConnector.backend) return true;
    return loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns));
  }

  loadNamespaces(ns, callback) {
    const deferred = defer();
    if (!this.options.ns) {
      if (callback) callback();
      return Promise.resolve();
    }
    if (typeof ns === 'string') ns = [ns];
    ns.forEach(n => {
      if (!this.options.ns.includes(n)) this.options.ns.push(n);
    });
    this.loadResources(err => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }

  loadLanguages(lngs, callback) {
    const deferred = defer();
    if (typeof lngs === 'string') lngs = [lngs];
    const preloaded = this.options.preload || [];
    const newLngs = lngs.filter(lng => !preloaded.includes(lng));

    if (!newLngs.length) {
      if (callback) callback();
      return Promise.resolve();
    }
    this.options.preload = preloaded.concat(newLngs);
    this.loadResources(err => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }

  dir(lng) {
    if (!lng) lng = this.languages && this.languages.length > 0 ? this.languages[0] : this.language;
    if (!lng) return 'rtl';
    const rtlLngs = ['ar', 'shu', 'sqr', 'ssh', 'xaa', 'yhd', 'yud', 'aao', 'abh', 'abv', 'acm', 'acq', 'acw', 'acx', 'acy', 'adf', 'ads', 'aeb', 'aec', 'afb', 'ajp', 'apc', 'apd', 'arb', 'arq', 'ars', 'ary', 'arz', 'auz', 'avl', 'ayh', 'ayl', 'ayn', 'ayp', 'bbz', 'pga', 'he', 'iw', 'ps', 'pbt', 'pbu', 'pst', 'prp', 'prd', 'ug', 'ur', 'ydd', 'yds', 'yih', 'ji', 'yi', 'hbo', 'men', 'xmn', 'fa', 'jpr', 'peo', 'pes', 'prs', 'dv', 'sam'];
    return rtlLngs.includes(this.services.languageUtils.getLanguagePartFromCode(lng)) ? 'rtl' : 'ltr';
  }

  createInstance(options = {}, callback) {
    return new I18n(options, callback);
  }

  cloneInstance(options = {}, callback = noop) {
    const mergedOptions = _objectSpread({}, this.options, options, { isClone: true });
    const clone = new I18n(mergedOptions);
    const membersToCopy = ['store', 'services', 'language'];

    membersToCopy.forEach(m => {
      clone[m] = this[m];
    });

    clone.services = _objectSpread({}, this.services);
    clone.services.utils = { hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone) };
    clone.translator = new Translator(clone.services, clone.options);
    clone.translator.on('*', (...args) => {
      clone.emit(...args);
    });
    clone.init(mergedOptions, callback);
    clone.translator.options = clone.options;
    clone.translator.backendConnector.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };

    return clone;
  }
}

const i18next = new I18n();
module.exports = i18next;
