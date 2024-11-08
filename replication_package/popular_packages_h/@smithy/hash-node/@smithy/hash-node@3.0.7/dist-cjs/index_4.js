const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: { hasOwnProperty } } = Object;
const { Buffer } = require("buffer");
const { createHash, createHmac } = require("crypto");
const { fromString, fromArrayBuffer } = require("@smithy/util-buffer-from");
const { toUint8Array } = require("@smithy/util-utf8");

const setPropName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportProps = (target, props) => {
  for (const name in props) {
    defineProperty(target, name, { get: props[name], enumerable: true });
  }
};
const copyProperties = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      const desc = getOwnPropertyDescriptor(from, key);
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !desc || desc.enumerable });
      }
    }
  }
  return to;
};
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

class HashClass {
  constructor(algorithmIdentifier, secret) {
    this.algorithmIdentifier = algorithmIdentifier;
    this.secret = secret;
    this.reset();
  }
  
  update(toHash, encoding) {
    this.hash.update(toUint8Array(this.castSourceData(toHash, encoding)));
  }

  digest() {
    return Promise.resolve(this.hash.digest());
  }

  reset() {
    this.hash = this.secret 
      ? createHmac(this.algorithmIdentifier, this.castSourceData(this.secret)) 
      : createHash(this.algorithmIdentifier);
  }
  
  castSourceData(toCast, encoding) {
    if (Buffer.isBuffer(toCast)) return toCast;
    if (typeof toCast === "string") return fromString(toCast, encoding);
    if (ArrayBuffer.isView(toCast)) {
      return fromArrayBuffer(toCast.buffer, toCast.byteOffset, toCast.byteLength);
    }
    return fromArrayBuffer(toCast);
  }
}

setPropName(HashClass, "Hash");

const mod_exports = { Hash: HashClass };
exportProps(mod_exports, { Hash: () => HashClass });
module.exports = toCommonJS(mod_exports);

0 && (module.exports = { Hash: HashClass });
