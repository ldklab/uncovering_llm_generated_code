// events.js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // Adds a listener to the specified event
  on(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The listener must be a function');
    }
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
    return this;
  }

  // Emits an event, invoking all registered listeners
  emit(eventName, ...args) {
    const listeners = this.events[eventName];
    if (!listeners || listeners.length === 0) return false;

    listeners.forEach(listener => listener(...args));
    return true;
  }

  // Removes a listener from the specified event
  off(eventName, listener) {
    const listeners = this.events[eventName];
    if (!listeners) return this;

    this.events[eventName] = listeners.filter(l => l !== listener);
    return this;
  }
}

module.exports = EventEmitter;

// Usage example
const EventEmitter = require('./events');

const ee = new EventEmitter();
ee.on('message', text => {
  console.log(text);
});
ee.emit('message', 'hello world');
