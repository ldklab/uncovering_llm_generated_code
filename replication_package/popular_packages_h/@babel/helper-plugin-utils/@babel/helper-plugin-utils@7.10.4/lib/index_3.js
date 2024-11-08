"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.declare = declare;

function declare(builder) {
  return (api, options, dirname) => {
    if (!api.assertVersion) {
      api = Object.assign(copyApiObject(api), {
        assertVersion: function(range) {
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

    if (proto && (!has(proto, "version") || !has(proto, "transform") || !has(proto, "template") || !has(proto, "types"))) {
      proto = null;
    }
  }

  return Object.assign({}, proto, api);
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

  const limit = Error.stackTraceLimit;

  if (typeof limit === "number" && limit < 25) {
    Error.stackTraceLimit = 25;
  }

  let err;

  if (version.startsWith("7.")) {
    err = new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". Update your @babel/core version.`);
  } else {
    err = new Error(`Requires Babel "${range}", but was loaded with "${version}". Check error stack for version mismatch.`);
  }

  if (typeof limit === "number") {
    Error.stackTraceLimit = limit;
  }

  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}
