module.exports = function(n) {
  return {
    all: n = n || new Map(),
    
    on: function(event, listener) {
      var listeners = n.get(event);
      if (listeners) {
        listeners.push(listener);
      } else {
        n.set(event, [listener]);
      }
    },
    
    off: function(event, listener) {
      var listeners = n.get(event);
      if (listeners) {
        if (listener) {
          listeners.splice(listeners.indexOf(listener) >>> 0, 1);
        } else {
          n.set(event, []);
        }
      }
    },
    
    emit: function(event, data) {
      var listeners = n.get(event);
      if (listeners) {
        listeners.slice().forEach(function(listener) {
          listener(data);
        });
      }
      if ((listeners = n.get("*"))) {
        listeners.slice().forEach(function(listener) {
          listener(event, data);
        });
      }
    }
  };
};
//# sourceMappingURL=mitt.js.map
