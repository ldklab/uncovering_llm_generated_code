// zone.js

class Zone {
  constructor(parentZone = null, name = '<root>', properties = Object.create(null)) {
    this.name = name;
    this.parent = parentZone;
    this.properties = properties;
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
