module.exports = function (eventMap) {
    eventMap = eventMap || new Map();
    return {
        all: eventMap,
        on: function (event, handler) {
            const handlers = eventMap.get(event);
            if (handlers) {
                handlers.push(handler);
            } else {
                eventMap.set(event, [handler]);
            }
        },
        off: function (event, handler) {
            const handlers = eventMap.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        },
        emit: function (event, argument) {
            (eventMap.get(event) || []).slice().forEach(function (handler) {
                handler(argument);
            });
            (eventMap.get("*") || []).slice().forEach(function (handler) {
                handler(event, argument);
            });
        }
    };
};
//# sourceMappingURL=mitt.js.map
