"use strict";

// Helper functions for defining and exporting properties
const defineProperty = (obj, prop, descriptor) => Object.defineProperty(obj, prop, descriptor);
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const exportModule = (target, members) => {
  for (const name in members) {
    defineProperty(target, name, { get: members[name], enumerable: true });
  }
};

// Function to copy properties between objects
const copyProperties = (target, source, exclude, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = Object.getOwnPropertyDescriptor(source, key)) || descriptor.enumerable
        });
      }
    }
  }
  return target;
};

// To handle commonjs module
const toCommonJSModule = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Main exports
const exportsRoot = {};
exportModule(exportsRoot, {
  Keyv,
  KeyvHooks,
  default: Keyv
});

module.exports = toCommonJSModule(exportsRoot);

// External serialization library
const { defaultSerialize, defaultDeserialize } = require("@keyv/serialize");

// EventManager Class
class EventManager {
  constructor() {
    this._eventListeners = new Map();
    this._maxListeners = 100;
  }
  
  maxListeners() {
    return this._maxListeners;
  }

  addListener(event, listener) {
    this.on(event, listener);
  }

  on(event, listener) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      if (listeners.length >= this._maxListeners) {
        console.warn(`MaxListenersExceededWarning: ${event} listeners added. Use setMaxListeners() to increase limit.`);
      }
      listeners.push(listener);
    }
  }

  removeListener(event, listener) {
    this.off(event, listener);
  }

  off(event, listener) {
    const listeners = this._eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      this._eventListeners.delete(event);
    }
  }

  emit(event, ...args) {
    const listeners = this._eventListeners.get(event);
    if (listeners && listeners.length > 0) {
      for (const listener of listeners) {
        listener(...args);
      }
    } else if (event === "error") {
      throw args[0] instanceof Error ? args[0] : new CustomError(args[0]);
    }
  }

  listeners(event) {
    return this._eventListeners.get(event) || [];
  }

  removeAllListeners(event) {
    event ? this._eventListeners.delete(event) : this._eventListeners.clear();
  }

  setMaxListeners(n) {
    this._maxListeners = n;
  }
}

// CustomError Class
class CustomError extends Error {
  constructor(message, context) {
    super(message);
    this.context = context;
    Error.captureStackTrace?.(this, CustomError);
    this.name = this.constructor.name;
  }
}

// HooksManager Class
class HooksManager extends EventManager {
  constructor() {
    super();
    this._hookHandlers = new Map();
  }

  addHandler(event, handler) {
    const handlers = this._hookHandlers.get(event) || [];
    handlers.push(handler);
    this._hookHandlers.set(event, handlers);
  }

  removeHandler(event, handler) {
    const handlers = this._hookHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  trigger(event, data) {
    const handlers = this._hookHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          this.emit("error", new Error(`Error in hook handler for event "${event}": ${error.message}`));
        }
      }
    }
  }

  get handlers() {
    return new Map(this._hookHandlers);
  }
}

// StatsManager Class
class StatsManager extends EventManager {
  constructor(enabled = true) {
    super();
    this.enabled = enabled;
    this.reset();
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
  }

  hit() {
    if (this.enabled) this.hits++;
  }

  miss() {
    if (this.enabled) this.misses++;
  }

  set() {
    if (this.enabled) this.sets++;
  }

  delete() {
    if (this.enabled) this.deletes++;
  }
}

// KeyvHooks Enum
const KeyvHooks = {
  PRE_SET: "preSet",
  POST_SET: "postSet",
  PRE_GET: "preGet",
  POST_GET: "postGet",
  PRE_GET_MANY: "preGetMany",
  POST_GET_MANY: "postGetMany",
  PRE_DELETE: "preDelete",
  POST_DELETE: "postDelete"
};

// Iterable adapters for storage
const iterableAdapters = ["sqlite", "postgres", "mysql", "mongo", "redis", "tiered"];

// Keyv Class
class Keyv extends EventManager {
  constructor(store, options = {}) {
    super();
    store = store || {};
    this.opts = {
      namespace: "keyv",
      serialize: defaultSerialize,
      deserialize: defaultDeserialize,
      emitErrors: true,
      store: new Map(),
      ...options
    };

    if (store.get) {
      this.opts.store = store;
    } else {
      this.opts = { ...this.opts, ...store };
    }

    if (this.opts.compression) {
      const compression = this.opts.compression;
      this.opts.serialize = compression.serialize.bind(compression);
      this.opts.deserialize = compression.deserialize.bind(compression);
    }

    if (this.opts.store) {
      if (!this._isValidStorageAdapter(this.opts.store)) {
        throw new Error("Invalid storage adapter");
      }
      if (typeof this.opts.store.on === "function" && this.opts.emitErrors) {
        this.opts.store.on("error", (error) => this.emit("error", error));
      }
      this.opts.store.namespace = this.opts.namespace;
      if (typeof this.opts.store[Symbol.iterator] === "function" && this.opts.store instanceof Map) {
        this.iterator = this.generateIterator(this.opts.store);
      } else if ("iterator" in this.opts.store && this.opts.store.opts && this._checkIterableAdapter()) {
        this.iterator = this.generateIterator(this.opts.store.iterator.bind(this.opts.store));
      }
    }

    if (this.opts.stats) {
      this.stats.enabled = this.opts.stats;
    }

    this.hooks = new HooksManager();
    this.stats = new StatsManager(false);
  }

  generateIterator(iterator) {
    const func = async function* () {
      for await (const [key, raw] of typeof iterator === "function" ? iterator(this.opts.store.namespace) : iterator) {
        const data = await this.opts.deserialize(raw);
        if (this.opts.store.namespace && !key.includes(this.opts.store.namespace)) {
          continue;
        }
        if (typeof data.expires === "number" && Date.now() > data.expires) {
          await this.delete(key);
          continue;
        }
        yield [this._getKeyUnprefix(key), data.value];
      }
    };
    return func.bind(this);
  }

