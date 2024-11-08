"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Import all named exports from the 'pure' module
var _pure = require("./pure");

// Re-export all named exports from 'pure', except 'default' and '__esModule'
for (const key of Object.keys(_pure)) {
  if (key !== "default" && key !== "__esModule" && (!_pure[key] || exports[key] !== _pure[key])) {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => _pure[key],
    });
  }
}

// Automatically run cleanup after each test if supported by the test runner
if (!process.env.RTL_SKIP_AUTO_CLEANUP) {
  if (typeof afterEach === 'function') {
    afterEach(() => {
      (0, _pure.cleanup)();
    });
  } else if (typeof teardown === 'function') {
    // eslint-disable-next-line no-undef
    teardown(() => {
      (0, _pure.cleanup)();
    });
  }
}
