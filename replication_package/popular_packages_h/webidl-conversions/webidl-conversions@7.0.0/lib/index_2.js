"use strict";

// Creates an exception with the specified error type and message.
function makeException(ErrorType, message, options) {
  if (options.globals) {
    ErrorType = options.globals[ErrorType.name];
  }
  return new ErrorType(`${options.context ? options.context : "Value"} ${message}.`);
}

// Converts a value to a number if possible, throwing for BigInt if options specified.
function toNumber(value, options) {
  if (typeof value === "bigint") {
    throw makeException(TypeError, "is a BigInt which cannot be converted to a number", options);
  }
  return (options.globals ? options.globals.Number : Number)(value);
}

// Rounds a number, using even rounding for .5
function evenRound(x) {
  if ((x > 0 && (x % 1) === 0.5 && (x & 1) === 0) || (x < 0 && (x % 1) === -0.5 && (x & 1) === 1)) {
    return censorNegativeZero(Math.floor(x));
  }
  return censorNegativeZero(Math.round(x));
}

// Various helper functions
function integerPart(n) { return censorNegativeZero(Math.trunc(n)); }
function sign(x) { return x < 0 ? -1 : 1; }
function modulo(x, y) {
  const mod = x % y;
  return sign(y) !== sign(mod) ? mod + y : mod;
}
function censorNegativeZero(x) { return x === 0 ? 0 : x; }

// Factory for integer conversion functions
function createIntegerConversion(bitLength, { unsigned }) {
  const lowerBound = unsigned ? 0 : -(2 ** (bitLength - 1));
  const upperBound = unsigned ? 2 ** bitLength - 1 : 2 ** (bitLength - 1) - 1;
  const twoToTheBitLength = 2 ** bitLength;

  return (value, options = {}) => {
    let x = toNumber(value, options);
    x = censorNegativeZero(x);

    if (options.enforceRange) {
      if (!Number.isFinite(x)) throw makeException(TypeError, "is not a finite number", options);
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw makeException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
      }
      return x;
    }

    if (!Number.isNaN(x) && options.clamp) {
      x = evenRound(Math.min(Math.max(x, lowerBound), upperBound));
      return x;
    }

    if (!Number.isFinite(x) || x === 0) return 0;
    x = integerPart(x);
    if (x >= lowerBound && x <= upperBound) return x;
    const modResult = modulo(x, twoToTheBitLength);
    if (!unsigned && modResult >= twoToTheBitLength / 2) {
      return modResult - twoToTheBitLength;
    }
    return modResult;
  };
}

// Factory for long long conversion
function createLongLongConversion(bitLength, { unsigned }) {
  const upperBound = Number.MAX_SAFE_INTEGER;
  const lowerBound = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
  const asBigIntN = unsigned ? BigInt.asUintN : BigInt.asIntN;

  return (value, options = {}) => {
    let x = toNumber(value, options);
    x = censorNegativeZero(x);

    if (options.enforceRange) {
      if (!Number.isFinite(x)) throw makeException(TypeError, "is not a finite number", options);
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw makeException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
      }
      return x;
    }

    if (!Number.isNaN(x) && options.clamp) {
      x = evenRound(Math.min(Math.max(x, lowerBound), upperBound));
      return x;
    }

    if (!Number.isFinite(x) || x === 0) return 0;
    let xBigInt = BigInt(integerPart(x));
    xBigInt = asBigIntN(bitLength, xBigInt);
    return Number(xBigInt);
  };
}

// Exported type conversion functions
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
  if (!Number.isFinite(x)) throw makeException(TypeError, "is not a finite floating-point value", options);
  return x;
};
exports["unrestricted double"] = (value, options = {}) => toNumber(value, options);
exports.float = (value, options = {}) => {
  const x = toNumber(value, options);
  if (!Number.isFinite(x)) throw makeException(TypeError, "is not a finite floating-point value", options);
  if (Object.is(x, -0)) return x;
  const y = Math.fround(x);
  if (!Number.isFinite(y)) throw makeException(TypeError, "is outside the range of a single-precision floating-point value", options);
  return y;
};
exports["unrestricted float"] = (value, options = {}) => {
  const x = toNumber(value, options);
  return isNaN(x) || Object.is(x, -0) ? x : Math.fround(x);
};

