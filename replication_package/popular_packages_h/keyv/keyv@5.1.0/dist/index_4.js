"use strict";

// Utilities for module exports and property management
const __defProp = Object.defineProperty;
const __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
const __copyProps = (to, from) => {
  Object.getOwnPropertyNames(from).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(to, key)) __defProp(to, key, {
      get: () => from[key], enumerable: true
    });
  });
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Define classes for event management and caching
class EventManager {
  constructor() {
    this._eventListeners = new Map();
    this._maxListeners = 100;
  }

  addListener(event, listener) { this.on(event, listener); }
  on(event, listener) {
    if (!this._eventListeners.has(event)) this._eventListeners.set(event, []);
    const listeners = this._eventListeners.get(event);
    if (listeners.length >= this._maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible event memory leak detected. ${listeners.length + 1} ${event} listeners added. Use setMaxListeners() to increase limit.`);
    }
    listeners.push(listener);
  }
  
  off(event, listener) {
    const listeners = this._eventListeners.get(event) ?? [];
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
    if (listeners.length === 0) this._eventListeners.delete(event);
  }

  emit(event, ...args) {
    const listeners = this._eventListeners.get(event);
    if (listeners && listeners.length > 0) {
      for (const listener of listeners) {
        listener(...args);
      }
    } else if (event === "error") {
      const error = args[0] instanceof Error ? args[0] : new CustomError(args[0]);
      throw error;
    }
  }

  setMaxListeners(n) { this._maxListeners = n; }
}

class CustomError extends Error {
  constructor(message, context) {
    super(message);
    this.context = context;
    this.name = this.constructor.name;
  }
}

class HooksManager extends EventManager {
  constructor() {
    super();
    this._hookHandlers = new Map();
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
}

class StatsManager extends EventManager {
  constructor(enabled = true) {
    super();
    this.enabled = enabled;
    this.reset();
  }

  reset() {
    this.hits = this.misses = this.sets = this.deletes = this.errors = 0;
  }
}

// Exporting Keyv module
var src_exports = {};
__export(src_exports, {
  Keyv: () => Keyv,
  KeyvHooks: () => KeyvHooks
});
module.exports = __toCommonJS(src_exports);

// Define KeyvHooks and Keyv class for caching with hooks and stats
const KeyvHooks = Object.freeze({
  PRE_SET: "preSet",
  POST_SET: "postSet",
  PRE_GET: "preGet",
  POST_GET: "postGet",
  PRE_GET_MANY: "preGetMany",
  POST_GET_MANY: "postGetMany",
  PRE_DELETE: "preDelete",
  POST_DELETE: "postDelete"
});

class Keyv extends EventManager {
  constructor(store = {}, options = {}) {
    super();
    this.opts = {
      namespace: "keyv",
      serialize: import_serialize.defaultSerialize,
      deserialize: import_serialize.defaultDeserialize,
      store, ...options
    };

    this.hooks = new HooksManager();
    this.stats = new StatsManager(options.stats ?? false);

    if (typeof store.get !== "function") throw new Error("Invalid storage adapter");

    if (store.on && options.emitErrors) {
      store.on("error", error => this.emit("error", error));
    }
  }

  async get(key, options) {
    this.hooks.trigger("preGet", { key });
    // Retrieve and process the cached item
    const rawData = await this.opts.store.get(this._getKeyPrefix(key));
    if (!rawData || this._isExpired(rawData)) {
      this.stats.miss();
      return undefined;
    }
    
    const data = this.opts.deserialize(rawData);
    this.hooks.trigger("postGet", { key, value: data });
    this.stats.hit();
    return data.value;
  }

  _getKeyPrefix(key) { return `${this.opts.namespace}:${key}`; }

  _isExpired(data) {
    return data.expires && Date.now() > data.expires;
  }
}
