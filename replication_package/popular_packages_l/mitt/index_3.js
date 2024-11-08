function createEventEmitter(storedEvents) {
  const events = storedEvents || new Map();

  return {
    events,
    
    subscribe(eventType, callback) {
      const eventCallbacks = events.get(eventType);
      if (eventCallbacks) {
        eventCallbacks.push(callback);
      } else {
        events.set(eventType, [callback]);
      }
    },
    
    unsubscribe(eventType, callback) {
      const eventCallbacks = events.get(eventType);
      if (eventCallbacks) {
        if (!callback) {
          events.set(eventType, []);
        } else {
          const callbackIndex = eventCallbacks.indexOf(callback) >>> 0;
          eventCallbacks.splice(callbackIndex, 1);
        }
      }
    },
    
    dispatch(eventType, data) {
      const specificListeners = events.get(eventType) || [];
      const wildcardListeners = events.get('*') || [];
      
      specificListeners.slice().forEach(listener => listener(data));
      wildcardListeners.slice().forEach(listener => listener(eventType, data));
    }
  };
}

// Usage example
const eventEmitter = createEventEmitter();

// Subscribe to a specific event
eventEmitter.subscribe('exampleEvent', (data) => console.log('exampleEvent', data));

// Subscribe to all events
eventEmitter.subscribe('*', (eventType, data) => console.log(eventType, data));

// Dispatch an event
eventEmitter.dispatch('exampleEvent', { exampleKey: 'exampleValue' });

// Unsubscribing a specific callback from an event
function exampleCallback() { console.log("exampleEvent callback executed"); }
eventEmitter.subscribe('exampleEvent', exampleCallback);
eventEmitter.unsubscribe('exampleEvent', exampleCallback);

module.exports = createEventEmitter;
