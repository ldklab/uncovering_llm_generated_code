"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declare = declare;

function declare(builder) {
  return (api, options = {}, dirname) => {
    if (!api.assertVersion) {
      api = { ...copyApiObject(api), assertVersion(range) {
        throwVersionError(range, api.version);
      }};
    }
    return builder(api, options, dirname);
  };
}

function copyApiObject(api) {
  let proto = api.version.startsWith("7.") ? Object.getPrototypeOf(api) : null;

  if (proto && !['version', 'transform', 'template', 'types'].every(key => has(proto, key))) {
    proto = null;
  }

  return { ...proto, ...api };
}

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
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

  const originalLimit = Error.stackTraceLimit;
  if (typeof originalLimit === "number" && originalLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const err = version.startsWith("7.")
    ? new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You'll need to update your @babel/core version.`)
    : new Error(`Requires Babel "${range}", but was loaded with "${version}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`);

  if (typeof originalLimit === "number") {
    Error.stackTraceLimit = originalLimit;
  }

  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}
