"use strict";

// Utility for generating exceptions with a custom message.
function createException(ErrorType, message, options) {
  if (options.globals) {
    ErrorType = options.globals[ErrorType.name];
  }
  return new ErrorType(`${options.context || "Value"} ${message}.`);
}

// Convert value to number, handling BigInt and globals if necessary.
function toNumber(value, options) {
  if (typeof value === "bigint") {
    throw createException(TypeError, "is a BigInt which cannot be converted to a number", options);
  }
  return options.globals ? options.globals.Number(value) : Number(value);
}

// Round to nearest integer, preferring even integers on ties.
function evenRound(x) {
  if ((x > 0 && (x % 1) === +0.5 && (x & 1) === 0) ||
      (x < 0 && (x % 1) === -0.5 && (x & 1) === 1)) {
    return censorNegativeZero(Math.floor(x));
  }
  return censorNegativeZero(Math.round(x));
}

// Return the integer part of a number without -0.
function integerPart(n) {
  return censorNegativeZero(Math.trunc(n));
}

// Return the sign of the number.
function sign(x) {
  return x < 0 ? -1 : 1;
}

// Calculate x modulo y with sign correction.
function modulo(x, y) {
  const result = x % y;
  return sign(y) !== sign(result) ? result + y : result;
}

// Convert -0 to +0.
function censorNegativeZero(x) {
  return x === 0 ? 0 : x;
}

// Create a function for integer conversion based on bit length and signedness.
function createIntegerConversion(bitLength, { unsigned }) {
  const lowerBound = unsigned ? 0 : -(2 ** (bitLength - 1));
  const upperBound = unsigned ? 2 ** bitLength - 1 : 2 ** (bitLength - 1) - 1;

  return (value, options = {}) => {
    let x = toNumber(value, options);
    x = censorNegativeZero(x);

    if (options.enforceRange) {
      if (!Number.isFinite(x)) {
        throw createException(TypeError, "is not a finite number", options);
      }
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw createException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
      }
      return x;
    }

    if (!Number.isNaN(x) && options.clamp) {
      x = evenRound(Math.min(Math.max(x, lowerBound), upperBound));
    } else if (!Number.isFinite(x) || x === 0) {
      return 0;
    } else {
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        x = modulo(x, 2 ** bitLength);
        if (!unsigned && x >= 2 ** (bitLength - 1)) {
          x -= 2 ** bitLength;
        }
      }
    }
    return x;
  };
}

// Create a function for long long conversion with handling for BigInt.
function createLongLongConversion(bitLength, { unsigned }) {
  const upperBound = Number.MAX_SAFE_INTEGER;
  const lowerBound = unsigned ? 0 : Number.MIN_SAFE_INTEGER;

  return (value, options = {}) => {
    let x = toNumber(value, options);
    x = censorNegativeZero(x);
    const asBigInt = unsigned ? BigInt.asUintN : BigInt.asIntN;

    if (options.enforceRange) {
      if (!Number.isFinite(x)) {
        throw createException(TypeError, "is not a finite number", options);
      }
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw createException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
      }
    } else if (!Number.isNaN(x) && options.clamp) {
      x = evenRound(Math.min(Math.max(x, lowerBound), upperBound));
    } else if (!Number.isFinite(x) || x === 0) {
      return 0;
    } else {
      let xBigInt = BigInt(integerPart(x));
      xBigInt = asBigInt(bitLength, xBigInt);
      return Number(xBigInt);
    }
    return x;
  };
}

// Exported conversion functions for various types.
exports.any = value => value;
exports.undefined = () => undefined;
exports.boolean = value => Boolean(value);

exports.byte = createIntegerConversion(8, { unsigned: false });
exports.octet = createIntegerConversion(8, { unsigned: true });

exports.short = createIntegerConversion(16, { unsigned: false });
exports["unsigned short"] = createIntegerConversion(16, { unsigned: true });

exports.long = createIntegerConversion(32, { unsigned: false });
exports["unsigned long"] = createIntegerConversion(32, { unsigned: true });

exports["long long"] = createLongLongConversion(64, { unsigned: false });
exports["unsigned long long"] = createLongLongConversion(64, { unsigned: true });

exports.double = (value, options = {}) => {
  const x = toNumber(value, options);
  if (!Number.isFinite(x)) {
    throw createException(TypeError, "is not a finite floating-point value", options);
  }
  return x;
};

exports["unrestricted double"] = (value, options = {}) => toNumber(value, options);

exports.float = (value, options = {}) => {
  const x = toNumber(value, options);
  if (!Number.isFinite(x)) {
    throw createException(TypeError, "is not a finite floating-point value", options);
  }
  if (Object.is(x, -0)) {
    return x;
  }
  const y = Math.fround(x);
  if (!Number.isFinite(y)) {
    throw createException(TypeError, "is outside the range of a single-precision floating-point value", options);
  }
  return y;
};

exports["unrestricted float"] = (value, options = {}) => {
  const x = toNumber(value, options);
  return Object.is(x, -0) || isNaN(x) ? x : Math.fround(x);
};

// Convert to DOMString, handling symbols and nulls as per options.
exports.DOMString = (value, options = {}) => {
  if (options.treatNullAsEmptyString && value === null) {
    return "";
  }
  if (typeof value === "symbol") {
    throw createException(TypeError, "is a symbol, which cannot be converted to a string", options);
  }
  const StringCtor = options.globals ? options.globals.String : String;
  return StringCtor(value);
};

