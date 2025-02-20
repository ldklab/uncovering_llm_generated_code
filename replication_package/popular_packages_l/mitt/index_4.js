// mitt.js
function mitt(all) {
  all = all || new Map();

  return {
    all,

    // Adds an event listener for a specific event type
    on(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        handlers.push(handler);
      } else {
        all.set(type, [handler]);
      }
    },

    // Removes an event listener for a specific event type
    off(type, handler) {
      const handlers = all.get(type);
      if (handlers) {

        // If no specific handler is provided, remove all handlers for the event type
        if (!handler) {
          all.set(type, []);
        } else {
          // Remove the specific handler
          handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        }
      }
    },

    // Emits an event, invoking all handlers for the specific event
    // and all handlers for the catch-all event type "*"
    emit(type, evt) {
      ((all.get(type) || []).slice().map(handler => { handler(evt); }))
      .concat((all.get('*') || []).slice().map(handler => { handler(type, evt); }));
    }
  };
}

// Usage example
const emitter = mitt();

// Listen to a specific event
emitter.on('foo', (e) => console.log('foo', e));

// Listen to all events
emitter.on('*', (type, e) => console.log(type, e));

// Emit an event
emitter.emit('foo', { a: 'b' });

// Remove specific handler or all handlers for an event
function onFoo() { console.log("foo event handler"); }
emitter.on('foo', onFoo);
emitter.off('foo', onFoo);

// Default export
module.exports = mitt;
