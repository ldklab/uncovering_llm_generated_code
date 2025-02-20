'use strict';

class EventEmitter {
  constructor() {
    this.init();
  }

  init() {
    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || undefined;
  }

  static get defaultMaxListeners() {
    return EventEmitter._defaultMaxListeners;
  }

  static set defaultMaxListeners(value) {
    if (typeof value !== 'number' || value < 0 || Number.isNaN(value)) {
      throw new RangeError(`The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ${value}.`);
    }
    EventEmitter._defaultMaxListeners = value;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new RangeError(`The value of "n" is out of range. It must be a non-negative number. Received ${n}.`);
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners === undefined ? EventEmitter.defaultMaxListeners : this._maxListeners;
  }

  emit(type, ...args) {
    if (type === 'error' && (!this._events || !this._events.error)) {
      const err = new Error('Unhandled error event');
      if (args[0] instanceof Error) throw args[0];
      err.context = args[0];
      throw err;
    }

    const handler = this._events[type];
    if (!handler) return false;

    if (typeof handler === 'function') {
      Reflect.apply(handler, this, args);
    } else {
      for (const listener of handler.slice()) {
        Reflect.apply(listener, this, args);
      }
    }
    return true;
  }

  addListener(type, listener) {
    return this._addListener(type, listener, false);
  }

  on = this.addListener;

  prependListener(type, listener) {
    return this._addListener(type, listener, true);
  }

  once(type, listener) {
    this._checkListener(listener);
    this.on(type, this._onceWrap(type, listener));
    return this;
  }

  prependOnceListener(type, listener) {
    this._checkListener(listener);
    this.prependListener(type, this._onceWrap(type, listener));
    return this;
  }

  removeListener(type, listener) {
    this._checkListener(listener);

    const events = this._events;
    if (!events) return this;

    const listeners = events[type];
    if (!listeners) return this;

    if (listeners === listener || listeners.listener === listener) {
      if (--this._eventsCount === 0) this._events = Object.create(null);
      else delete events[type];
      if (events.removeListener) this.emit('removeListener', type, listeners.listener || listener);
    } else if (Array.isArray(listeners)) {
      const index = listeners.findIndex(l => l === listener || l.listener === listener);
      if (index === -1) return this;

      if (index === 0) listeners.shift();
      else listeners.splice(index, 1);

      if (listeners.length === 1) events[type] = listeners[0];

      if (events.removeListener) this.emit('removeListener', type, listener);
    }

    return this;
  }

  off = this.removeListener;

  removeAllListeners(type) {
    const events = this._events;
    if (!events) return this;

    if (!events.removeListener) {
      if (!type) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[type]) {
        if (--this._eventsCount === 0) this._events = Object.create(null);
        else delete events[type];
      }
      return this;
    }

    if (!type) {
      for (const key of Object.keys(events)) {
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = Object.create(null);
      this._eventsCount = 0;
      return this;
    }

    const listeners = events[type];

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners);
    } else if (Array.isArray(listeners)) {
      for (const listener of listeners.slice().reverse()) {
        this.removeListener(type, listener);
      }
    }

    return this;
  }

  listeners(type) {
    return this._listeners(type, true);
  }

  rawListeners(type) {
    return this._listeners(type, false);
  }

  static listenerCount(emitter, type) {
    return typeof emitter.listenerCount === 'function' ? emitter.listenerCount(type) : new EventEmitter().listenerCount.call(emitter, type);
  }

  listenerCount(type) {
    const events = this._events;
    if (!events) return 0;

    const listeners = events[type];
    return typeof listeners === 'function' ? 1 : listeners ? listeners.length : 0;
  }

  eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  }

  _addListener(type, listener, prepend) {
    this._checkListener(listener);

    const events = this._events || (this._events = Object.create(null), this._eventsCount = 0);
    const existing = events[type];

    if (!existing) {
      events[type] = listener;
      ++this._eventsCount;
    } else if (typeof existing === 'function') {
      events[type] = prepend ? [listener, existing] : [existing, listener];
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    const m = this.getMaxListeners();
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      const w = new Error(`Possible EventEmitter memory leak detected. ${existing.length} ${String(type)} listeners added.`);
      w.name = 'MaxListenersExceededWarning';
      w.emitter = this;
      w.type = type;
      w.count = existing.length;
      this._emitWarning(w);
    }

    return this;
  }

  _checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(`The "listener" argument must be of type Function. Received type ${typeof listener}`);
    }
  }

  _onceWrap(type, listener) {
    const state = { fired: false, target: this, type, listener };
    const wrapped = function() {
      if (!state.fired) {
        this.removeListener(type, wrapped);
        state.fired = true;
        return listener.apply(this, arguments);
      }
    }.bind(state);
    wrapped.listener = listener;
    return wrapped;
  }

  _emitWarning(warning) {
    if (console && console.warn) console.warn(warning);
  }

  _listeners(type, unwrap) {
    const events = this._events;
    if (!events) return [];

    const evlistener = events[type];
    if (!evlistener) return [];

    if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];

    return unwrap ? evlistener.map(l => l.listener || l) : Array.from(evlistener);
  }
}

EventEmitter._defaultMaxListeners = 10;

function once(emitter, name) {
  return new Promise((resolve, reject) => {
    function eventListener(...args) {
      if (errorListener) {
        emitter.removeListener('error', errorListener);
      }
      resolve(args);
    };
    
    let errorListener;
    if (name !== 'error') {
      errorListener = err => {
        emitter.removeListener(name, eventListener);
        reject(err);
      };
      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

module.exports = EventEmitter;
module.exports.once = once;
