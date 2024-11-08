"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Keyv: () => Keyv,
  KeyvHooks: () => KeyvHooks,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_serialize = require("@keyv/serialize");

// src/event-manager.ts
var EventManager = class {
  _eventListeners;
  _maxListeners;
  constructor() {
    this._eventListeners = /* @__PURE__ */ new Map();
    this._maxListeners = 100;
  }
  maxListeners() {
    return this._maxListeners;
  }
  // Add an event listener
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
        console.warn(`MaxListenersExceededWarning: Possible event memory leak detected. ${listeners.length + 1} ${event} listeners added. Use setMaxListeners() to increase limit.`);
      }
      listeners.push(listener);
    }
  }
  // Remove an event listener
  removeListener(event, listener) {
    this.off(event, listener);
  }
  off(event, listener) {
    const listeners = this._eventListeners.get(event) ?? [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      this._eventListeners.delete(event);
    }
  }
  // Emit an event
  emit(event, ...arguments_) {
    const listeners = this._eventListeners.get(event);
    if (listeners && listeners.length > 0) {
      for (const listener of listeners) {
        listener(...arguments_);
      }
    } else if (event === "error") {
      if (arguments_[0] instanceof Error) {
        throw arguments_[0];
      } else {
        const error = new CustomError(arguments_[0]);
        error.context = arguments_[0];
        throw error;
      }
    }
  }
  // Get all listeners for a specific event
  listeners(event) {
    return this._eventListeners.get(event) ?? [];
  }
  // Remove all listeners for a specific event
  removeAllListeners(event) {
    if (event) {
      this._eventListeners.delete(event);
    } else {
      this._eventListeners.clear();
    }
  }
  // Set the maximum number of listeners for a single event
  setMaxListeners(n) {
    this._maxListeners = n;
  }
};
var CustomError = class _CustomError extends Error {
  context;
  constructor(message, context) {
    super(message);
    this.context = context;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _CustomError);
    }
    this.name = this.constructor.name;
  }
};
var event_manager_default = EventManager;

// src/hooks-manager.ts
var HooksManager = class extends event_manager_default {
  _hookHandlers;
  constructor() {
    super();
    this._hookHandlers = /* @__PURE__ */ new Map();
  }
  // Adds a handler function for a specific event
  addHandler(event, handler) {
    const eventHandlers = this._hookHandlers.get(event);
    if (eventHandlers) {
      eventHandlers.push(handler);
    } else {
      this._hookHandlers.set(event, [handler]);
    }
  }
  // Removes a specific handler function for a specific event
  removeHandler(event, handler) {
    const eventHandlers = this._hookHandlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index !== -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }
  // Triggers all handlers for a specific event with provided data
  trigger(event, data) {
    const eventHandlers = this._hookHandlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          this.emit("error", new Error(`Error in hook handler for event "${event}": ${error.message}`));
        }
      }
    }
  }
  // Provides read-only access to the current handlers
  get handlers() {
    return new Map(this._hookHandlers);
  }
};
var hooks_manager_default = HooksManager;

// src/stats-manager.ts
var StatsManager = class extends event_manager_default {
  enabled = true;
  hits = 0;
  misses = 0;
  sets = 0;
  deletes = 0;
  errors = 0;
  constructor(enabled) {
    super();
    if (enabled !== void 0) {
      this.enabled = enabled;
    }
    this.reset();
  }
  hit() {
    if (this.enabled) {
      this.hits++;
    }
  }
  miss() {
    if (this.enabled) {
      this.misses++;
    }
  }
  set() {
    if (this.enabled) {
      this.sets++;
    }
  }
  delete() {
    if (this.enabled) {
      this.deletes++;
    }
  }
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
  }
};
var stats_manager_default = StatsManager;

