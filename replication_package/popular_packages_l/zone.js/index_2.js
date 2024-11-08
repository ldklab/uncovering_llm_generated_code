// zone.js

class Zone {
  constructor(parentZone = null, name = '<root>', properties = {}) {
    this.name = name;
    this.parent = parentZone;
    this.properties = properties;
  }

  static currentZone() {
    return Zone._currentZone || Zone.root;
  }

  fork({ name, properties }) {
    return new Zone(this, name, properties);
  }

  wrap(callback, source) {
    const zone = this;
    return function(...args) {
      return zone.run(callback, this, args, source);
    };
  }

  run(callback, applyThis, applyArgs, source) {
    const previousZone = Zone.currentZone();
    Zone._currentZone = this;
    try {
      return callback.apply(applyThis, applyArgs);
    } finally {
      Zone._currentZone = previousZone;
    }
  }
}

function patchGlobalAPI(global) {
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = function(callback, delay, ...args) {
    const zone = Zone.currentZone();
    return originalSetTimeout(zone.wrap(callback, 'setTimeout'), delay, ...args);
  };

  const originalSetInterval = global.setInterval;
  global.setInterval = function(callback, delay, ...args) {
    const zone = Zone.currentZone();
    return originalSetInterval(zone.wrap(callback, 'setInterval'), delay, ...args);
  };
}

Zone.root = new Zone();
Zone._currentZone = Zone.root;

patchGlobalAPI(globalThis);

module.exports = { Zone };

// Example usage:
/*
const { Zone } = require('./zone.js');
const myZone = Zone.currentZone().fork({ name: 'myZone' });

myZone.run(() => {
  setTimeout(() => {
    console.log('Inside myZone');
    console.log(Zone.currentZone().name); // Output: "myZone"
  }, 1000);
});
*/
