'use strict';

class Events {
  constructor() {
    if (Object.create) {
      Object.setPrototypeOf(this, null);
      if (!new Events().__proto__) EventEmitter.prefixed = false;
    }
  }
}

class EE {
  constructor(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
}

function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') throw new TypeError('The listener must be a function');

  const listener = new EE(fn, context || emitter, once);
  const evt = EventEmitter.prefixed ? `~${event}` : event;

  if (!emitter._events[evt]) {
    emitter._events[evt] = listener;
    emitter._eventsCount++;
  } else if (!emitter._events[evt].fn) {
    emitter._events[evt].push(listener);
  } else {
    emitter._events[evt] = [emitter._events[evt], listener];
  }

  return emitter;
}

function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

class EventEmitter {
  constructor() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  eventNames() {
    const names = [];
    if (this._eventsCount === 0) return names;

    for (let name in this._events) {
      if (Object.prototype.hasOwnProperty.call(this._events, name)) {
        names.push(EventEmitter.prefixed ? name.slice(1) : name);
      }
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(this._events));
    }

    return names;
  }

  listeners(event) {
    const evt = EventEmitter.prefixed ? `~${event}` : event;
    const handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    return handlers.map(handler => handler.fn);
  }

  listenerCount(event) {
    const evt = EventEmitter.prefixed ? `~${event}` : event;
    const listeners = this._events[evt];

    return listeners ? (listeners.fn ? 1 : listeners.length) : 0;
  }

  emit(event, ...args) {
    const evt = EventEmitter.prefixed ? `~${event}` : event;
    if (!this._events[evt]) return false;

    const listeners = this._events[evt];
    
    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
      listeners.fn.call(listeners.context, ...args);
    } else {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
        listeners[i].fn.apply(listeners[i].context, args);
      }
    }

    return true;
  }

  on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  }

  once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  }

  removeListener(event, fn, context, once) {
    const evt = EventEmitter.prefixed ? `~${event}` : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    const listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn && 
        (!once || listeners.once) && 
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      const events = listeners.filter(listener => 
        listener.fn !== fn || 
        (once && !listener.once) || 
        (context && listener.context !== context)
      );

      if (events.length) {
        this._events[evt] = events.length === 1 ? events[0] : events;
      } else {
        clearEvent(this, evt);
      }
    }

    return this;
  }

  removeAllListeners(event) {
    if (event) {
      const evt = EventEmitter.prefixed ? `~${event}` : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  }
}

EventEmitter.prefixed = '~';
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.EventEmitter = EventEmitter;

if (typeof module !== 'undefined') {
  module.exports = EventEmitter;
}
