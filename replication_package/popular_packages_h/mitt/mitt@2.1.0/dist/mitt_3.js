module.exports = function(eventMap) {
    // Initialize event storage as a Map if not provided
    eventMap = eventMap || new Map();

    return {
        // Register an event listener
        on: function(event, listener) {
            // Retrieve listeners for the event
            var listeners = eventMap.get(event);

            // If listeners exist, add the new listener to the list
            // Otherwise, create a new list with the listener
            if (listeners) {
                listeners.push(listener);
            } else {
                eventMap.set(event, [listener]);
            }
        },
        
        // Remove an event listener
        off: function(event, listener) {
            // Retrieve listeners for the event
            var listeners = eventMap.get(event);

            // If listeners exist, remove the specified listener
            if (listeners) {
                var index = listeners.indexOf(listener) >>> 0; // non-negative index
                listeners.splice(index, 1);
            }
        },

        // Emit an event, invoking all listeners for that event
        emit: function(event, data) {
            // Retrieve and invoke listeners specific to the event
            (eventMap.get(event) || []).slice().map(function(listener) {
                listener(data);
            });

            // Retrieve and invoke listeners for any event (* wildcard)
            (eventMap.get("*") || []).slice().map(function(listener) {
                listener(event, data);
            });
        },

        // Expose the underlying event map
        all: eventMap
    };
};
