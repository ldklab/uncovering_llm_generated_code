module.exports = function(events) {
  // If no map is passed in, initialize a new Map for event storage
  events = events || new Map();

  return {
    // Return the underlying Map of events
    all: events,

    // Event subscription - register an event listener for an event type
    on: function(event, listener) {
      // Get the array of listeners for the event, if it exists
      var listeners = events.get(event);

      // If the event already exists, push the new listener onto it
      if (listeners) {
        listeners.push(listener);
      } else {
        // If the event does not exist, create an array with the new listener
        events.set(event, [listener]);
      }
    },

    // Event unsubscription - remove an event listener for an event type
    off: function(event, listener) {
      // Get the array of listeners for the event
      var listeners = events.get(event);

      // If listeners exist for the event
      if (listeners) {
        // If a specific listener is provided, remove it
        if (listener) {
          // >>> 0 is used as a logical right shift to ensure a non-negative number
          listeners.splice(listeners.indexOf(listener) >>> 0, 1);
        } else {
          // If no specific listener is provided, clear all listeners for the event
          events.set(event, []);
        }
      }
    },

    // Emit an event, calling all listeners attached to that event type
    emit: function(event, data) {
      // Get the array of listeners for the event
      var listeners = events.get(event);

      // If listeners exist, call each one with the provided data
      if (listeners) {
        listeners.slice().map(function(listener) {
          listener(data);
        });
      }

      // If there are any listeners for the wildcard "*", call them with the event type and data
      if ((listeners = events.get("*"))) {
        listeners.slice().map(function(listener) {
          listener(event, data);
        });
      }
    }
  };
};
//# sourceMappingURL=mitt.js.map
