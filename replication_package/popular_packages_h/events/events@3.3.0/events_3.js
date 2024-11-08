'use strict';

class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._eventsCount = 0;
    this._maxListeners = undefined;
  }

  static get defaultMaxListeners() {
    return EventEmitter._defaultMaxListeners;
  }

  static set defaultMaxListeners(value) {
    const n = +value;
    if (n < 0 || Number.isNaN(n)) throw new RangeError('Invalid max listeners');
    EventEmitter._defaultMaxListeners = n;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) throw new RangeError('Invalid max listeners');
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners === undefined ? EventEmitter.defaultMaxListeners : this._maxListeners;
  }

  emit(type, ...args) {
    const doError = type === 'error';
    const events = this._events;

    if (doError && events.error === undefined) {
      const er = args[0] instanceof Error ? args[0] : new Error('Unhandled "error" event');
      throw er; 
    }

    const handler = events[type];
    if (!handler) return false;

    if (typeof handler === 'function') {
      Reflect.apply(handler, this, args);
    } else {
      for (let listener of handler) {
        Reflect.apply(listener, this, args);
      }
    }
    return true;
  }

  addListener(type, listener) {
    checkListener(listener);
    return _addListener(this, type, listener, false);
  }
  
  on(type, listener) {
    return this.addListener(type, listener);
  }

  prependListener(type, listener) {
    checkListener(listener);
    return _addListener(this, type, listener, true);
  }

  once(type, listener) {
    checkListener(listener);
    const wrapper = _onceWrap(this, type, listener);
    this.on(type, wrapper);
    return this;
  }

  prependOnceListener(type, listener) {
    checkListener(listener);
    const wrapper = _onceWrap(this, type, listener);
    this.prependListener(type, wrapper);
    return this;
  }

  removeListener(type, listener) {
    const listeners = this._events[type];
    if (!listeners) return this;

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) delete this._events[type];
      
      if (this._events.removeListener) {
        this.emit('removeListener', type, listener);
      }
    }
    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    if (!this._events) return this;

    if (type === undefined) {
      Object.keys(this._events).forEach(eventName => this.removeAllListeners(eventName));
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else {
      const listeners = this._events[type];
      if (listeners) {
        this.removeListener(type, listeners);
        if (listeners.length === 0) delete this._events[type];
      }
    }
    return this;
  }

  listeners(type) {
    const handler = this._events[type];
    if (!handler) return [];
    if (typeof handler === 'function') return [handler];
    return [...handler];
  }

  rawListeners(type) {
    const handler = this._events[type];
    if (!handler) return [];
    return Array.isArray(handler) ? [...handler] : [handler];
  }

  static listenerCount(emitter, type) {
    return emitter.listenerCount(type);
  }

  listenerCount(type) {
    const handler = this._events[type];
    if (!handler) return 0;
    return typeof handler === 'function' ? 1 : handler.length;
  }

  eventNames() {
    return this._eventsCount > 0 ? Object.keys(this._events) : [];
  }
}

function checkListener(listener) {
  if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
}

function _addListener(target, type, listener, prepend) {
  let events = target._events;
  const existing = events[type];

  if (!existing) {
    events[type] = listener;
    target._eventsCount++;
  } else if (typeof existing === 'function') {
    events[type] = prepend ? [listener, existing] : [existing, listener];
  } else {
    prepend ? existing.unshift(listener) : existing.push(listener);
  }

  const maxListeners = target.getMaxListeners();
  if (maxListeners > 0 && existing.length > maxListeners && !existing.warned) {
    existing.warned = true;
    const warning = new Error(`Possible EventEmitter memory leak detected. ${existing.length} "${type}" listeners added.`);
    console.warn(warning);
  }
  return target;
}

function _onceWrap(target, type, listener) {
  const state = { fired: false, target, type, listener };

  function onceWrapper(...args) {
    if (!state.fired) {
      state.target.removeListener(state.type, wrapper);
      state.fired = true;
      state.listener.apply(state.target, args);
    }
  }

  const wrapper = onceWrapper.bind(state);
  wrapper.listener = listener;
  state.wrapFn = wrapper;
  return wrapper;
}

// Default max listeners set for EventEmitter class
EventEmitter._defaultMaxListeners = 10;

// Export the EventEmitter class and the once utility
module.exports = EventEmitter;
module.exports.once = once;

function once(emitter, name) {
  return new Promise((resolve, reject) => {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver(...args) {
      emitter.removeListener('error', errorListener);
      resolve(args);
    }

    if (name !== 'error') {
      emitter.once('error', errorListener);
    }
    emitter.once(name, resolver);
  });
}

function arrayClone(arr, n) {
  return arr.slice(0, n);
}

function unwrapListeners(arr) {
  return arr.map(listener => listener.listener || listener);
}
