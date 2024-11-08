module.exports = function(initMap) {
  const eventMap = initMap || new Map();
  
  return {
    all: eventMap,
    
    on: function(event, listener) {
      const listeners = eventMap.get(event);
      if (listeners) {
        listeners.push(listener);
      } else {
        eventMap.set(event, [listener]);
      }
    },
    
    off: function(event, listener) {
      const listeners = eventMap.get(event);
      if (!listeners) return;
      
      if (listener) {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      } else {
        eventMap.set(event, []);
      }
    },
    
    emit: function(event, payload) {
      const listeners = eventMap.get(event);
      if (listeners) {
        listeners.slice().forEach(fn => fn(payload));
      }
      
      const wildcardListeners = eventMap.get("*");
      if (wildcardListeners) {
        wildcardListeners.slice().forEach(fn => fn(event, payload));
      }
    }
  };
};
