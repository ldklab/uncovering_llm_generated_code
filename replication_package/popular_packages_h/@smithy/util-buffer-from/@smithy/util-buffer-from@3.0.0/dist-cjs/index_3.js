const { isArrayBuffer } = require("@smithy/is-array-buffer");
const { Buffer } = require("buffer");

function defineName(target, name) {
  Object.defineProperty(target, "name", { value: name, configurable: true });
}

function fromArrayBuffer(input, offset = 0, length = input.byteLength - offset) {
  if (!isArrayBuffer(input)) {
    throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
  }
  return Buffer.from(input, offset, length);
}

defineName(fromArrayBuffer, "fromArrayBuffer");

function fromString(input, encoding) {
  if (typeof input !== "string") {
    throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
  }
  return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
}

defineName(fromString, "fromString");

module.exports = {
  fromArrayBuffer,
  fromString
};
