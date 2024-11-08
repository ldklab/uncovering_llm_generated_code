// zone.js

class Zone {
  constructor(parentZone, name, properties) {
    this.name = name || '<root>';
    this.parent = parentZone || null;
    this.properties = properties || Object.create(null);
  }

  static getCurrentZone() {
    return Zone._currentZone || Zone.rootZone;
  }

  createFork(zoneConfig) {
    return new Zone(this, zoneConfig.name, zoneConfig.properties);
  }

  wrapCallback(callback, source) {
    const currentZone = this;
    const wrappedFunction = function() {
      return currentZone.execute(callback, this, arguments, source);
    };
    return wrappedFunction;
  }

  execute(callback, thisArg, argsArray, source) {
    const lastZone = Zone.getCurrentZone();
    Zone._currentZone = this;
    try {
      return callback.apply(thisArg, argsArray);
    } finally {
      Zone._currentZone = lastZone;
    }
  }
}

function patchGlobalTimers(global) {
  const nativeSetTimeout = global.setTimeout;
  global.setTimeout = function(callback, delay, ...args) {
    const activeZone = Zone.getCurrentZone();
    return nativeSetTimeout(activeZone.wrapCallback(callback, 'setTimeout'), delay, ...args);
  };

  const nativeSetInterval = global.setInterval;
  global.setInterval = function(callback, delay, ...args) {
    const activeZone = Zone.getCurrentZone();
    return nativeSetInterval(activeZone.wrapCallback(callback, 'setInterval'), delay, ...args);
  };
}

Zone.rootZone = new Zone(null, '<root>');
Zone._currentZone = Zone.rootZone;

patchGlobalTimers(globalThis);

module.exports = { Zone };

// Example usage
/*
const { Zone } = require('./zone.js');
const customZone = Zone.getCurrentZone().createFork({ name: 'customZone' });

customZone.execute(() => {
  setTimeout(() => {
    console.log('Testing inside customZone');
    console.log(Zone.getCurrentZone().name); // Output: "customZone"
  }, 1000);
});
*/
