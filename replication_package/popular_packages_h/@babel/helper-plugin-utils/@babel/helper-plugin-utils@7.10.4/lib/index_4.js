"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declare = declare;

function declare(builder) {
  return (api, options, dirname) => {
    if (!api.assertVersion) {
      api = Object.assign(copyApiObject(api), {
        assertVersion(range) {
          throwVersionError(range, api.version);
        }
      });
    }
    return builder(api, options || {}, dirname);
  };
}

function copyApiObject(api) {
  let proto = null;

  if (typeof api.version === "string" && /^7\./.test(api.version)) {
    proto = Object.getPrototypeOf(api);

    if (proto && (!objectHasKey(proto, "version") || !objectHasKey(proto, "transform") || !objectHasKey(proto, "template") || !objectHasKey(proto, "types"))) {
      proto = null;
    }
  }

  return Object.assign({}, proto, api);
}

function objectHasKey(obj, key) {
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

  const originalStackTraceLimit = Error.stackTraceLimit;

  if (typeof originalStackTraceLimit === "number" && originalStackTraceLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  let errorMessage;

  if (version.startsWith("7.")) {
    errorMessage = `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You'll need to update your @babel/core version.`;
  } else {
    errorMessage = `Requires Babel "${range}", but was loaded with "${version}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`;
  }

  if (typeof originalStackTraceLimit === "number") {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  const error = new Error(errorMessage);

  throw Object.assign(error, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}
