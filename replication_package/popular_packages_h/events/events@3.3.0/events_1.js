'use strict';

class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._eventsCount = 0;
    this._maxListeners = undefined;
  }
  
  static defaultMaxListeners = 10;

  static set defaultMaxListeners(val) {
    if (typeof val !== 'number' || val < 0) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range.');
    }
    EventEmitter._defaultMaxListeners = val;
  }

  static get defaultMaxListeners() {
    return this._defaultMaxListeners || 10;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new RangeError('The value of "n" is out of range.');
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners !== undefined ? this._maxListeners : EventEmitter.defaultMaxListeners;
  }

  emit(type, ...args) {
    let doError = type === 'error';
    let handler = this._events[type];

    if (!handler && doError) {
      const err = args[0] instanceof Error ? args[0] : new Error('Unhandled "error" event.');
      err.context = args[0];
      throw err;
    } else if (!handler) {
      return false;
    }

    if (typeof handler === 'function') {
      Reflect.apply(handler, this, args);
    } else {
      for (const listener of [...handler]) {
        Reflect.apply(listener, this, args);
      }
    }

    return true;
  }

  addListener(type, listener) {
    return this._addListener(type, listener, false);
  }

  on(type, listener) {
    return this.addListener(type, listener);
  }

  prependListener(type, listener) {
    return this._addListener(type, listener, true);
  }

  once(type, listener) {
    this._addListener(type, this._onceWrap(type, listener), false);
    return this;
  }

  prependOnceListener(type, listener) {
    this._addListener(type, this._onceWrap(type, listener), true);
    return this;
  }

  removeListener(type, listener) {
    const events = this._events[type];
    if (!events) return this;
    
    const removeListenerEvent = this._events.removeListener;
    
    if (typeof events === 'function') {
      if (events === listener || events.listener === listener) {
        delete this._events[type];
        if (removeListenerEvent) {
          this.emit('removeListener', type, listener);
        }
      }
    } else {
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i] === listener || events[i].listener === listener) {
          events.splice(i, 1);
          if (events.length === 1) {
            this._events[type] = events[0];
          }
          if (removeListenerEvent) {
            this.emit('removeListener', type, events[i]);
          }
          break;
        }
      }
    }

    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    if (type) {
      delete this._events[type];
    } else {
      this._events = Object.create(null);
    }
    this._eventsCount = 0;
    return this;
  }

  listeners(type) {
    const events = this._events[type];
    return events ? (typeof events === 'function' ? [events] : [...events]) : [];
  }

  rawListeners(type) {
    return this.listeners(type).map(l => l.listener || l);
  }

  listenerCount(type) {
    const events = this._events[type];
    return events ? (typeof events === 'function' ? 1 : events.length) : 0;
  }

  eventNames() {
    return Object.getOwnPropertyNames(this._events);
  }

  _addListener(type, listener, prepend) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    const existing = this._events[type];
    if (!existing) {
      this._events[type] = listener;
      this._eventsCount++;
    } else if (typeof existing === 'function') {
      this._events[type] = prepend ? [listener, existing] : [existing, listener];
    } else {
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    const maxListeners = this.getMaxListeners();
    if (maxListeners > 0 && this.listenerCount(type) > maxListeners) {
      console.warn(`Possible EventEmitter memory leak detected. ${this.listenerCount(type)} ${type} listeners added. Use emitter.setMaxListeners() to increase limit.`);
    }
    return this;
  }

  _onceWrap(type, listener) {
    const state = { fired: false, target: this, type, listener };
    function onceWrapper(...args) {
      if (!state.fired) {
        this.removeListener(type, onceWrapper);
        state.fired = true;
        Reflect.apply(listener, this, args);
      }
    }
    onceWrapper.listener = listener;
    return onceWrapper;
  }

  static listenerCount(emitter, type) {
    return typeof emitter.listenerCount === 'function' ? emitter.listenerCount(type) : emitter.listenerCount.call(emitter, type);
  }

  static once(emitter, name) {
    return new Promise((resolve, reject) => {
      function resolver(...args) {
        emitter.removeListener('error', errorListener);
        resolve(args);
      }
      
      function errorListener(err) {
        emitter.removeListener(name, resolver);
        reject(err);
      }

      if (name !== 'error') {
        emitter.once('error', errorListener);
      }
      emitter.once(name, resolver);
    });
  }
}

Reflect.apply = Reflect.apply || function(func, thisArg, args) {
  return Function.prototype.apply.call(func, thisArg, args);
};

Object.defineProperty(EventEmitter.prototype, 'constructor', {
  value: EventEmitter,
  configurable: true,
  enumerable: false,
  writable: true
});

module.exports = EventEmitter;
