const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: { hasOwnProperty } } = Object;
const { createHash, createHmac } = require("crypto");
const { Buffer } = require("buffer");
const { fromString, fromArrayBuffer } = require("@smithy/util-buffer-from");
const { toUint8Array } = require("@smithy/util-utf8");

function name(target, value) {
  defineProperty(target, "name", { value, configurable: true });
}

function exportModule(target, all) {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProps(to, from, except, desc) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProps(defineProperty({}, "__esModule", { value: true }), mod);
}

const srcExports = {};
exportModule(srcExports, { Hash });

module.exports = toCommonJS(srcExports);

class _Hash {
  constructor(algorithm, secret) {
    this.algorithmIdentifier = algorithm;
    this.secret = secret;
    this.reset();
  }

  update(toHash, encoding) {
    this.hash.update(toUint8Array(castSourceData(toHash, encoding)));
  }

  digest() {
    return Promise.resolve(this.hash.digest());
  }

  reset() {
    this.hash = this.secret
      ? createHmac(this.algorithmIdentifier, castSourceData(this.secret))
      : createHash(this.algorithmIdentifier);
  }
}

name(_Hash, "Hash");
const Hash = _Hash;

function castSourceData(toCast, encoding) {
  if (Buffer.isBuffer(toCast)) return toCast;
  if (typeof toCast === "string") return fromString(toCast, encoding);
  if (ArrayBuffer.isView(toCast)) return fromArrayBuffer(toCast.buffer, toCast.byteOffset, toCast.byteLength);
  return fromArrayBuffer(toCast);
}

name(castSourceData, "castSourceData");

0 && (module.exports = { Hash });
