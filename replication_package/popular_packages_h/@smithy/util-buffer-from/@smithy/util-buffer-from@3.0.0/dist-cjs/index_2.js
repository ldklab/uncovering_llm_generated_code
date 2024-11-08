const { isArrayBuffer } = require("@smithy/is-array-buffer");
const { Buffer } = require("buffer");

function defineProp(target, key, descriptor) {
  return Object.defineProperty(target, key, descriptor);
}

function getPropertyDesc(obj, key) {
  return Object.getOwnPropertyDescriptor(obj, key);
}

function getOwnPropertyNames(obj) {
  return Object.getOwnPropertyNames(obj);
}

function hasOwnProp(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function nameFunction(target, value) {
  return defineProp(target, "name", { value, configurable: true });
}

function exportFunctions(target, functions) {
  for (const name in functions) {
    defineProp(target, name, { get: functions[name], enumerable: true });
  }
}

function copyProps(to, from, except) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProp(to, key) && key !== except) {
        const desc = getPropertyDesc(from, key);
        defineProp(to, key, { get: () => from[key], enumerable: !desc || desc.enumerable });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  const exportObj = defineProp({}, "__esModule", { value: true });
  return copyProps(exportObj, mod);
}

const fromArrayBuffer = nameFunction((input, offset = 0, length = input.byteLength - offset) => {
  if (!isArrayBuffer(input)) {
    throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
  }
  return Buffer.from(input, offset, length);
}, "fromArrayBuffer");

const fromString = nameFunction((input, encoding) => {
  if (typeof input !== "string") {
    throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
  }
  return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
}, "fromString");

const srcExports = {};
exportFunctions(srcExports, {
  fromArrayBuffer: () => fromArrayBuffer,
  fromString: () => fromString
});

module.exports = toCommonJS(srcExports);
