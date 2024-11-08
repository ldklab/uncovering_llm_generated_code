"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const { cleanup } = require("./pure");

for (const key of Object.keys(require("./pure"))) {
  if (key === "default" || key === "__esModule") continue;
  if (key in exports && exports[key] === require("./pure")[key]) continue;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: () => require("./pure")[key],
  });
}

if (!process.env.RTL_SKIP_AUTO_CLEANUP) {
  if (typeof afterEach === 'function') {
    afterEach(() => {
      cleanup();
    });
  } else if (typeof teardown === 'function') {
    teardown(() => {
      cleanup();
    });
  }
}
