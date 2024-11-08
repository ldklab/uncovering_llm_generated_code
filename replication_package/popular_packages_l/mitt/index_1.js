// mitt.js
function createEventEmitter() {
  const handlersMap = new Map();

  return {
    on(eventType, handler) {
      if (!handlersMap.has(eventType)) {
        handlersMap.set(eventType, []);
      }
      handlersMap.get(eventType).push(handler);
    },
    off(eventType, handler) {
      const handlers = handlersMap.get(eventType);
      if (handlers) {
        if (handler) {
          const index = handlers.indexOf(handler);
          if (index !== -1) {
            handlers.splice(index, 1);
          }
        } else {
          handlersMap.set(eventType, []);
        }
      }
    },
    emit(eventType, event) {
      const specificHandlers = handlersMap.get(eventType) || [];
      const wildcardHandlers = handlersMap.get('*') || [];
      
      specificHandlers.slice().forEach(h => h(event));
      wildcardHandlers.slice().forEach(h => h(eventType, event));
    },
    get handlers() {
      return handlersMap;
    }
  };
}

// Usage example
const emitter = createEventEmitter();

// Listen to a specific event
emitter.on('foo', event => console.log('foo', event));

// Listen to all events
emitter.on('*', (eventType, event) => console.log(eventType, event));

// Emit an event
emitter.emit('foo', { a: 'b' });

// Add and remove a specific handler for an event
function fooHandler() { console.log("foo event handler"); }
emitter.on('foo', fooHandler);
emitter.off('foo', fooHandler);

// Default export
module.exports = createEventEmitter;