// Convert to ByteString, ensuring each character code point fits within the byte range.
exports.ByteString = (value, options = {}) => {
  const str = exports.DOMString(value, options);
  for (let i = 0; i < str.length; i++) {
    if (str.codePointAt(i) > 255) {
      throw createException(TypeError, "is not a valid ByteString", options);
    }
  }
  return str;
};

// Convert to USVString, replacing invalid UTF-16 units with the replacement character.
exports.USVString = (value, options = {}) => {
  const str = exports.DOMString(value, options);
  const result = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i < str.length - 1) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xDC00 && next <= 0xDFFF) {
        result.push(String.fromCodePoint(0x10000 + ((code & 0x3FF) << 10) + (next & 0x3FF)));
        i++;
        continue;
      }
    }
    result.push(String.fromCodePoint(code >= 0xD800 && code <= 0xDFFF ? 0xFFFD : code));
  }
  return result.join("");
};

// Ensure the value is an object or function, otherwise throw an exception.
exports.object = (value, options = {}) => {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) {
    throw createException(TypeError, "is not an object", options);
  }
  return value;
};

// Descriptor getters for validating ArrayBuffer and DataView types.
const abByteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
const sabByteLengthGetter = typeof SharedArrayBuffer === "function" ?
  Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get : null;

// Check if value is a non-shared ArrayBuffer.
function isNonSharedArrayBuffer(value) {
  try {
    abByteLengthGetter.call(value);
    return true;
  } catch {
    return false;
  }
}

// Check if value is a SharedArrayBuffer.
function isSharedArrayBuffer(value) {
  try {
    sabByteLengthGetter.call(value);
    return true;
  } catch {
    return false;
  }
}

// Check if an ArrayBuffer is detached.
function isArrayBufferDetached(value) {
  try {
    new Uint8Array(value);
    return false;
  } catch {
    return true;
  }
}

// Validate ArrayBuffer with optional shared support.
exports.ArrayBuffer = (value, options = {}) => {
  if (!isNonSharedArrayBuffer(value)) {
    if (options.allowShared && !isSharedArrayBuffer(value)) {
      throw createException(TypeError, "is not an ArrayBuffer or SharedArrayBuffer", options);
    }
    throw createException(TypeError, "is not an ArrayBuffer", options);
  }
  if (isArrayBufferDetached(value)) {
    throw createException(TypeError, "is a detached ArrayBuffer", options);
  }
  return value;
};

// Descriptor getter for validating DataView types.
const dvByteLengthGetter = Object.getOwnPropertyDescriptor(DataView.prototype, "byteLength").get;

// Validate DataView, ensuring no backing SharedArrayBuffer unless allowed.
exports.DataView = (value, options = {}) => {
  try {
    dvByteLengthGetter.call(value);
  } catch {
    throw createException(TypeError, "is not a DataView", options);
  }
  if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
    throw createException(TypeError, "is backed by a SharedArrayBuffer, which is not allowed", options);
  }
  if (isArrayBufferDetached(value.buffer)) {
    throw createException(TypeError, "is backed by a detached ArrayBuffer", options);
  }
  return value;
};

// Return the name of a TypedArray constructor, or undefined if invalid.
const typedArrayNameGetter = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array).prototype,
  Symbol.toStringTag
).get;

// Validate each TypedArray type with shared buffer support sensitivity.
[
  Int8Array, Int16Array, Int32Array,
  Uint8Array, Uint16Array, Uint32Array,
  Uint8ClampedArray,
  Float32Array, Float64Array
].forEach(TypedArrayClass => {
  const { name } = TypedArrayClass;
  const article = /^[AEIOU]/u.test(name) ? "an" : "a";
  exports[name] = (value, options = {}) => {
    if (!ArrayBuffer.isView(value) || typedArrayNameGetter.call(value) !== name) {
      throw createException(TypeError, `is not ${article} ${name} object`, options);
    }
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
      throw createException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
    }
    if (isArrayBufferDetached(value.buffer)) {
      throw createException(TypeError, "is a view on a detached ArrayBuffer", options);
    }
    return value;
  };
});

// Validate a view on an ArrayBuffer with shared buffer constraints.
exports.ArrayBufferView = (value, options = {}) => {
  if (!ArrayBuffer.isView(value)) {
    throw createException(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", options);
  }
  if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
    throw createException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
  }
  if (isArrayBufferDetached(value.buffer)) {
    throw createException(TypeError, "is a view on a detached ArrayBuffer", options);
  }
  return value;
};

// Validate BufferSource type with conditions for shared and detached buffers.
exports.BufferSource = (value, options = {}) => {
  if (ArrayBuffer.isView(value)) {
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
      throw createException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
    }
    if (isArrayBufferDetached(value.buffer)) {
      throw createException(TypeError, "is a view on a detached ArrayBuffer", options);
    }
    return value;
  }

  const isValidNonSharedAB = isNonSharedArrayBuffer(value);
  const isValidSharedAB = options.allowShared && isSharedArrayBuffer(value);

  if (!options.allowShared && !isValidNonSharedAB) {
    throw createException(TypeError, "is not an ArrayBuffer or a view on one", options);
  }
  if (!isValidSharedAB && !isValidNonSharedAB) {
    throw createException(TypeError, "is not an ArrayBuffer, SharedArrayBuffer, or a view on one", options);
  }
  if (isArrayBufferDetached(value)) {
    throw createException(TypeError, "is a detached ArrayBuffer", options);
  }

  return value;
};

// Define DOMTimeStamp as "unsigned long long".
exports.DOMTimeStamp = exports["unsigned long long"];
