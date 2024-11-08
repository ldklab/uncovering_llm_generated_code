const { fromString, fromArrayBuffer } = require("@smithy/util-buffer-from");
const { toUint8Array } = require("@smithy/util-utf8");
const { Buffer } = require("buffer");
const { createHash, createHmac } = require("crypto");

// Define utility functions for exporting and defining properties
function defineProp(target, name, descriptor) {
  Object.defineProperty(target, name, descriptor);
}

function copyProps(target, source, except) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    Object.getOwnPropertyNames(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key) && key !== except) {
        const desc = Object.getOwnPropertyDescriptor(source, key);
        defineProp(target, key, { 
          get: () => source[key], 
          enumerable: !desc || desc.enumerable 
        });
      }
    });
  }
  return target;
}

function toCommonJS(mod) {
  return copyProps(Object.defineProperty({}, "__esModule", { value: true }), mod);
}

// Hash class for hash computation
class Hash {
  constructor(algorithmIdentifier, secret) {
    this.algorithmIdentifier = algorithmIdentifier;
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

// Data casting function
function castSourceData(toCast, encoding) {
  if (Buffer.isBuffer(toCast)) return toCast;
  if (typeof toCast === "string") return fromString(toCast, encoding);
  if (ArrayBuffer.isView(toCast)) {
    return fromArrayBuffer(toCast.buffer, toCast.byteOffset, toCast.byteLength);
  }
  return fromArrayBuffer(toCast);
}

// Export Hash class
module.exports = toCommonJS({ Hash });
