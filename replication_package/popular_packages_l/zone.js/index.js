// zone.js

class Zone {
  constructor(parentZone, name, properties) {
    this.name = name || '<root>';
    this.parent = parentZone || null;
    this.properties = properties || Object.create(null);
  }

  static currentZone() {
    return Zone._currentZone || Zone.root;
  }

  fork(zoneSpec) {
    return new Zone(this, zoneSpec.name, zoneSpec.properties);
  }

  wrap(callback, source) {
    const zone = this;
    const wrappedCallback = function() {
      return zone.run(callback, this, arguments, source);
    };
    return wrappedCallback;
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

// Add patches to global APIs like setTimeout using native prototype methods
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

Zone.root = new Zone(null, '<root>');
Zone._currentZone = Zone.root;

// Apply patches
patchGlobalAPI(globalThis);

// Export public API
module.exports = { Zone };

// Example usage
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
