"use strict";

const apiPolyfills = {
  assertVersion: (api) => (range) => {
    throwVersionError(range, api.version);
  },
  targets: () => () => ({}),
  assumption: () => () => undefined,
  addExternalDependency: () => () => {}
};

function declare(builder) {
  return (api, options = {}, dirname) => {
    let clonedApi;
    for (const name of Object.keys(apiPolyfills)) {
      if (!api[name]) {
        clonedApi ??= cloneApi(api);
        clonedApi[name] = apiPolyfills[name](clonedApi);
      }
    }
    return builder(clonedApi ?? api, options, dirname);
  };
}

const declarePreset = declare;

function cloneApi(api) {
  let proto = null;
  if (typeof api.version === "string" && api.version.startsWith("7.")) {
    proto = Object.getPrototypeOf(api);
    if (proto && ["version", "transform", "template", "types"].some(prop => !proto.hasOwnProperty(prop))) {
      proto = null;
    }
  }
  return Object.assign({}, proto, api);
}

function throwVersionError(range, version) {
  if (typeof range === "number" && !Number.isInteger(range)) {
    throw new Error("Expected string or integer value.");
  } else if (typeof range === "number") {
    range = `^${range}.0.0-0`;
  } else if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  const originalLimit = Error.stackTraceLimit;
  if (typeof originalLimit === "number" && originalLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const message = version.startsWith("7.")
    ? `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You'll need to update your @babel/core version.`
    : `Requires Babel "${range}", but was loaded with "${version}". If you are sure you have a compatible version of @babel/core, it might be due to an incorrect build process loading the wrong version. Inspect the stack trace to find non-@babel/core references.`;

  const error = new Error(message);
  error.code = "BABEL_VERSION_UNSUPPORTED";
  error.version = version;
  error.range = range;

  Error.stackTraceLimit = originalLimit;
  throw error;
}

exports.declare = declare;
exports.declarePreset = declarePreset;

//# sourceMappingURL=index.js.map