// src/index.ts
var KeyvHooks = /* @__PURE__ */ ((KeyvHooks2) => {
  KeyvHooks2["PRE_SET"] = "preSet";
  KeyvHooks2["POST_SET"] = "postSet";
  KeyvHooks2["PRE_GET"] = "preGet";
  KeyvHooks2["POST_GET"] = "postGet";
  KeyvHooks2["PRE_GET_MANY"] = "preGetMany";
  KeyvHooks2["POST_GET_MANY"] = "postGetMany";
  KeyvHooks2["PRE_DELETE"] = "preDelete";
  KeyvHooks2["POST_DELETE"] = "postDelete";
  return KeyvHooks2;
})(KeyvHooks || {});
var iterableAdapters = [
  "sqlite",
  "postgres",
  "mysql",
  "mongo",
  "redis",
  "tiered"
];
var Keyv = class extends event_manager_default {
  opts;
  iterator;
  hooks = new hooks_manager_default();
  stats = new stats_manager_default(false);
  constructor(store, options) {
    super();
    options ??= {};
    store ??= {};
    this.opts = {
      namespace: "keyv",
      serialize: import_serialize.defaultSerialize,
      deserialize: import_serialize.defaultDeserialize,
      emitErrors: true,
      // @ts-expect-error - Map is not a KeyvStoreAdapter
      store: /* @__PURE__ */ new Map(),
      ...options
    };
    if (store && store.get) {
      this.opts.store = store;
    } else {
      this.opts = {
        ...this.opts,
        ...store
      };
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
  }
  generateIterator(iterator) {
    const function_ = async function* () {
      for await (const [key, raw] of typeof iterator === "function" ? iterator(this.opts.store.namespace) : iterator) {
        const data = await this.opts.deserialize(raw);
        if (this.opts.store.namespace && !key.includes(this.opts.store.namespace)) {
          continue;
        }
        if (typeof data.expires === "number" && Date.now() > data.expires) {
          this.delete(key);
          continue;
        }
        yield [this._getKeyUnprefix(key), data.value];
      }
    };
    return function_.bind(this);
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
    return store instanceof Map || typeof store.get === "function" && typeof store.set === "function" && typeof store.delete === "function" && typeof store.clear === "function";
  }
  async get(key, options) {
    const { store } = this.opts;
    const isArray = Array.isArray(key);
    const keyPrefixed = isArray ? this._getKeyPrefixArray(key) : this._getKeyPrefix(key);
    const isDataExpired = (data) => typeof data.expires === "number" && Date.now() > data.expires;
    if (isArray) {
      this.hooks.trigger("preGetMany" /* PRE_GET_MANY */, { keys: keyPrefixed });
      if (store.getMany === void 0) {
        const promises = keyPrefixed.map(async (key2) => {
          const rawData3 = await store.get(key2);
          const deserializedRow = typeof rawData3 === "string" || this.opts.compression ? await this.opts.deserialize(rawData3) : rawData3;
          if (deserializedRow === void 0 || deserializedRow === null) {
            return void 0;
          }
          if (isDataExpired(deserializedRow)) {
            await this.delete(key2);
            return void 0;
          }
          return options?.raw ? deserializedRow : deserializedRow.value;
        });
        const deserializedRows = await Promise.allSettled(promises);
        const result2 = deserializedRows.map((row) => row.value);
        this.hooks.trigger("postGetMany" /* POST_GET_MANY */, result2);
        if (result2.length > 0) {
          this.stats.hit();
        }
        return result2;
      }
      const rawData2 = await store.getMany(keyPrefixed);
      const result = [];
      for (const index in rawData2) {
        let row = rawData2[index];
        if (typeof row === "string") {
          row = await this.opts.deserialize(row);
        }
        if (row === void 0 || row === null) {
          result.push(void 0);
          continue;
        }
        if (isDataExpired(row)) {
          await this.delete(key[index]);
          result.push(void 0);
          continue;
        }
        const value = options?.raw ? row : row.value;
        result.push(value);
      }
      this.hooks.trigger("postGetMany" /* POST_GET_MANY */, result);
      if (result.length > 0) {
        this.stats.hit();
      }
      return result;
    }
    this.hooks.trigger("preGet" /* PRE_GET */, { key: keyPrefixed });
    const rawData = await store.get(keyPrefixed);
    const deserializedData = typeof rawData === "string" || this.opts.compression ? await this.opts.deserialize(rawData) : rawData;
    if (deserializedData === void 0 || deserializedData === null) {
      this.stats.miss();
      return void 0;
    }
    if (isDataExpired(deserializedData)) {
      await this.delete(key);
      this.stats.miss();
      return void 0;
    }
    this.hooks.trigger("postGet" /* POST_GET */, { key: keyPrefixed, value: deserializedData });
    this.stats.hit();
    return options?.raw ? deserializedData : deserializedData.value;
  }
  async set(key, value, ttl) {
    this.hooks.trigger("preSet" /* PRE_SET */, { key, value, ttl });
    const keyPrefixed = this._getKeyPrefix(key);
    if (typeof ttl === "undefined") {
      ttl = this.opts.ttl;
    }
    if (ttl === 0) {
      ttl = void 0;
    }
    const { store } = this.opts;
    const expires = typeof ttl === "number" ? Date.now() + ttl : null;
    if (typeof value === "symbol") {
      this.emit("error", "symbol cannot be serialized");
    }
    const formattedValue = { value, expires };
    const serializedValue = await this.opts.serialize(formattedValue);
    await store.set(keyPrefixed, serializedValue, ttl);
    this.hooks.trigger("postSet" /* POST_SET */, { key: keyPrefixed, value: serializedValue, ttl });
    this.stats.set();
    return true;
  }
  async delete(key) {
    const { store } = this.opts;
    if (Array.isArray(key)) {
      const keyPrefixed2 = this._getKeyPrefixArray(key);
      this.hooks.trigger("preDelete" /* PRE_DELETE */, { key: keyPrefixed2 });
      if (store.deleteMany !== void 0) {
        return store.deleteMany(keyPrefixed2);
      }
      const promises = keyPrefixed2.map(async (key2) => store.delete(key2));
      const results = await Promise.allSettled(promises);
      const returnResult = results.every((x) => x.value === true);
      this.hooks.trigger("postDelete" /* POST_DELETE */, returnResult);
      return returnResult;
    }
    const keyPrefixed = this._getKeyPrefix(key);
    const result = store.delete(keyPrefixed);
    this.hooks.trigger("postDelete" /* POST_DELETE */, result);
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
    if (store.has !== void 0 && !(store instanceof Map)) {
      return store.has(keyPrefixed);
    }
    const rawData = await store.get(keyPrefixed);
    if (rawData) {
      const data = this.opts.deserialize(rawData);
      if (data) {
        if (data.expires === void 0 || data.expires === null) {
          return true;
        }
        return data.expires > Date.now();
      }
    }
    return false;
  }
  async disconnect() {
    const { store } = this.opts;
    this.emit("disconnect");
    if (typeof store.disconnect === "function") {
      return store.disconnect();
    }
  }
};
var src_default = Keyv;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Keyv,
  KeyvHooks
});
