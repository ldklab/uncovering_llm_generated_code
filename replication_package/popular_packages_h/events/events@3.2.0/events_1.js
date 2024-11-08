'use strict';

const R = typeof Reflect === 'object' ? Reflect : null;
const ReflectApply = R && typeof R.apply === 'function' ? R.apply : (target, receiver, args) => Function.prototype.apply.call(target, receiver, args);

let ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = target => Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
} else {
  ReflectOwnKeys = target => Object.getOwnPropertyNames(target);
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

const NumberIsNaN = Number.isNaN || (value => value !== value);

class EventEmitter {
  constructor() {
    EventEmitter.init.call(this);
  }

  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }

  static set defaultMaxListeners(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError(`The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ${arg}.`);
    }
    defaultMaxListeners = arg;
  }

  static once(emitter, name) {
    return new Promise((resolve, reject) => {
      const eventListener = function() {
        if (errorListener !== undefined) {
          emitter.removeListener('error', errorListener);
        }
        resolve([].slice.call(arguments));
      };
      let errorListener;

      if (name !== 'error') {
        errorListener = function(err) {
          emitter.removeListener(name, eventListener);
          reject(err);
        };

        emitter.once('error', errorListener);
      }

      emitter.once(name, eventListener);
    });
  }

  static listenerCount(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
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
      throw new RangeError(`The value of "n" is out of range. It must be a non-negative number. Received ${n}.`);
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return _getMaxListeners(this);
  }

  emit(type, ...args) {
    const doError = (type === 'error');

    const events = this._events;
    if (events !== undefined)
      doError = (doError && events.error === undefined);
    else if (!doError)
      return false;

    if (doError) {
      const er = args.length > 0 ? args[0] : undefined;
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error('Unhandled error.' + (er ? ` (${er.message})` : ''));
      err.context = er;
      throw err;
    }

    const handler = events[type];

    if (handler === undefined)
      return false;

    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      const len = handler.length;
      const listeners = arrayClone(handler, len);
      for (let i = 0; i < len; ++i)
        ReflectApply(listeners[i], this, args);
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
    checkListener(listener);

    const events = this._events;
    if (events === undefined)
      return this;

    const list = events[type];
    if (list === undefined)
      return this;

    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0)
        this._events = Object.create(null);
      else {
        delete events[type];
        if (events.removeListener)
          this.emit('removeListener', type, list.listener || listener);
      }
    } else if (typeof list !== 'function') {
      let position = -1;

      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener || list[i].listener === listener) {
          position = i;
          break;
        }
      }

      if (position < 0)
        return this;

      if (position === 0)
        list.shift();
      else {
        spliceOne(list, position);
      }

      if (list.length === 1)
        events[type] = list[0];

      if (events.removeListener !== undefined)
        this.emit('removeListener', type, list[position].listener || listener);
    }

    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    const events = this._events;
    if (events === undefined)
      return this;

    if (events.removeListener === undefined) {
      if (arguments.length === 0) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[type] !== undefined) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else
          delete events[type];
      }
      return this;
    }

    if (arguments.length === 0) {
      const eventKeys = Object.keys(events);
      for (const key of eventKeys) {
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

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError(`The "listener" argument must be of type Function. Received type ${typeof listener}`);
  }
}

function arrayClone(arr, n) {
  const copy = new Array(n);
  for (let i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  return arr.map(listener => listener.listener || listener);
}

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  const state = { fired: false, wrapFn: undefined, target, type, listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

function _addListener(target, type, listener, prepend) {
  let events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else if (events.newListener !== undefined) {
    target.emit('newListener', type, listener.listener ? listener.listener : listener);
    events = target._events;
  }
  const existing = events[type];

  if (existing === undefined) {
    events[type] = listener;
    ++target._eventsCount;
  } else if (typeof existing === 'function') {
    events[type] = prepend ? [listener, existing] : [existing, listener];
  } else if (prepend) {
    existing.unshift(listener);
  } else {
    existing.push(listener);
  }

  const m = _getMaxListeners(target);
  if (m > 0 && existing.length > m && !existing.warned) {
    existing.warned = true;
    const w = new Error(`Possible EventEmitter memory leak detected. ${existing.length} ${String(type)} listeners added. Use emitter.setMaxListeners() to increase limit`);
    w.name = 'MaxListenersExceededWarning';
    w.emitter = target;
    w.type = type;
    w.count = existing.length;
    ProcessEmitWarning(w);
  }

  return target;
}

function _getMaxListeners(that) {
  return that._maxListeners === undefined ? EventEmitter.defaultMaxListeners : that._maxListeners;
}

module.exports = EventEmitter;
