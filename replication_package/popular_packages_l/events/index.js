// events.js
function EventEmitter() {
  this.events = {};
}

// Adds a listener to the specified event
EventEmitter.prototype.on = function(eventName, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The listener must be a function');
  }
  if (!this.events[eventName]) {
    this.events[eventName] = [];
  }
  this.events[eventName].push(listener);
  return this;
};

// Emits an event, invoking all registered listeners
EventEmitter.prototype.emit = function(eventName, ...args) {
  var listeners = this.events[eventName];
  if (!listeners || listeners.length === 0) return false;

  listeners.forEach(function(listener) {
    listener.apply(null, args);
  });
  return true;
};

// Removes a listener from the specified event
EventEmitter.prototype.off = function(eventName, listener) {
  var listeners = this.events[eventName];
  if (!listeners) return this;

  this.events[eventName] = listeners.filter(function(l) {
    return l !== listener;
  });
  return this;
};

module.exports = EventEmitter;

// Usage example
var EventEmitter = require('./events');

var ee = new EventEmitter();
ee.on('message', function(text) {
  console.log(text);
});
ee.emit('message', 'hello world');
