"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declare = declare;
exports.declarePreset = void 0;

// Define default API polyfills for missing methods
const apiPolyfills = {
  assertVersion: api => range => {
    throwVersionError(range, api.version);
  },
  targets: () => () => ({}),
  assumption: () => () => undefined,
  addExternalDependency: () => () => {}
};

// Declare function to extend an API with polyfills if needed
function declare(builder) {
  return (api, options = {}, dirname) => {
    let clonedApi;
    for (const name in apiPolyfills) {
      if (Object.prototype.hasOwnProperty.call(api, name)) continue;
      clonedApi = clonedApi || copyApiObject(api);
      clonedApi[name] = apiPolyfills[name](clonedApi);
    }
    return builder(clonedApi || api, options, dirname);
  };
}

// Alias declare function as declarePreset
const declarePreset = exports.declarePreset = declare;

// Copy API object, retaining prototype for Babel 7.x compatibility
function copyApiObject(api) {
  const proto = (typeof api.version === "string" && /^7\./.test(api.version)) ? Object.getPrototypeOf(api) : null;
  return Object.assign({}, proto, api);
}

// Throw an error for unsupported Babel versions
function throwVersionError(range, version) {
  if (typeof range === "number") {
    if (!Number.isInteger(range)) throw new Error("Expected string or integer value.");
    range = `^${range}.0.0-0`;
  }
  if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  const originalLimit = Error.stackTraceLimit;
  if (typeof originalLimit === "number" && originalLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const errMsg = version.startsWith("7.")
    ? `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You need to update @babel/core.`
    : `Requires Babel "${range}", but was loaded with "${version}". Ensure the correct @babel/core is loaded by inspecting the stack trace.`;

  const error = new Error(errMsg);
  error.code = "BABEL_VERSION_UNSUPPORTED";
  error.version = version;
  error.range = range;

  if (typeof originalLimit === "number") {
    Error.stackTraceLimit = originalLimit;
  }

  throw error;
}
