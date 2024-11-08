'use strict';

class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._eventsCount = 0;
    this._maxListeners = EventEmitter.defaultMaxListeners;
  }

  static defaultMaxListeners = 10;

  static once(emitter, name) {
    return new Promise((resolve, reject) => {
      function eventListener(...args) {
        if (errorListener !== undefined) {
          emitter.removeListener('error', errorListener);
        }
        resolve(args);
      }
      let errorListener;

      if (name !== 'error') {
        errorListener = (err) => {
          emitter.removeListener(name, eventListener);
          reject(err);
        };
        emitter.once('error', errorListener);
      }

      emitter.once(name, eventListener);
    });
  }

  emit(type, ...args) {
    if (type === 'error' && (!this._events.error || this._events.error.length === 0)) {
      const err = args[0] instanceof Error ? args[0] : new Error('Unhandled error.');
      throw err;
    }

    const handler = this._events[type];
    if (!handler) return false;

    if (typeof handler === 'function') {
      handler.apply(this, args);
    } else {
      handler.forEach(listener => listener.apply(this, args));
    }

    return true;
  }

  addListener(type, listener, prepend = false) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this._events[type]) {
      this._events[type] = listener;
      this._eventsCount++;
    } else {
      if (typeof this._events[type] === 'function') {
        this._events[type] = prepend ? [listener, this._events[type]] : [this._events[type], listener];
      } else {
        prepend ? this._events[type].unshift(listener) : this._events[type].push(listener);
      }

      const m = this.getMaxListeners();
      if (m > 0 && this._events[type].length > m && !this._events[type].warned) {
        this._events[type].warned = true;
        const w = new Error(`Possible EventEmitter memory leak detected. ${this._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`);
        w.name = 'MaxListenersExceededWarning';
        console.warn(w);
      }
    }

    if (type !== 'newListener') {
      this.emit('newListener', type, listener);
    }

    return this;
  }

  on(type, listener) {
    return this.addListener(type, listener);
  }

  prependListener(type, listener) {
    return this.addListener(type, listener, true);
  }

  once(type, listener) {
    const wrapped = (...args) => {
      this.removeListener(type, wrapped);
      listener.apply(this, args);
    };
    wrapped.listener = listener;
    return this.on(type, wrapped);
  }

  prependOnceListener(type, listener) {
    const wrapped = (...args) => {
      this.removeListener(type, wrapped);
      listener.apply(this, args);
    };
    wrapped.listener = listener;
    return this.prependListener(type, wrapped);
  }

  removeListener(type, listener) {
    const listeners = this._events[type];
    if (!listeners) return this;

    if (listeners === listener || listeners.listener === listener) {
      delete this._events[type];
      this._eventsCount--;
    } else if (Array.isArray(listeners)) {
      const index = listeners.findIndex(l => l === listener || l.listener === listener);
      if (index >= 0) {
        listeners.splice(index, 1);
        if (listeners.length === 0) delete this._events[type];
      }
    }

    if (this._events.removeListener) {
      this.emit('removeListener', type, listener);
    }

    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    if (!this._events) return this;

    if (type) {
      delete this._events[type];
      this._eventsCount--;
    } else {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }

    return this;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new RangeError('n must be a non-negative number');
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners !== undefined ? this._maxListeners : EventEmitter.defaultMaxListeners;
  }

  listeners(type) {
    const handlers = this._events[type];
    if (!handlers) return [];
    return typeof handlers === 'function' ? [handlers] : [...handlers];
  }

  rawListeners(type) {
    return this.listeners(type);
  }

  listenerCount(type) {
    return this.listeners(type).length;
  }

  eventNames() {
    return Object.keys(this._events);
  }
}

module.exports = EventEmitter;
