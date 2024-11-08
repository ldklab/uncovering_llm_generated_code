// mitt.js

// This function creates and returns an event emitter object with methods to register and deregister event handlers, and to emit events
function mitt(allHandlers = new Map()) {
  return {
    allHandlers,

    // Registers an event handler for a specific event type
    on(eventType, handler) {
      const handlersForType = allHandlers.get(eventType);
      if (handlersForType) {
        handlersForType.push(handler);
      } else {
        allHandlers.set(eventType, [handler]);
      }
    },

    // Unregisters an event handler for a specific event type, or all if no specific handler is provided
    off(eventType, handler) {
      const handlersForType = allHandlers.get(eventType);
      if (handlersForType) {
        if (!handler) {
          allHandlers.set(eventType, []);
        } else {
          const handlerIndex = handlersForType.indexOf(handler);
          if (handlerIndex !== -1) {
            handlersForType.splice(handlerIndex, 1);
          }
        }
      }
    },

    // Emits an event of a specific type, invoking all registered handlers for that type and wildcard '*' handlers
    emit(eventType, eventPayload) {
      const handlersForType = (allHandlers.get(eventType) || []).slice();
      handlersForType.forEach(handler => handler(eventPayload));

      const wildcardHandlers = (allHandlers.get('*') || []).slice();
      wildcardHandlers.forEach(handler => handler(eventType, eventPayload));
    }
  };
}

// Usage example
const emitter = mitt();

// Registers a handler to listen to the 'foo' event
emitter.on('foo', (event) => console.log('foo', event));

// Registers a handler to listen to all events (wildcard listener)
emitter.on('*', (eventType, event) => console.log(eventType, event));

// Emits the 'foo' event with a payload
emitter.emit('foo', { a: 'b' });

// Example of adding and then removing a specific handler for an event
function onFoo() { console.log("foo event handler"); }
emitter.on('foo', onFoo);
emitter.off('foo', onFoo);

// Default export of the mitt function
module.exports = mitt;
