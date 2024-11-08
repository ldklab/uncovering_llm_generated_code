module.exports = function(initialEvents) {
  // Initialize 'all' with a Map object, use input Map if provided
  return {
    all: initialEvents = initialEvents || new Map(),
    
    on: function(event, listener) {
      // Retrieve existing listeners for the event, or initialize a new list
      const listeners = initialEvents.get(event);
      
      // If listeners already exist, add the new listener; otherwise, set a new array with the listener
      listeners ? listeners.push(listener) : initialEvents.set(event, [listener]);
    },

    off: function(event, listener) {
      // Retrieve existing listeners for the event
      const listeners = initialEvents.get(event);
      
      // If listeners exist
      if (listeners) {
        // If a specific listener is provided, remove it
        if (listener) {
          const index = listeners.indexOf(listener) >>> 0;
          listeners.splice(index, 1);
        } else {
          // If no specific listener, remove all listeners for the event
          initialEvents.set(event, []);
        }
      }
    },

    emit: function(event, payload) {
      // Retrieve listeners for the specific event
      let listeners = initialEvents.get(event);
      if (listeners) {
        // Notify each listener with the payload
        listeners.slice().forEach(fn => fn(payload));
      }
      
      // Also notify wildcard listeners ('*') with the event and payload
      listeners = initialEvents.get("*");
      if (listeners) {
        listeners.slice().forEach(fn => fn(event, payload));
      }
    }
  };
};

//# sourceMappingURL=mitt.js.map
