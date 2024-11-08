'use strict';

// Utility to check for own properties
const hasOwnProp = Object.prototype.hasOwnProperty;

// Prefix for event names, determined by object creation capability
let prefix = '~';

class Events {
  constructor() {
    if (Object.create) {
      const instance = Object.create(null);
      if (!('__proto__' in instance)) prefix = false;
      return instance;
    }
    return {};
  }
}

class EE {
  constructor(fn, context, once = false) {
    this.fn = fn;
    this.context = context;
    this.once = once;
  }
}

class EventEmitter {
  constructor() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  _createPrefixedEvent(event) {
    return prefix ? prefix + event : event;
  }

  eventNames() {
    const events = this._events;
    if (this._eventsCount === 0) return [];
    const names = [];
    for (const name in events) {
      if (hasOwnProp.call(events, name)) {
        names.push(prefix ? name.slice(1) : name);
      }
    }
    return Object.getOwnPropertySymbols 
      ? names.concat(Object.getOwnPropertySymbols(events))
      : names;
  }

  listeners(event) {
    const evt = this._createPrefixedEvent(event);
    const handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];
    return handlers.map(handler => handler.fn);
  }

  listenerCount(event) {
    const evt = this._createPrefixedEvent(event);
    const listeners = this._events[evt];
    if (!listeners) return 0;
    return listeners.fn ? 1 : listeners.length;
  }

  emit(event, ...args) {
    const evt = this._createPrefixedEvent(event);
    if (!this._events[evt]) return false;

    const listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, null, true);
      listeners.fn.call(listeners.context, ...args);
    } else {
      for (let listener of listeners) {
        if (listener.once) this.removeListener(event, listener.fn, null, true);
        listener.fn.call(listener.context, ...args);
      }
    }

    return true;
  }

  on(event, fn, context = this) {
    return this._addListener(event, fn, context, false);
  }

  once(event, fn, context = this) {
    return this._addListener(event, fn, context, true);
  }

  _addListener(event, fn, context, once) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    const listener = new EE(fn, context, once);
    const evt = this._createPrefixedEvent(event);

    if (!this._events[evt]) {
      this._events[evt] = listener;
      this._eventsCount++;
    } else if (!this._events[evt].fn) {
      this._events[evt].push(listener);
    } else {
      this._events[evt] = [this._events[evt], listener];
    }

    return this;
  }

  removeListener(event, fn, context, once) {
    const evt = this._createPrefixedEvent(event);
    const listeners = this._events[evt];
    if (!listeners) return this;

    if (!fn) {
      this._clearEvent(evt);
      return this;
    }

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        this._clearEvent(evt);
      }
    } else {
      const events = [];
      for (let listener of listeners) {
        if (
          listener.fn !== fn ||
          (once && !listener.once) ||
          (context && listener.context !== context)
        ) {
          events.push(listener);
        }
      }
      this._events[evt] = events.length ? events : this._clearEvent(evt);
    }

    return this;
  }

  removeAllListeners(event) {
    if (event) {
      const evt = this._createPrefixedEvent(event);
      if (this._events[evt]) this._clearEvent(evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  }

  _clearEvent(evt) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }
}

// Aliases for method names
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

// Expose whether prefixing is used
EventEmitter.prefixed = prefix;

// Export the EventEmitter
if (typeof module !== 'undefined') {
  module.exports = EventEmitter;
}
