"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.declare = declare;

function declare(builder) {
  return (api, options, dirname) => {
    if (!api.assertVersion) {
      api = {
        ...copyApiObject(api),
        assertVersion(range) {
          throwVersionError(range, api.version);
        },
      };
    }
    return builder(api, options || {}, dirname);
  };
}

function copyApiObject(api) {
  let proto = null;
  if (typeof api.version === "string" && api.version.startsWith("7.")) {
    proto = Object.getPrototypeOf(api);
    if (proto && !["version", "transform", "template", "types"].every(key => has(proto, key))) {
      proto = null;
    }
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
  } else if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  const originalLimit = Error.stackTraceLimit;
  if (typeof originalLimit === "number" && originalLimit < 25) {
    Error.stackTraceLimit = 25;
  }

  const err = new Error(
    version.startsWith("7.")
      ? `Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". Update your @babel/core version.`
      : `Requires Babel "${range}", but was loaded with "${version}". Check for a misconfigured build process.`
  );

  if (typeof originalLimit === "number") {
    Error.stackTraceLimit = originalLimit;
  }

  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}
