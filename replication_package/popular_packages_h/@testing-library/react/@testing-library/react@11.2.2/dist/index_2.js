"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pure = require("./pure");

Object.keys(_pure).forEach((key) => {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _pure[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: () => _pure[key],
  });
});

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
