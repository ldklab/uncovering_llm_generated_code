"use strict";

const util = require("util");
const memorize = require("./util/memorize");

// Definition for lazyFunction that returns a memoized version of a factory function
const lazyFunction = factory => {
  const fac = memorize(factory);
  const f = (...args) => fac()(...args);
  return f;
};

// Function to merge two objects, using getter functions or nested objects
const mergeExports = (obj, exports) => {
  const descriptors = Object.getOwnPropertyDescriptors(exports);
  for (const name of Object.keys(descriptors)) {
    const descriptor = descriptors[name];
    if (descriptor.get) {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        get: memorize(descriptor.get)
      });
    } else if (typeof descriptor.value === "object") {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mergeExports({}, descriptor.value)
      });
    } else {
      throw new Error("Exposed values must be either a getter or a nested object");
    }
  }
  return Object.freeze(obj);
};

// Exports the module functionalities using lazy loading and merging
const fn = lazyFunction(() => require("./webpack"));
module.exports = mergeExports(fn, {
  get webpack() {
    return require("./webpack");
  },
  get validate() {
    const validateSchema = require("./validateSchema");
    const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
    return options => validateSchema(webpackOptionsSchema, options);
  },
  get validateSchema() {
    return require("./validateSchema");
  },
  get version() {
    return require("../package.json").version;
  },
  get cli() {
    return require("./cli");
  },
  get AutomaticPrefetchPlugin() {
    return require("./AutomaticPrefetchPlugin");
  },
  // Additional exports of Webpack core plugins and features
  // ...
  cache: {
    get MemoryCachePlugin() {
      return require("./cache/MemoryCachePlugin");
    }
  },
  config: {
    get getNormalizedWebpackOptions() {
      return require("./config/normalization").getNormalizedWebpackOptions;
    },
    get applyWebpackOptionsDefaults() {
      return require("./config/defaults").applyWebpackOptionsDefaults;
    }
  },
  ids: {
    get ChunkModuleIdRangePlugin() {
      return require("./ids/ChunkModuleIdRangePlugin");
    },
    // More plugins under 'ids'
  },
  javascript: {
    get EnableChunkLoadingPlugin() {
      return require("./javascript/EnableChunkLoadingPlugin");
    },
    // Other JavaScript related components
  },
  // Additional sections (optimize, runtime, web, etc.) with similar structure
});
