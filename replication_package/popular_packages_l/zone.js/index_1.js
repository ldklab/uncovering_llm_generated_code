// zone.js

class Zone {
  constructor(parentZone, name, properties) {
    this.name = name || '<root>'; // Name of the zone or default to '<root>'
    this.parent = parentZone || null; // Parent zone or default to null (root)
    this.properties = properties || Object.create(null); // Properties associated with the zone
  }

  // Static method to get the current zone
  static currentZone() {
    return Zone._currentZone || Zone.root;
  }

  // Method to create a new zone that inherits from the current one
  fork(zoneSpec) {
    return new Zone(this, zoneSpec.name, zoneSpec.properties);
  }

  // Method to wrap a callback to run within the current zone
  wrap(callback, source) {
    const zone = this;
    const wrappedCallback = function() {
      return zone.run(callback, this, arguments, source);
    };
    return wrappedCallback;
  }

  // Execute a given callback within this zone, restoring the previous zone afterwards
  run(callback, applyThis, applyArgs, source) {
    const previousZone = Zone.currentZone(); // Save current zone
    Zone._currentZone = this; // Set this zone as the current one
    try {
      return callback.apply(applyThis, applyArgs); // Execute the callback
    } finally {
      Zone._currentZone = previousZone; // Restore the previous zone
    }
  }
}

// Patch global API functions to run callbacks within the current zone
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

// Initialize the root zone
Zone.root = new Zone(null, '<root>');
Zone._currentZone = Zone.root;

// Apply patches to global APIs
patchGlobalAPI(globalThis);

// Export the Zone class to be used in other modules
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
