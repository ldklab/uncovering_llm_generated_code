"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const { getIsReactActEnvironment, setReactActEnvironment } = require("./actCompat");
const { cleanup, ...pureExports } = require("./pure");

Object.keys(pureExports).forEach((key) => {
  if (!(key in exports)) {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => pureExports[key],
    });
  }
});

if (typeof process !== 'undefined' && !process.env?.RTL_SKIP_AUTO_CLEANUP) {
  const handleCleanup = () => cleanup();

  if (typeof afterEach === 'function') {
    afterEach(handleCleanup);
  } else if (typeof teardown === 'function') {
    teardown(handleCleanup);
  }

  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    let previousIsReactActEnvironment;
    
    beforeAll(() => {
      previousIsReactActEnvironment = getIsReactActEnvironment();
      setReactActEnvironment(true);
    });

    afterAll(() => {
      setReactActEnvironment(previousIsReactActEnvironment);
    });
  }
}
