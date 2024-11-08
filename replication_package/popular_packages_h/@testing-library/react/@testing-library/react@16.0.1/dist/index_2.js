"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const _actCompat = require("./act-compat");
const _pure = require("./pure");

Object.keys(_pure).forEach(key => {
  if (key !== "default" && key !== "__esModule" && !(key in exports && exports[key] === _pure[key])) {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => _pure[key]
    });
  }
});

const shouldAutoCleanup = typeof process !== 'undefined' && process.env?.RTL_SKIP_AUTO_CLEANUP !== 'true';

if (shouldAutoCleanup) {
  if (typeof afterEach === 'function') {
    afterEach(() => {
      _pure.cleanup();
    });
  } else if (typeof teardown === 'function') {
    teardown(() => {
      _pure.cleanup();
    });
  }

  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    let previousIsReactActEnv = _actCompat.getIsReactActEnvironment();
    beforeAll(() => {
      previousIsReactActEnv = _actCompat.getIsReactActEnvironment();
      _actCompat.setReactActEnvironment(true);
    });
    afterAll(() => {
      _actCompat.setReactActEnvironment(previousIsReactActEnv);
    });
  }
}
