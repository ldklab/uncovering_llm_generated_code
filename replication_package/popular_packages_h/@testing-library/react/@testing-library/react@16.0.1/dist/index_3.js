"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const { getIsReactActEnvironment, setReactActEnvironment } = require("./actCompat");
const { cleanup, ...pure } = require("./pure");

Object.entries(pure).forEach(([key, value]) => {
  if (key !== "default" && key !== "__esModule" && (!exports[key] || exports[key] !== value)) {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => value,
    });
  }
});

if (typeof process === 'undefined' || !process.env?.RTL_SKIP_AUTO_CLEANUP) {
  
  if (typeof afterEach === 'function') {
    afterEach(() => {
      cleanup();
    });
  } else if (typeof teardown === 'function') {
    teardown(() => {
      cleanup();
    });
  }

  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    let previousIsReactActEnvironment = getIsReactActEnvironment();
    beforeAll(() => {
      previousIsReactActEnvironment = getIsReactActEnvironment();
      setReactActEnvironment(true);
    });
    afterAll(() => {
      setReactActEnvironment(previousIsReactActEnvironment);
    });
  }
}
