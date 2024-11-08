'use strict';

class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._eventsCount = 0;
    this._maxListeners = undefined;
  }

  static defaultMaxListeners = 10;

  static listenerCount(emitter, type) {
    return emitter.listenerCount(type);
  }

  static checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners === undefined ? EventEmitter.defaultMaxListeners : this._maxListeners;
  }

  emit(type, ...args) {
    const doError = (type === 'error');
    const events = this._events;

    if (doError && (!events || !events[type])) {
      const err = args[0] instanceof Error ? args[0] : new Error('Unhandled "error" event');
      throw err; 
    }

    if (!events[type]) return false;

    const handler = events[type];
    if (typeof handler === 'function') {
      handler.apply(this, args);
    } else {
      handler.slice().forEach(fn => fn.apply(this, args));
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
    EventEmitter.checkListener(listener);
    const wrapped = this._onceWrap(type, listener);
    this.on(type, wrapped);
    return this;
  }

  prependOnceListener(type, listener) {
    EventEmitter.checkListener(listener);
    const wrapped = this._onceWrap(type, listener);
    this.prependListener(type, wrapped);
    return this;
  }

  removeListener(type, listener) {
    return this._modifyListeners(type, listener, false);
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    if (!this._events) {
      return this;
    }

    if (!type) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else {
      if (this._events[type]) {
        delete this._events[type];
        --this._eventsCount;
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

  listenerCount(type) {
    const evlistener = this._events[type];
    return typeof evlistener === 'function' ? 1 : (evlistener ? evlistener.length : 0);
  }

  eventNames() {
    return Object.keys(this._events);
  }

  _addListener(type, listener, prepend) {
    EventEmitter.checkListener(listener);
    const events = this._events;
    const existing = events[type];

    if (!existing) {
      events[type] = listener;
      this._eventsCount++;
    } else {
      if (typeof existing === 'function') {
        events[type] = prepend ? [listener, existing] : [existing, listener];
      } else {
        prepend ? existing.unshift(listener) : existing.push(listener);
      }
    }

    const maxListeners = this.getMaxListeners();
    if (maxListeners > 0 && events[type].length > maxListeners) {
      const w = new Error(`Possible EventEmitter memory leak detected. ${events[type].length} ${String(type)} listeners added. Use emitter.setMaxListeners() to increase limit`);
      w.name = 'MaxListenersExceededWarning';
      console.warn(w);
    }

    return this;
  }

  _modifyListeners(type, listener, prepend) {
    EventEmitter.checkListener(listener);

    if (!this._events || !this._events[type]) return this;

    const list = this._events[type];
    if (list === listener || list.listener === listener) {
      delete this._events[type];
    } else if (Array.isArray(list)) {
      const i = list.indexOf(listener);
      if (i < 0) return this;
      list.splice(i, 1);
    }

    return this;
  }

  _listeners(type, unwrap) {
    const events = this._events[type];
    if (!events) return [];

    if (typeof events === 'function') {
      return unwrap ? [events.listener || events] : [events];
    }

    return unwrap ? events.map(handler => handler.listener || handler) : events.slice();
  }

  _onceWrap(type, listener) {
    const state = { fired: false, target: this, type, listener };
    const wrapped = function(...args) {
      if (!state.fired) {
        state.target.removeListener(state.type, wrapped);
        state.fired = true;
        return state.listener.apply(state.target, args);
      }
    };
    wrapped.listener = listener;
    return wrapped;
  }
}

// Compatibility functions
function ReflectApply(target, thisArg, args) {
  return Function.prototype.apply.call(target, thisArg, args);
}

function ReflectOwnKeys(obj) {
  return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
}

function arrayClone(arr) {
  return arr.slice();
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) {
    list[index] = list[index + 1];
  }
  list.pop();
}

// Exporting EventEmitter class
module.exports = EventEmitter;