// String conversion functions
exports.DOMString = (value, options = {}) => {
  if (options.treatNullAsEmptyString && value === null) return "";
  if (typeof value === "symbol") throw makeException(TypeError, "is a symbol, which cannot be converted to a string", options);
  const StringCtor = options.globals ? options.globals.String : String;
  return StringCtor(value);
};
exports.ByteString = (value, options = {}) => {
  const x = exports.DOMString(value, options);
  for (let i = 0, c; (c = x.codePointAt(i)) !== undefined; ++i) {
    if (c > 255) throw makeException(TypeError, "is not a valid ByteString", options);
  }
  return x;
};
exports.USVString = (value, options = {}) => {
  const S = exports.DOMString(value, options);
  const n = S.length;
  const U = [];
  for (let i = 0; i < n; ++i) {
    const c = S.charCodeAt(i);
    if (c < 0xD800 || c > 0xDFFF) {
      U.push(String.fromCodePoint(c));
    } else if (0xDC00 <= c && c <= 0xDFFF) {
      U.push(String.fromCodePoint(0xFFFD));
    } else if (i === n - 1) {
      U.push(String.fromCodePoint(0xFFFD));
    } else {
      const d = S.charCodeAt(i + 1);
      if (0xDC00 <= d && d <= 0xDFFF) {
        const a = c & 0x3FF;
        const b = d & 0x3FF;
        U.push(String.fromCodePoint((2 << 15) + ((2 << 9) * a) + b));
        ++i;
      } else {
        U.push(String.fromCodePoint(0xFFFD));
      }
    }
  }
  return U.join("");
};

// Object and buffer type checks
exports.object = (value, options = {}) => {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) throw makeException(TypeError, "is not an object", options);
  return value;
};

const abByteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
const sabByteLengthGetter = typeof SharedArrayBuffer === "function" ? Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get : null;

function isNonSharedArrayBuffer(value) {
  try {
    abByteLengthGetter.call(value);
    return true;
  } catch {
    return false;
  }
}

function isSharedArrayBuffer(value) {
  try {
    sabByteLengthGetter.call(value);
    return true;
  } catch {
    return false;
  }
}

function isArrayBufferDetached(value) {
  try {
    new Uint8Array(value);
    return false;
  } catch {
    return true;
  }
}

exports.ArrayBuffer = (value, options = {}) => {
  if (!isNonSharedArrayBuffer(value)) {
    if (options.allowShared && !isSharedArrayBuffer(value)) throw makeException(TypeError, "is not an ArrayBuffer or SharedArrayBuffer", options);
    throw makeException(TypeError, "is not an ArrayBuffer", options);
  }
  if (isArrayBufferDetached(value)) throw makeException(TypeError, "is a detached ArrayBuffer", options);
  return value;
};

const dvByteLengthGetter = Object.getOwnPropertyDescriptor(DataView.prototype, "byteLength").get;
exports.DataView = (value, options = {}) => {
  try {
    dvByteLengthGetter.call(value);
  } catch (e) {
    throw makeException(TypeError, "is not a DataView", options);
  }

  if (!options.allowShared && isSharedArrayBuffer(value.buffer)) throw makeException(TypeError, "is backed by a SharedArrayBuffer, which is not allowed", options);
  if (isArrayBufferDetached(value.buffer)) throw makeException(TypeError, "is backed by a detached ArrayBuffer", options);

  return value;
};

const typedArrayNameGetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array).prototype, Symbol.toStringTag).get;
[
  Int8Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, Uint8ClampedArray, Float32Array, Float64Array
].forEach(func => {
  const { name } = func;
  const article = /^[AEIOU]/u.test(name) ? "an" : "a";
  exports[name] = (value, options = {}) => {
    if (!ArrayBuffer.isView(value) || typedArrayNameGetter.call(value) !== name) throw makeException(TypeError, `is not ${article} ${name} object`, options);
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
    if (isArrayBufferDetached(value.buffer)) throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
    return value;
  };
});

exports.ArrayBufferView = (value, options = {}) => {
  if (!ArrayBuffer.isView(value)) throw makeException(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", options);
  if (!options.allowShared && isSharedArrayBuffer(value.buffer)) throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
  if (isArrayBufferDetached(value.buffer)) throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
  return value;
};

exports.BufferSource = (value, options = {}) => {
  if (ArrayBuffer.isView(value)) {
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
    if (isArrayBufferDetached(value.buffer)) throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
    return value;
  }
  if (!options.allowShared && !isNonSharedArrayBuffer(value)) throw makeException(TypeError, "is not an ArrayBuffer or a view on one", options);
  if (options.allowShared && !isSharedArrayBuffer(value) && !isNonSharedArrayBuffer(value)) throw makeException(TypeError, "is not an ArrayBuffer, SharedArrayBuffer, or a view on one", options);
  if (isArrayBufferDetached(value)) throw makeException(TypeError, "is a detached ArrayBuffer", options);
  return value;
};

exports.DOMTimeStamp = exports["unsigned long long"];
