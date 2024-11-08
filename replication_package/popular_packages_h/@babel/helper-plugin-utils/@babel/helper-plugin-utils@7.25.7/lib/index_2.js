"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declare = declare;
exports.declarePreset = declare;

const apiPolyfills = {
  assertVersion: api => range => {
    throwVersionError(range, api.version);
  },
  targets: () => () => ({}),
  assumption: () => () => undefined,
  addExternalDependency: () => () => {}
};

function declare(builder) {
  return (api, options = {}, dirname) => {
    let clonedApi;
    for (const key in apiPolyfills) {
      if (!api[key]) {
        clonedApi = clonedApi || copyApiObject(api);
        clonedApi[key] = apiPolyfills[key](clonedApi);
      }
    }
    return builder(clonedApi || api, options, dirname);
  };
}

function copyApiObject(api) {
  let proto = null;
  if (typeof api.version === "string" && api.version.startsWith("7.")) {
    proto = Object.getPrototypeOf(api);
    if (proto && !['version', 'transform', 'template', 'types'].every(prop => hasOwnProperty.call(proto, prop))) {
      proto = null;
    }
  }
  return Object.assign({}, proto, api);
}

function throwVersionError(range, version) {
  if (typeof range === "number") {
    if (!Number.isInteger(range)) {
      throw new Error("Expected string or integer value.");
    }
    range = `^${range}.0.0-0`;
  }
  if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  const originalStackTraceLimit = Error.stackTraceLimit;
  if (typeof originalStackTraceLimit === "number" && originalStackTraceLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const errorMessage = version.startsWith("7.") 
    ? `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". Update your @babel/core version.` 
    : `Requires Babel "${range}", but was loaded with "${version}". Ensure a compatible version of @babel/core is used, and inspect the build process.`;

  const err = new Error(errorMessage);
  Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });

  if (typeof originalStackTraceLimit === "number") {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  throw err;
}
