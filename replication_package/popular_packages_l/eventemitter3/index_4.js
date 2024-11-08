class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, fn, context = null) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push({ fn, context });
    return this;
  }

  once(event, fn, context = null) {
    const handler = (...args) => {
      this.removeListener(event, handler);
      fn.apply(context, args);
    };
    handler.fn = fn;
    this.on(event, handler, context);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) {
      return false;
    }
    this.events[event].forEach(listener => {
      listener.fn.apply(listener.context, args);
    });
    return true;
  }

  removeListener(event, fn, context = null) {
    if (!this.events[event]) {
      return this;
    }
    this.events[event] = this.events[event].filter(listener => listener.fn !== fn || listener.context !== context);
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

module.exports = EventEmitter;

// Usage example
const EE = new EventEmitter();
const context = { foo: 'bar' };

function listener() {
  console.log(this === context); // true
}

EE.once('my-event', listener, context);
EE.emit('my-event');  // Logs: true
EE.emit('my-event');  // Does nothing as it's once
