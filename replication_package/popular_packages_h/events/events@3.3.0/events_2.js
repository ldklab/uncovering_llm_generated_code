'use strict';

class EventEmitter {
  constructor() {
    EventEmitter.init.call(this);
  }

  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }

  static set defaultMaxListeners(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }

  static init() {
    if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || undefined;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return _getMaxListeners(this);
  }

  emit(type, ...args) {
    let doError = (type === 'error');
    const events = this._events;
    if (events !== undefined)
      doError = (doError && events.error === undefined);
    else if (!doError)
      return false;

    if (doError) {
      const er = args.length > 0 ? args[0] : undefined;
      if (er instanceof Error) throw er;
      const err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
      err.context = er;
      throw err;
    }

    const handler = events[type];
    if (handler === undefined) return false;
    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      const listeners = arrayClone(handler, handler.length);
      for (const listener of listeners)
        ReflectApply(listener, this, args);
    }
    return true;
  }

  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }

  on(type, listener) {
    return this.addListener(type, listener);
  }

  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }

  once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  }

  prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  }

  removeListener(type, listener) {
    let list, events;
    checkListener(listener);
    events = this._events;
    if (events === undefined) return this;
    list = events[type];
    if (!list) return this;

    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0) this._events = Object.create(null);
      else delete events[type];
      if (events.removeListener)
        this.emit('removeListener', type, list.listener || listener);
    } else if (typeof list !== 'function') {
      const index = list.findIndex(l => l === listener || l.listener === listener);
      if (index < 0) return this;
      if (index === 0) list.shift();
      else spliceOne(list, index);
      if (list.length === 1) events[type] = list[0];
      if (events.removeListener)
        this.emit('removeListener', type, list[index].listener || listener);
    }
    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    const events = this._events;
    if (events === undefined) return this;

    if (!events.removeListener) {
      if (arguments.length === 0) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[type] !== undefined) {
        if (--this._eventsCount === 0) this._events = Object.create(null);
        else delete events[type];
      }
      return this;
    }

    if (arguments.length === 0) {
      const keys = Object.keys(events);
      for (const key of keys) {
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
    } else if (listeners !== undefined) {
      for (let i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }
    return this;
  }

  listeners(type) {
    return _listeners(this, type, true);
  }

  rawListeners(type) {
    return _listeners(this, type, false);
  }

  listenerCount(type) {
    const events = this._events;
    if (events !== undefined) {
      const evlistener = events[type];
      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener !== undefined) {
        return evlistener.length;
      }
    }
    return 0;
  }

  eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  }
}

function ReflectApply(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
}

const ReflectOwnKeys = (target) => {
  if (typeof Reflect === 'object' && typeof Reflect.ownKeys === 'function') {
    return Reflect.ownKeys(target);
  } else if (Object.getOwnPropertySymbols) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  } else {
    return Object.getOwnPropertyNames(target);
  }
};

const NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

const defaultMaxListeners = 10;

function _getMaxListeners(self) {
  if (self._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return self._maxListeners;
}

function _addListener(target, type, listener, prepend) {
  let events = target._events;
  checkListener(listener);

  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else if (events.newListener !== undefined) {
    target.emit('newListener', type, listener.listener || listener);
    events = target._events;
  }

  const existing = events[type];

  if (existing === undefined) {
    events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      events[type] = prepend ? [listener, existing] : [existing, listener];
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    const m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      const w = new Error(`Possible EventEmitter memory leak detected. ${existing.length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`);
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

function _onceWrap(target, type, listener) {
  const state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

function onceWrapper(...args) {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    return this.listener.apply(this.target, args);
  }
}

function _listeners(target, type, unwrap) {
  const events = target._events;
  if (events === undefined) return [];

  const evlistener = events[type];
  if (evlistener === undefined) return [];

  if (typeof evlistener === 'function') {
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  }

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

function unwrapListeners(arr) {
  return arr.map(l => l.listener || l);
}

function arrayClone(arr, n) {
  const copy = Array(n);
  for (let i = 0; i < n; ++i) {
    copy[i] = arr[i];
  }
  return copy;
}

function spliceOne(list, index) {
  while (index + 1 < list.length) {
    list[index] = list[index + 1];
    index++;
  }
  list.pop();
}

function once(emitter, name) {
  return new Promise((resolve, reject) => {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver(...args) {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve(args);
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    emitter.addEventListener(name, function wrapListener(arg) {
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

module.exports = EventEmitter;
module.exports.once = once;
