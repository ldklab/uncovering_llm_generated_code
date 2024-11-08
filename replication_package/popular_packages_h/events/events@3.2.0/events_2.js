'use strict';

const MyReflect = (typeof Reflect === 'object') ? Reflect : null;

const ReflectApply = MyReflect && typeof MyReflect.apply === 'function' 
  ? MyReflect.apply 
  : function(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

const ReflectOwnKeys = MyReflect && typeof MyReflect.ownKeys === 'function'
  ? MyReflect.ownKeys
  : (Object.getOwnPropertySymbols
    ? target => Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))
    : target => Object.getOwnPropertyNames(target)
  );

function logWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

const NumberIsNaN = Number.isNaN || function(value) {
  return value !== value;
};

class EventEmitter {
  constructor() {
    EventEmitter.init.call(this);
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
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  }
  
  getMaxListeners() {
    return this._maxListeners === undefined ? EventEmitter.defaultMaxListeners : this._maxListeners;
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
      const err = new Error(`Unhandled error. ${er ? `(${er.message})` : ''}`);
      err.context = er;
      throw err;
    }

    const handler = events[type];
    if (handler === undefined)
      return false;

    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      const listeners = handler.slice();
      for (const listener of listeners)
        ReflectApply(listener, this, args);
    }

    return true;
  }

  addListener(type, listener, prepend = false) {
    EventEmitter.checkListener(listener);

    let events = this._events;
    if (events === undefined) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else {
      if (events.newListener !== undefined) {
        this.emit('newListener', type, listener.listener || listener);
        events = this._events;
      }
    }

    const existing = events[type];

    if (existing === undefined) {
      events[type] = listener;
      ++this._eventsCount;
    } else {
      if (typeof existing === 'function') {
        events[type] = prepend ? [listener, existing] : [existing, listener];
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }

      const m = this.getMaxListeners();
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        const w = new Error(`Possible EventEmitter memory leak detected. ${existing.length} ${String(type)} listeners added. Use emitter.setMaxListeners() to increase limit`);
        w.name = 'MaxListenersExceededWarning';
      }
    }

    return this;
  }

  on(type, listener) {
    return this.addListener(type, listener, false);
  }

  prependListener(type, listener) {
    return this.addListener(type, listener, true);
  }

  once(type, listener) {
    EventEmitter.checkListener(listener);
    this.on(type, EventEmitter._onceWrap(this, type, listener));
    return this;
  }

  prependOnceListener(type, listener) {
    EventEmitter.checkListener(listener);
    this.prependListener(type, EventEmitter._onceWrap(this, type, listener));
    return this;
  }

  removeListener(type, listener) {
    EventEmitter.checkListener(listener);

    const events = this._events;
    if (events === undefined) return this;

    const list = events[type];
    if (list === undefined) return this;

    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0)
        this._events = Object.create(null);
      else {
        delete events[type];
        if (events.removeListener)
          this.emit('removeListener', type, list.listener || listener);
      }
    } else if (typeof list !== 'function') {
      const position = list.indexOf(listener);

      if (position < 0) return this;

      if (position === 0)
        list.shift();
      else {
        EventEmitter.spliceOne(list, position);
      }

      if (list.length === 1)
        events[type] = list[0];

      if (events.removeListener !== undefined)
        this.emit('removeListener', type, list.listener || listener);
    }

    return this;
  }

  off(type, listener) {
    return this.removeListener(type, listener);
  }

  removeAllListeners(type) {
    const events = this._events;
    if (events === undefined) return this;

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
      const keys = Object.keys(events);
      for (const key of keys) {
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else {
      const listeners = events[type];
      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        for (let i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
    }

    return this;
  }

  listeners(type) {
    return EventEmitter._listeners(this, type, true);
  }

  rawListeners(type) {
    return EventEmitter._listeners(this, type, false);
  }

  listenerCount(type) {
    return EventEmitter.listenerCount.call(this, type);
  }

  eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  }

  static listenerCount(emitter, type) {
    const events = emitter._events;
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

  static checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(`The "listener" argument must be of type Function. Received type ${typeof listener}`);
    }
  }

  static _onceWrap(target, type, listener) {
    const state = { fired: false, wrapFn: undefined, target, type, listener };
    const wrappedFn = function() {
      if (!state.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0) return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }.bind(state);
    state.wrapFn = wrappedFn;
    return wrappedFn;
  }

  static spliceOne(list, index) {
    for (; index + 1 < list.length; index++) list[index] = list[index + 1];
    list.pop();
  }

  static _listeners(target, type, unwrap) {
    const events = target._events;
    if (events === undefined) return [];
    const evlistener = events[type];
    if (evlistener === undefined) return [];
    if (typeof evlistener === 'function') {
      return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    }
    return unwrap ? EventEmitter.unwrapListeners(evlistener) : evlistener.slice();
  }

  static unwrapListeners(arr) {
    return arr.map(listener => listener.listener || listener);
  }
}

EventEmitter.defaultMaxListeners = 10;

module.exports = EventEmitter;

module.exports.once = function(emitter, name) {
  return new Promise((resolve, reject) => {
    const eventListener = function(...args) {
      if (errorListener !== undefined) emitter.removeListener('error', errorListener);
      resolve(args);
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
};
