// This module exports a function that takes an optional Map (`n`) and returns an object 
// with methods to manage event listeners ('on', 'off') and to emit events ('emit').

module.exports = function (initialMap) {
  // If no map is provided, start with a new Map.
  const allListeners = initialMap || new Map();

  return {
    // Method to add an event listener for a given event type `e`.
    on: function (eventType, listener) {
      const listeners = allListeners.get(eventType);
      if (listeners) {
        listeners.push(listener);
      } else {
        allListeners.set(eventType, [listener]);
      }
    },

    // Method to remove an event listener for a given event type `e`.
    off: function (eventType, listener) {
      const listeners = allListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    },

    // Method to emit an event of type `e` with an optional data `t`.
    emit: function (eventType, data) {
      // Get listeners for the specific event type and call them with the data.
      (allListeners.get(eventType) || []).slice().forEach(function (listener) {
        listener(data);
      });

      // Get "wildcard" listeners that listen to all events and call them with the event type and data.
      (allListeners.get("*") || []).slice().forEach(function (listener) {
        listener(eventType, data);
      });
    }
  };
};