  _checkIterableAdapter() {
    return iterableAdapters.includes(this.opts.store.opts.dialect) || iterableAdapters.some((element) => this.opts.store.opts.url.includes(element));
  }

  _getKeyPrefix(key) {
    return `${this.opts.namespace}:${key}`;
  }

  _getKeyPrefixArray(keys) {
    return keys.map((key) => `${this.opts.namespace}:${key}`);
  }

  _getKeyUnprefix(key) {
    return key.split(":").splice(1).join(":");
  }

  _isValidStorageAdapter(store) {
    return store instanceof Map || (typeof store.get === "function" && typeof store.set === "function" && typeof store.delete === "function" && typeof store.clear === "function");
  }

  async get(key, options) {
    const { store } = this.opts;
    const isArray = Array.isArray(key);
    const keyPrefixed = isArray ? this._getKeyPrefixArray(key) : this._getKeyPrefix(key);
    const isDataExpired = (data) => typeof data.expires === "number" && Date.now() > data.expires;

    if (isArray) {
      this.hooks.trigger(KeyvHooks.PRE_GET_MANY, { keys: keyPrefixed });
      
      if (store.getMany === undefined) {
        const promises = keyPrefixed.map(async (key) => {
          const rawData = await store.get(key);
          const deserializedData = typeof rawData === "string" || this.opts.compression ? await this.opts.deserialize(rawData) : rawData;
          if (!deserializedData) return undefined;
          
          if (isDataExpired(deserializedData)) {
            await this.delete(key);
            return undefined;
          }
          return options?.raw ? deserializedData : deserializedData.value;
        });
        
        const deserializedRows = await Promise.allSettled(promises);
        const result = deserializedRows.map(row => row.value);
        this.hooks.trigger(KeyvHooks.POST_GET_MANY, result);
        if (result.length > 0) this.stats.hit();
        return result;
      }
      
      const rawData = await store.getMany(keyPrefixed);
      const result = [];

      for (const index in rawData) {
        let row = rawData[index];
        if (typeof row === "string") {
          row = await this.opts.deserialize(row);
        }
        if (!row) {
          result.push(undefined);
          continue;
        }
        if (isDataExpired(row)) {
          await this.delete(key[index]);
          result.push(undefined);
          continue;
        }
        const value = options?.raw ? row : row.value;
        result.push(value);
      }
      
      this.hooks.trigger(KeyvHooks.POST_GET_MANY, result);
      if (result.length > 0) this.stats.hit();
      return result;
    }

    this.hooks.trigger(KeyvHooks.PRE_GET, { key: keyPrefixed });
    const rawData = await store.get(keyPrefixed);
    const deserializedData = typeof rawData === "string" || this.opts.compression ? await this.opts.deserialize(rawData) : rawData;

    if (!deserializedData) {
      this.stats.miss();
      return undefined;
    }

    if (isDataExpired(deserializedData)) {
      await this.delete(key);
      this.stats.miss();
      return undefined;
    }

    this.hooks.trigger(KeyvHooks.POST_GET, { key: keyPrefixed, value: deserializedData });
    this.stats.hit();
    return options?.raw ? deserializedData : deserializedData.value;
  }

  async set(key, value, ttl) {
    this.hooks.trigger(KeyvHooks.PRE_SET, { key, value, ttl });
    const keyPrefixed = this._getKeyPrefix(key);

    if (typeof ttl === "undefined") ttl = this.opts.ttl;
    if (ttl === 0) ttl = undefined;

    const { store } = this.opts;
    const expires = typeof ttl === "number" ? Date.now() + ttl : null;
    if (typeof value === "symbol") this.emit("error", "symbol cannot be serialized");

    const formattedValue = { value, expires };
    const serializedValue = await this.opts.serialize(formattedValue);
    
    await store.set(keyPrefixed, serializedValue, ttl);
    this.hooks.trigger(KeyvHooks.POST_SET, { key: keyPrefixed, value: serializedValue, ttl });
    this.stats.set();
    return true;
  }

  async delete(key) {
    const { store } = this.opts;
    if (Array.isArray(key)) {
      const keyPrefixedArray = this._getKeyPrefixArray(key);
      this.hooks.trigger(KeyvHooks.PRE_DELETE, { key: keyPrefixedArray });
      
      if (store.deleteMany !== undefined) return store.deleteMany(keyPrefixedArray);
      
      const promises = keyPrefixedArray.map(async (key) => store.delete(key));
      const results = await Promise.allSettled(promises);
      const returnResult = results.every(res => res.value === true);
      
      this.hooks.trigger(KeyvHooks.POST_DELETE, returnResult);
      return returnResult;
    }

    const keyPrefixed = this._getKeyPrefix(key);
    const result = await store.delete(keyPrefixed);
    this.hooks.trigger(KeyvHooks.POST_DELETE, result);
    this.stats.delete();
    return result;
  }

  async clear() {
    this.emit("clear");
    const { store } = this.opts;
    await store.clear();
  }

  async has(key) {
    const keyPrefixed = this._getKeyPrefix(key);
    const { store } = this.opts;

    if (store.has !== undefined && !(store instanceof Map)) {
      return store.has(keyPrefixed);
    }

    const rawData = await store.get(keyPrefixed);
    return rawData ? await this.opts.deserialize(rawData).then(data => data && (!data.expires || data.expires > Date.now())) : false;
  }

  async disconnect() {
    const { store } = this.opts;
    this.emit("disconnect");
    if (typeof store.disconnect === "function") {
      return store.disconnect();
    }
  }
}

module.exports = Keyv;
