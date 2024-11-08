const { fromString, fromArrayBuffer } = require("@smithy/util-buffer-from");

// Helper functions for managing properties and modules
function setConfigurableName(target, value) {
  Object.defineProperty(target, "name", { value, configurable: true });
}

function exportFunctions(target, functions) {
  Object.keys(functions).forEach(name => {
    Object.defineProperty(target, name, { get: functions[name], enumerable: true });
  });
}

function copyProperties(target, source, exception) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    Object.getOwnPropertyNames(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key) && key !== exception) {
        Object.defineProperty(target, key, {
          get: () => source[key],
          enumerable: Object.getOwnPropertyDescriptor(source, key)?.enumerable ?? true
        });
      }
    });
  }
  return target;
}

function toCommonJSModule(mod) {
  return copyProperties(Object.defineProperty({}, "__esModule", { value: true }), mod);
}

// UTF-8 utility functions
function fromUtf8(input) {
  const buf = fromString(input, "utf8");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength / Uint8Array.BYTES_PER_ELEMENT);
}
setConfigurableName(fromUtf8, "fromUtf8");

function toUint8Array(data) {
  if (typeof data === "string") {
    return fromUtf8(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}
setConfigurableName(toUint8Array, "toUint8Array");

function toUtf8(input) {
  if (typeof input === "string") {
    return input;
  }
  if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
    throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
  }
  return fromArrayBuffer(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
}
setConfigurableName(toUtf8, "toUtf8");

// Exporting the functions
const srcExports = {};
exportFunctions(srcExports, { fromUtf8, toUint8Array, toUtf8 });

module.exports = toCommonJSModule(srcExports);
