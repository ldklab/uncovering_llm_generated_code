"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const pureModule = require("./pure");

// Export all keys from pure module except 'default' and '__esModule'
Object.keys(pureModule).forEach((key) => {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === pureModule[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return pureModule[key];
    }
  });
});

// Automatically run cleanup after each test unless RTL_SKIP_AUTO_CLEANUP is true
if (!process.env.RTL_SKIP_AUTO_CLEANUP) {
  // Use of afterEach or teardown for cleanup
  if (typeof afterEach === 'function') {
    afterEach(() => {
      pureModule.cleanup();
    });
  } else if (typeof teardown === 'function') {
    teardown(() => {
      pureModule.cleanup();
    });
  }
}
