"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const _actCompat = require("./act-compat");
const _pure = require("./pure");

// Export non-default properties from _pure
Object.entries(_pure).forEach(([key, value]) => {
  if (key !== "default" && key !== "__esModule" && (!exports[key] || exports[key] !== value)) {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get() {
        return value;
      }
    });
  }
});

// Check for automatic cleanup after tests if not skipped by env variable
if (typeof process === 'undefined' || !(process.env?.RTL_SKIP_AUTO_CLEANUP)) {
  if (typeof afterEach === 'function') {
    afterEach(() => _pure.cleanup());
  } else if (typeof teardown === 'function') {
    teardown(() => _pure.cleanup());
  }

  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    let previousIsReactActEnvironment = _actCompat.getIsReactActEnvironment();
    beforeAll(() => {
      previousIsReactActEnvironment = _actCompat.getIsReactActEnvironment();
      _actCompat.setReactActEnvironment(true);
    });
    afterAll(() => {
      _actCompat.setReactActEnvironment(previousIsReactActEnvironment);
    });
  }
}
