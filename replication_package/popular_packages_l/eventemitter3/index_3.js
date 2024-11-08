class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener, context = null) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push({ listener, context });
    return this;
  }

  once(event, listener, context = null) {
    const self = this;
    function singleTimeListener() {
      self.removeListener(event, singleTimeListener);
      listener.apply(context, arguments);
    }
    singleTimeListener.listener = listener;
    this.on(event, singleTimeListener, context);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(({ listener, context }) => {
      listener.apply(context, args);
    });
    return true;
  }

  removeListener(event, listener, context = null) {
    if (!this.events[event]) return this;

    this.events[event] = this.events[event].filter(registeredListener => {
      return registeredListener.listener !== listener || registeredListener.context !== context;
    });

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
const customContext = { foo: 'bar' };

function myListener() {
  console.log(this === customContext); // true
}

EE.once('custom-event', myListener, customContext);
EE.emit('custom-event');  // Logs: true
EE.emit('custom-event');  // Does nothing as it's once
