const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const { hasOwnProperty } = Object.prototype;
const { fromString, fromArrayBuffer } = require("@smithy/util-buffer-from");
const { toUint8Array } = require("@smithy/util-utf8");
const { Buffer } = require("buffer");
const { createHmac, createHash } = require("crypto");

const defineProp = (target, key, desc) => defineProperty(target, key, desc);
const getOwnPropDesc = (obj, key) => getOwnPropertyDescriptor(obj, key);
const getOwnPropNames = (obj) => getOwnPropertyNames(obj);
const hasOwnProp = (obj, prop) => hasOwnProperty.call(obj, prop);

const setFunctionName = (fn, name) => defineProp(fn, "name", { value: name, configurable: true });

const exportModule = (target, exports) => {
  for (const key in exports) {
    defineProp(target, key, { get: exports[key], enumerable: true });
  }
};

const copyProperties = (target, source, exclude, desc) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getOwnPropNames(source)) {
      if (!hasOwnProp(target, key) && key !== exclude) {
        defineProp(target, key, { 
          get: () => source[key], 
          enumerable: !(desc = getOwnPropDesc(source, key)) || desc.enumerable 
        });
      }
    }
  }
  return target;
};

const toCommonJSModule = (module) => copyProperties(defineProp({}, "__esModule", { value: true }), module);

const srcExports = {};
exportModule(srcExports, {
  Hash: () => Hash
});
module.exports = toCommonJSModule(srcExports);

class Hash {
  constructor(algorithmIdentifier, secret) {
    this.algorithmIdentifier = algorithmIdentifier;
    this.secret = secret;
    this.reset();
  }

  update(data, encoding) {
    this.hash.update(toUint8Array(castSourceData(data, encoding)));
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
setFunctionName(Hash, "Hash");

function castSourceData(data, encoding) {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (typeof data === "string") {
    return fromString(data, encoding);
  }
  if (ArrayBuffer.isView(data)) {
    return fromArrayBuffer(data.buffer, data.byteOffset, data.byteLength);
  }
  return fromArrayBuffer(data);
}
setFunctionName(castSourceData, "castSourceData");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Hash
});
