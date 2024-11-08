module.exports = function (eventsMap) {
    eventsMap = eventsMap || new Map();

    return {
        all: eventsMap,

        on: function (event, listener) {
            if (eventsMap.has(event)) {
                eventsMap.get(event).push(listener);
            } else {
                eventsMap.set(event, [listener]);
            }
        },

        off: function (event, listener) {
            let listeners = eventsMap.get(event);
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        },

        emit: function (event, data) {
            (eventsMap.get(event) || []).slice().forEach(function (listener) {
                listener(data);
            });

            (eventsMap.get("*") || []).slice().forEach(function (generalListener) {
                generalListener(event, data);
            });
        }
    };
};
//# sourceMappingURL=mitt.js.map
