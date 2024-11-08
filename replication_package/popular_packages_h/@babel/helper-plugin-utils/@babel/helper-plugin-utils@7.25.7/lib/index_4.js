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
  return (api, options, dirname) => {
    let clonedApi;
    for (const name of Object.keys(apiPolyfills)) {
      if (!api[name]) {
        clonedApi = clonedApi || copyApiObject(api);
        clonedApi[name] = apiPolyfills[name](clonedApi);
      }
    }
    return builder(clonedApi || api, options || {}, dirname);
  };
}

function copyApiObject(api) {
  let proto = null;
  if (typeof api.version === "string" && /^7\./.test(api.version)) {
    proto = Object.getPrototypeOf(api);
    if (proto && !["version", "transform", "template", "types"].every(prop => proto.hasOwnProperty(prop))) {
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
  } else if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  const stackTraceLimit = Error.stackTraceLimit;
  if (typeof stackTraceLimit === "number" && stackTraceLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const err = new Error(
    version.startsWith("7.")
      ? `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You'll need to update your @babel/core version.`
      : `Requires Babel "${range}", but was loaded with "${version}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`
  );

  if (typeof stackTraceLimit === "number") {
    Error.stackTraceLimit = stackTraceLimit;
  }

  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}

//# sourceMappingURL=index.js.map
